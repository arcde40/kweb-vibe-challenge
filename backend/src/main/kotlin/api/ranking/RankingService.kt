package org.kweb.api.ranking

import org.kweb.api.ranking.model.RankingEntryDto
import org.kweb.api.ranking.model.RankingSubmitRequest
import org.kweb.api.ranking.model.RankingSubmitResponse
import org.kweb.api.ranking.model.ScoredRankingEntryDto
import org.kweb.api.ranking.model.ScoredRankingSubmitRequest
import org.kweb.api.ranking.model.ScoredRankingSubmitResponse

class RankingService(private val repository: RankingRepository) {
    suspend fun submit(request: RankingSubmitRequest): RankingSubmitResponse =
        repository.submit(request.challengeId, request.ticketId, request.username, request.prompt)

    suspend fun getRanking(challengeId: Int): List<RankingEntryDto> =
        repository.findByChallengeId(challengeId)

    suspend fun submitScored(request: ScoredRankingSubmitRequest): ScoredRankingSubmitResponse =
        repository.submitScored(request.challengeId, request.ticketId, request.username, request.prompt, request.score)

    suspend fun getScoredRanking(challengeId: Int): List<ScoredRankingEntryDto> =
        repository.findScoredByChallengeId(challengeId)
}
