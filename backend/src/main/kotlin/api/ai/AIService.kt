package org.kweb.api.ai

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.utils.io.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.channelFlow
import kotlinx.coroutines.flow.flow
import org.kweb.api.ai.model.ReviewResponse
import org.kweb.api.challenge.model.ChallengeDto

import org.slf4j.LoggerFactory

private const val GOOGLE_API_KEY_HEADER = "x-goog-api-key"
private const val GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
private const val REVIEW_SYSTEM_PROMPT = """You are a web app judge in a competitive vibe coding challenge.
You will receive HTML/CSS/JS code and a list of criteria.

Scoring breakdown (total 100):
- Functionality (40pt): Does it actually work as required?
- Visual polish (30pt): Layout, colors, animations, overall aesthetics
- Creativity (10pt): Unique ideas, interactions, or presentation
- Topic relevance (20pt): Does the result match the challenge theme?

Criteria handling:
Each criterion must be explicitly checked.
Failing a criterion deducts 10-15 points.

Score reference: 0-20 broken, 21-40 basic with clear issues,
41-60 meets requirements but unremarkable,
61-80 solid and well-executed, 81-100 exceptional.
A submission that meets all criteria and works correctly should score at least 60.
Most submissions fall between 55-80. Be fair but reward working implementations generously.

Always write in Korean."""

class AIService(
    private val aiRepository: AIRepository,
) {
    private val client =
        HttpClient(CIO) {
            engine {
                requestTimeout = 0 // 0 = no timeout
            }
        }
    private val apiKey = System.getenv("GEMINI_API_KEY") ?: error("GOOGLE_API_KEY env variable missing")
    private val logger = LoggerFactory.getLogger(AIService::class.java)
    private val mapper = jacksonObjectMapper()

    fun streamCompletion(prompt: String): Flow<String> =
        channelFlow {
            client
                .preparePost(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?alt=sse",
                ) {
                    contentType(ContentType.Application.Json)
                    headers {
                        append(GOOGLE_API_KEY_HEADER, apiKey)
                        append(HttpHeaders.AcceptEncoding, "identity")
                    }
                    setBody(buildRequestBody(prompt))
                }.execute { response ->
                    if (response.status != HttpStatusCode.OK) {
                        val body = response.bodyAsText()
                        logger.error("Gemini API error ${response.status}: $body")
                        error("Gemini API call failed with ${response.status}")
                    }

                    val channel: ByteReadChannel = response.bodyAsChannel()
                    var fenceStripped = false
                    var lastRawJson: String? = null
                    try {
                        while (!channel.isClosedForRead) {
                            val line = channel.readLineStrict() ?: break
                            if (line.startsWith("data: ")) {
                                val rawJson = line.removePrefix("data: ")
                                lastRawJson = rawJson
                                var text = extractText(rawJson) ?: continue
                                // Remove AI generated code block (```html)
                                if (!fenceStripped) {
                                    text = text.removePrefix("```html\n").removePrefix("```\n")
                                    fenceStripped = true
                                }
                                if (text == "```" || text.isBlank()) continue
                                logger.debug("[${System.currentTimeMillis()}] chunk(${text.length}): ${text.take(30)}")
                                send(text)
                            }
                        }
                    } catch (_: java.io.EOFException) {
                        logger.debug("Stream ended")
                    }
                    lastRawJson?.let { logUsage("stream", mapper.readTree(it)) }
                }
        }

    suspend fun saveResult(
        ticketId: String,
        prompt: String,
        generatedHtml: String,
    ) = aiRepository.save(ticketId, prompt, generatedHtml)

    suspend fun getResultByTicketId(ticketId: String): String? = aiRepository.findByTicketId(ticketId)

    private fun buildRequestBody(prompt: String) =
        """
        {
          "system_instruction": {
            "parts": [{ "text": "Output ONLY a raw HTML file with embedded CSS and JS. No markdown, no explanation. Do NOT use any external resources(images, video etc)." }]
          },
          "contents": [{ "parts": [{ "text": "${prompt.replace("\"", "\\\"")}" }] }],
          "generationConfig": { "maxOutputTokens": 8192, "temperature": 1.0 }
        }
        """.trimIndent()

    private fun extractText(json: String): String? {
        val match = Regex(""""text":\s*"((?:[^"\\]|\\.)*)"""").find(json)
        return match
            ?.groupValues
            ?.get(1)
            ?.replace(Regex("""\\u([0-9a-fA-F]{4})""")) {
                it.groupValues[1]
                    .toInt(16)
                    .toChar()
                    .toString()
            }?.replace("\\n", "\n")
            ?.replace("\\\"", "\"")
            ?.replace("\\\\", "\\")
            ?.replace(Regex("""```(html)?"""), "")
    }

    suspend fun reviewCode(html: String, challenge: ChallengeDto): ReviewResponse {
        val c = challenge.constraint
        val constraintParts = buildList {
            add("Max letters in prompt: ${c.letters}")
            if (c.excludedLetters.isNotEmpty()) add("Excluded letters: ${c.excludedLetters.joinToString(", ")}")
            if (c.includedWords.isNotEmpty()) add("Required words: ${c.includedWords.joinToString(", ")}")
        }
        val criteriaText = challenge.criteria.joinToString("\n") { "- ${it.description}" }
        val userContent = """Challenge: ${challenge.title}
Description: ${challenge.description}
Prompt constraints the user had to follow:
${constraintParts.joinToString("\n")}
Criteria:
$criteriaText

HTML:
```html
$html
```"""

        val responseSchema = mapOf(
            "type" to "OBJECT",
            "properties" to mapOf(
                "score" to mapOf("type" to "INTEGER"),
                "overallFeedback" to mapOf("type" to "STRING"),
            ),
            "required" to listOf("score", "overallFeedback"),
        )

        val requestBody = mapper.writeValueAsString(
            mapOf(
                "system_instruction" to mapOf("parts" to listOf(mapOf("text" to REVIEW_SYSTEM_PROMPT))),
                "contents" to listOf(mapOf("parts" to listOf(mapOf("text" to userContent)))),
                "generationConfig" to mapOf(
                    "responseMimeType" to "application/json",
                    "responseSchema" to responseSchema,
                    "thinkingConfig" to mapOf("thinkingBudget" to 1024),
                    "maxOutputTokens" to 4096,
                    "temperature" to 0.1,
                ),
            ),
        )

        val responseText = client.post("$GEMINI_BASE/gemini-2.5-flash:generateContent") {
            contentType(ContentType.Application.Json)
            headers { append(GOOGLE_API_KEY_HEADER, apiKey) }
            setBody(requestBody)
        }.bodyAsText()

        val root = mapper.readTree(responseText)
        logUsage("review", root)
        val parts = root.path("candidates").path(0).path("content").path("parts")
        val text = parts.firstOrNull { !it.path("thought").asBoolean(false) }
            ?.path("text")?.asText()
            ?: error("No output from Gemini review: $responseText")

        return mapper.readValue(text)
    }

    private fun logUsage(label: String, root: com.fasterxml.jackson.databind.JsonNode) {
        val usage = root.path("usageMetadata")
        if (usage.isMissingNode) return
        val prompt = usage.path("promptTokenCount").asInt()
        val output = usage.path("candidatesTokenCount").asInt()
        val thinking = usage.path("thoughtsTokenCount").asInt(0)
        val total = usage.path("totalTokenCount").asInt()
        logger.info("[$label] tokens — prompt: $prompt, output: $output, thinking: $thinking, total: $total")
    }

    fun testStreamCompletion(prompt: String) =
        flow {
            repeat(6) {
                emit(prompt)
                delay(50)
            }
        }
}
