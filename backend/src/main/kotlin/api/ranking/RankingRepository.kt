package org.kweb.api.ranking

import org.jetbrains.exposed.v1.core.SortOrder
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction
import org.kweb.api.ranking.model.RankingEntryDto
import org.kweb.api.ranking.model.RankingSubmitResponse
import org.kweb.api.ranking.model.ScoredRankingEntryDto
import org.kweb.api.ranking.model.ScoredRankingSubmitResponse

class RankingRepository {
    suspend fun submit(
        challengeId: Int,
        ticketId: String,
        username: String,
        prompt: String,
    ): RankingSubmitResponse =
        suspendTransaction {
            val letterCount = prompt.count { it.isLetter() }
            RankingTable.insert {
                it[challenge] = challengeId
                it[this.ticketId] = ticketId
                it[this.username] = username
                it[this.prompt] = prompt
                it[this.letterCount] = letterCount
                it[createdAt] = System.currentTimeMillis()
            }

            val entries = entries(challengeId)
            val rank = entries.count { it.letterCount < letterCount } + 1
            RankingSubmitResponse(rank = rank, letterCount = letterCount, entries = entries.take(10))
        }

    suspend fun findByChallengeId(challengeId: Int): List<RankingEntryDto> = suspendTransaction { entries(challengeId) }

    suspend fun submitScored(
        challengeId: Int,
        ticketId: String,
        username: String,
        prompt: String,
        score: Int,
    ): ScoredRankingSubmitResponse =
        suspendTransaction {
            val letterCount = prompt.count { it.isLetter() }
            ScoredRankingTable.insert {
                it[challenge] = challengeId
                it[ScoredRankingTable.ticketId] = ticketId
                it[ScoredRankingTable.username] = username
                it[ScoredRankingTable.prompt] = prompt
                it[ScoredRankingTable.score] = score
                it[ScoredRankingTable.letterCount] = letterCount
                it[createdAt] = System.currentTimeMillis()
            }
            val all = scoredEntries(challengeId)
            val rank = all.count { it.score > score } + 1
            ScoredRankingSubmitResponse(rank = rank, score = score, letterCount = letterCount, entries = all.take(10))
        }

    suspend fun findScoredByChallengeId(challengeId: Int): List<ScoredRankingEntryDto> =
        suspendTransaction { scoredEntries(challengeId) }

    private fun scoredEntries(challengeId: Int): List<ScoredRankingEntryDto> =
        ScoredRankingTable
            .selectAll()
            .where { ScoredRankingTable.challenge eq challengeId }
            .orderBy(ScoredRankingTable.score, SortOrder.DESC)
            .orderBy(ScoredRankingTable.letterCount, SortOrder.ASC)
            .mapIndexed { index, row ->
                ScoredRankingEntryDto(
                    rank = index + 1,
                    ticketId = row[ScoredRankingTable.ticketId],
                    username = row[ScoredRankingTable.username],
                    prompt = row[ScoredRankingTable.prompt],
                    score = row[ScoredRankingTable.score],
                    letterCount = row[ScoredRankingTable.letterCount],
                    createdAt = row[ScoredRankingTable.createdAt],
                )
            }

    private fun entries(challengeId: Int): List<RankingEntryDto> =
        RankingTable
            .selectAll()
            .where { RankingTable.challenge eq challengeId }
            .orderBy(RankingTable.letterCount, SortOrder.ASC)
            .mapIndexed { index, row ->
                RankingEntryDto(
                    rank = index + 1,
                    ticketId = row[RankingTable.ticketId],
                    username = row[RankingTable.username],
                    prompt = row[RankingTable.prompt],
                    letterCount = row[RankingTable.letterCount],
                    createdAt = row[RankingTable.createdAt],
                )
            }
}
