package org.kweb.api.challenge

import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject

fun Route.challengeRoutes() {
    val challengeService: ChallengeService by inject()
    route("/challenges") {
        get("/random") {
            call.respond(HttpStatusCode.OK, challengeService.getRandomChallenge())
        }
        get {
            call.respond(HttpStatusCode.OK, challengeService.getChallenges())
        }
    }
}
