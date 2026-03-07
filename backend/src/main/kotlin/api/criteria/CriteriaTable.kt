package org.kweb.api.criteria

import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.dao.id.IntIdTable
import org.kweb.api.criteria.model.CriteriaDto

object CriteriaTable : IntIdTable(name = "criteria") {
    val description = varchar("description", 255)
}

fun ResultRow.toCriteriaDto() = CriteriaDto(
    id = this[CriteriaTable.id].value,
    description = this[CriteriaTable.description],
)
