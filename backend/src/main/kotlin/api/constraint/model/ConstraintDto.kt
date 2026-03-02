package org.kweb.api.constraint.model

import org.jetbrains.exposed.v1.core.ResultRow

data class ConstraintDto(
    val id: Int,
    val letters: Int,
    val excludedLetters: List<String>,
    val includedWords: List<String>,
)
