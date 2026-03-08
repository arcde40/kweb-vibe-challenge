package org.kweb.api.ai

import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.*
import io.ktor.server.sse.*
import io.ktor.sse.*
import kotlinx.coroutines.flow.collect
import org.koin.ktor.ext.inject
import org.kweb.api.ai.model.ReviewRequest
import org.kweb.api.challenge.ChallengeService
import kotlin.time.Duration.Companion.seconds

fun Route.aiRoutes() {
    val aiService: AIService by inject()
    val challengeService: ChallengeService by inject()

    sse("/ai/stream") {
        val prompt = call.request.queryParameters["prompt"] ?: return@sse
        val ticketId = call.request.queryParameters["ticketId"] ?: return@sse
        val fullResult = StringBuilder()

        heartbeat { period = 3.seconds }

        var firstChunk = true
        aiService.streamCompletion(prompt).collect { chunk ->
            if (firstChunk) {
                firstChunk = false
            }
            send(ServerSentEvent(data = chunk))
            fullResult.append(chunk)
        }
        send(ServerSentEvent(data = "[DONE]"))
        aiService.saveResult(ticketId, prompt, fullResult.toString())
    }

    post("/ai/review") {
        val request = call.receive<ReviewRequest>()
        val challenge = challengeService.getChallenge(request.challengeId)
            ?: return@post call.respond(HttpStatusCode.NotFound, "Challenge not found")
        val result = aiService.reviewCode(request.html, challenge)
        call.respond(HttpStatusCode.OK, result)
    }

    get("/ai/code/{ticketId}") {
        val ticketId = call.parameters["ticketId"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, "Missing ticketId")
        val code = aiService.getResultByTicketId(ticketId)
            ?: return@get call.respond(HttpStatusCode.NotFound, "Code not found")
        call.respond(HttpStatusCode.OK, mapOf("code" to code))
    }
}
