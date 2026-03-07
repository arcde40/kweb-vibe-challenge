package org.kweb

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.plugins.NotFoundException
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.sse.*
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger
import org.kweb.api.ai.aiModule
import org.kweb.api.challenge.challengeModule
import org.kweb.api.ranking.rankingModule
import org.kweb.api.trial.trialModule

fun Application.configureFrameworks() {
    install(Koin) {
        slf4jLogger()
        modules(challengeModule, aiModule, rankingModule, trialModule)
    }

    install(SSE)

    install(StatusPages) {
        exception<NotFoundException> { call, cause ->
            call.respond(HttpStatusCode.NotFound, mapOf("error" to cause.message))
        }
    }
}
