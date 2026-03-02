package org.kweb.api.ai

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
import org.slf4j.LoggerFactory

private const val GOOGLE_API_KEY_HEADER = "x-goog-api-key"

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
                    try {
                        while (!channel.isClosedForRead) {
                            val line = channel.readLineStrict() ?: break
                            if (line.startsWith("data: ")) {
                                var text = extractText(line.removePrefix("data: ")) ?: continue
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
                }
        }

    suspend fun saveResult(
        prompt: String,
        generatedHtml: String,
    ) = aiRepository.save(prompt, generatedHtml)

    private fun buildRequestBody(prompt: String) =
        """
        {
          "system_instruction": {
            "parts": [{ "text": "Output ONLY a raw HTML file with embedded CSS and JS. No markdown, no explanation. Do NOT use any external resources(images, video etc)." }]
          },
          "contents": [{ "parts": [{ "text": "${prompt.replace("\"", "\\\"")}" }] }],
          "generationConfig": { "maxOutputTokens": 65536, "temperature": 1.8 }
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

    fun testStreamCompletion(prompt: String) =
        flow {
            repeat(6) {
                emit(prompt)
                delay(50)
            }
        }
}
