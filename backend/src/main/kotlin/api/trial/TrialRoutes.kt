package org.kweb.api.trial

import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject
import org.kweb.api.trial.model.TrialRequest

fun Route.trialRoutes() {
    val trialRepository: TrialRepository by inject()
    route("/trial") {
        post {
            val request = call.receive<TrialRequest>()
            call.respond(HttpStatusCode.Created, trialRepository.create(request.challengeId))
        }
    }
}
