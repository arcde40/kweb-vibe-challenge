package org.kweb.api.ai

import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction

class AIRepository {
    suspend fun save(prompt: String, generatedHtml: String) =
        suspendTransaction {
            AIResultTable.insert {
                it[AIResultTable.prompt] = prompt
                it[AIResultTable.generatedHtml] = generatedHtml
                it[AIResultTable.createdAt] = System.currentTimeMillis()
            }
        }
}