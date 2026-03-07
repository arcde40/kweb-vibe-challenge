package org.kweb.api.ranking.model

data class RankingEntryDto(val rank: Int, val ticketId: String, val username: String, val letterCount: Int, val createdAt: Long)

data class RankingSubmitRequest(val challengeId: Int, val ticketId: String, val username: String, val letterCount: Int)

data class RankingSubmitResponse(val rank: Int, val letterCount: Int, val entries: List<RankingEntryDto>)
