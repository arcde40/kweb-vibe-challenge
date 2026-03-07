package org.kweb.api.ranking

import org.jetbrains.exposed.v1.core.dao.id.LongIdTable
import org.kweb.api.challenge.ChallengeTable

object RankingTable : LongIdTable(name = "ranking") {
    val challenge = reference("challenge_id", ChallengeTable)
    val ticketId = varchar("ticket_id", 36)
    val username = varchar("username", 50)
    val letterCount = integer("letter_count")
    val createdAt = long("created_at")
}
