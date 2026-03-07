package org.kweb.api.ranking

import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject
import org.kweb.api.ranking.model.RankingSubmitRequest

fun Route.rankingRoutes() {
    val rankingService: RankingService by inject()
    route("/ranking") {
        post {
            val request = call.receive<RankingSubmitRequest>()
            call.respond(HttpStatusCode.OK, rankingService.submit(request))
        }
        get("/{challengeId}") {
            val challengeId = call.parameters["challengeId"]?.toIntOrNull()
                ?: return@get call.respond(HttpStatusCode.BadRequest, "Invalid challengeId")
            call.respond(HttpStatusCode.OK, rankingService.getRanking(challengeId))
        }
    }
}
