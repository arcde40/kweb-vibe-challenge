package org.kweb.api.challenge.model

import org.h2.constraint.Constraint
import org.kweb.api.constraint.model.ConstraintDto

data class ChallengeDto(
    val id: Int,
    val title: String,
    val description: String,
    val imageUrl: String? = null,
    val constraint: ConstraintDto,
)
