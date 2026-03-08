package org.kweb.api.ai

import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction

class AIRepository {
    suspend fun save(ticketId: String, prompt: String, generatedHtml: String) =
        suspendTransaction {
            AIResultTable.insert {
                it[AIResultTable.ticketId] = ticketId
                it[AIResultTable.prompt] = prompt.take(50)
                it[AIResultTable.generatedHtml] = generatedHtml
                it[AIResultTable.createdAt] = System.currentTimeMillis()
            }
        }

    suspend fun findByTicketId(ticketId: String): String? =
        suspendTransaction {
            AIResultTable
                .selectAll()
                .where { AIResultTable.ticketId eq ticketId }
                .firstOrNull()
                ?.get(AIResultTable.generatedHtml)
        }
}