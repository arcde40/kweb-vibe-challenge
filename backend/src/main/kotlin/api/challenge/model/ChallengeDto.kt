package org.kweb.api.challenge.model

import org.kweb.api.constraint.model.ConstraintDto
import org.kweb.api.criteria.model.CriteriaDto

data class ChallengeDto(
    val id: Int,
    val title: String,
    val description: String,
    val imageUrl: String? = null,
    val constraint: ConstraintDto,
    val criteria: List<CriteriaDto> = emptyList(),
)
