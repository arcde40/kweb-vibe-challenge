package org.kweb.api.challenge

import org.jetbrains.exposed.v1.core.dao.id.IntIdTable
import org.kweb.api.constraint.ConstraintTable

const val MAX_VARCHAR_LENGTH = 255

object ChallengeTable : IntIdTable(name = "challenge") {
    val title = varchar("title", MAX_VARCHAR_LENGTH)
    val description = text("description")
    val imageUrl = varchar("image_url", MAX_VARCHAR_LENGTH).nullable()
    val constraint = reference("constraint_id", ConstraintTable)
}
