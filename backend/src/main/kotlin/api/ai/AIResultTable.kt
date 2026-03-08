package org.kweb.api.ai

import org.jetbrains.exposed.v1.core.dao.id.IntIdTable
import org.kweb.api.trial.TrialTable

object AIResultTable : IntIdTable(name = "result") {
    val ticketId = reference("ticket_id", TrialTable.ticketId)
    val prompt = varchar("prompt", 50)
    val generatedHtml = text("generated_html")
    val createdAt = long("created_at")
}
