package org.kweb.api.ranking

import org.kweb.api.ranking.model.RankingEntryDto
import org.kweb.api.ranking.model.RankingSubmitRequest
import org.kweb.api.ranking.model.RankingSubmitResponse

class RankingService(private val repository: RankingRepository) {
    suspend fun submit(request: RankingSubmitRequest): RankingSubmitResponse =
        repository.submit(request.challengeId, request.ticketId, request.username, request.prompt)

    suspend fun getRanking(challengeId: Int): List<RankingEntryDto> =
        repository.findByChallengeId(challengeId)
}
