package org.kweb.api.trial

import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction
import org.kweb.api.trial.model.TrialDto
import java.util.UUID

class TrialRepository {
    suspend fun create(challengeId: Int): TrialDto =
        suspendTransaction {
            val ticketId = UUID.randomUUID().toString()
            TrialTable.insert {
                it[this.ticketId] = ticketId
                it[challenge] = challengeId
                it[createdAt] = System.currentTimeMillis()
            }
            TrialDto(ticketId = ticketId)
        }
}
