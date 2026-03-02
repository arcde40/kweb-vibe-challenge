package org.kweb.api.ai

import org.jetbrains.exposed.v1.core.dao.id.IntIdTable

object AIResultTable : IntIdTable(name = "result") {
    val prompt = varchar("prompt", 50)
    val generatedHtml = text("generated_html")
    val createdAt = long("created_at")
}
