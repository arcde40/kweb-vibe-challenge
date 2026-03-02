package org.kweb

import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.routing.*
import org.kweb.api.ai.aiRoutes
import org.kweb.api.challenge.challengeRoutes

fun Application.configureRouting() {
    routing {
        challengeRoutes()
        aiRoutes()
        staticResources("/static", "static")
    }
}
