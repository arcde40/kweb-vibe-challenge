package org.kweb.api.ranking.model

// Legacy (original ranking table, kept for historical data)
data class RankingEntryDto(val rank: Int, val ticketId: String, val username: String, val prompt: String, val letterCount: Int, val createdAt: Long)
data class RankingSubmitRequest(val challengeId: Int, val ticketId: String, val username: String, val prompt: String)
data class RankingSubmitResponse(val rank: Int, val letterCount: Int, val entries: List<RankingEntryDto>)

// Scored ranking (new table)
data class ScoredRankingSubmitRequest(val challengeId: Int, val ticketId: String, val username: String, val prompt: String, val score: Int)
data class ScoredRankingEntryDto(val rank: Int, val ticketId: String, val username: String, val prompt: String, val score: Int, val letterCount: Int, val createdAt: Long)
data class ScoredRankingSubmitResponse(val rank: Int, val score: Int, val letterCount: Int, val entries: List<ScoredRankingEntryDto>)
