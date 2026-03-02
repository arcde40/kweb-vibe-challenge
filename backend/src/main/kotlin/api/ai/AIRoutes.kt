package org.kweb.api.ai

import io.ktor.server.routing.*
import io.ktor.server.sse.*
import io.ktor.sse.*
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import org.koin.ktor.ext.inject

fun Route.aiRoutes() {
    val aiService: AIService by inject()

    sse("/ai/stream") {
        val prompt = call.request.queryParameters["prompt"] ?: return@sse
        val fullResult = StringBuilder()

        val heartbeatJob = launch {
            while (true) {
                send(ServerSentEvent(data = "", event = "heartbeat"))
                delay(3000)
            }
        }

        var firstChunk = true
        aiService.streamCompletion(prompt).collect { chunk ->
            if (firstChunk) {
                heartbeatJob.cancel()
                firstChunk = false
            }
            send(ServerSentEvent(data = chunk))
            fullResult.append(chunk)
        }

        heartbeatJob.cancelAndJoin()
        aiService.saveResult(prompt, fullResult.toString())
    }
}
