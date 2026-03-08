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
import org.kweb.api.ranking.model.ScoredRankingSubmitRequest

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
    route("/scored-ranking") {
        post {
            val request = call.receive<ScoredRankingSubmitRequest>()
            call.respond(HttpStatusCode.OK, rankingService.submitScored(request))
        }
        get("/{challengeId}") {
            val challengeId = call.parameters["challengeId"]?.toIntOrNull()
                ?: return@get call.respond(HttpStatusCode.BadRequest, "Invalid challengeId")
            call.respond(HttpStatusCode.OK, rankingService.getScoredRanking(challengeId))
        }
    }
}
