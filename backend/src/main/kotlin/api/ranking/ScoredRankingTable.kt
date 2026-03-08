package org.kweb.api.ranking

import org.jetbrains.exposed.v1.core.dao.id.LongIdTable
import org.kweb.api.challenge.ChallengeTable
import org.kweb.api.trial.TrialTable

object ScoredRankingTable : LongIdTable(name = "scored_ranking") {
    val challenge = reference("challenge_id", ChallengeTable)
    val ticketId = reference("ticket_id", TrialTable.ticketId)
    val username = varchar("username", 50)
    val prompt = text("prompt")
    val score = integer("score")
    val letterCount = integer("letter_count")
    val createdAt = long("created_at")
}
