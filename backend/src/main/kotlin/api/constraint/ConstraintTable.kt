package org.kweb.api.constraint

import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.dao.id.IntIdTable
import org.kweb.api.constraint.model.ConstraintDto

object ConstraintTable : IntIdTable(name = "constraint") {
    val letters = integer("letters")
    val excludedLetters = text("excluded_letters")
    val includedWords = text("included_words")
}

fun ResultRow.toConstraintDto(): ConstraintDto =
    ConstraintDto(
        id = this[ConstraintTable.id].value,
        letters = this[ConstraintTable.letters],
        excludedLetters = this[ConstraintTable.excludedLetters].split(","),
        includedWords = this[ConstraintTable.includedWords].split(","),
    )
