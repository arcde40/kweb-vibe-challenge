package org.kweb.api.trial

import org.jetbrains.exposed.v1.core.dao.id.LongIdTable
import org.kweb.api.challenge.ChallengeTable

object TrialTable : LongIdTable(name = "trial") {
    val ticketId = varchar("ticket_id", 36).uniqueIndex()
    val challenge = reference("challenge_id", ChallengeTable)
    val createdAt = long("created_at")
}
