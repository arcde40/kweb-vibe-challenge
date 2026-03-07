package org.kweb.api.challenge

import org.jetbrains.exposed.v1.core.Random
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.SortOrder
import org.jetbrains.exposed.v1.core.inList
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction
import org.kweb.api.challenge.model.ChallengeDto
import org.kweb.api.constraint.ConstraintTable
import org.kweb.api.constraint.toConstraintDto
import org.kweb.api.criteria.ChallengeCriteriaTable
import org.kweb.api.criteria.CriteriaTable
import org.kweb.api.criteria.model.CriteriaDto
import org.kweb.api.criteria.toCriteriaDto

class ChallengeRepository {
    suspend fun findRandom(): ChallengeDto? =
        suspendTransaction {
            val row =
                (ChallengeTable innerJoin ConstraintTable)
                    .selectAll()
                    .orderBy(Random())
                    .limit(1)
                    .singleOrNull() ?: return@suspendTransaction null

            val challengeId = row[ChallengeTable.id].value
            val criteria = loadCriteria(listOf(challengeId))[challengeId] ?: emptyList()
            row.toChallengeDto(criteria)
        }

    suspend fun findAll(): List<ChallengeDto> =
        suspendTransaction {
            val rows =
                (ChallengeTable innerJoin ConstraintTable)
                    .selectAll()
                    .orderBy(ChallengeTable.id, SortOrder.ASC)
                    .toList()

            val criteriaByChallenge = loadCriteria(rows.map { it[ChallengeTable.id].value })

            rows.map { row ->
                val challengeId = row[ChallengeTable.id].value
                row.toChallengeDto(criteriaByChallenge[challengeId] ?: emptyList())
            }
        }

    private fun loadCriteria(challengeIds: List<Int>): Map<Int, List<CriteriaDto>> {
        if (challengeIds.isEmpty()) return emptyMap()

        return (ChallengeCriteriaTable innerJoin CriteriaTable)
            .selectAll()
            .where { ChallengeCriteriaTable.challenge inList challengeIds }
            .groupBy(
                keySelector = { it[ChallengeCriteriaTable.challenge].value },
                valueTransform = { it.toCriteriaDto() },
            )
    }

    fun ResultRow.toChallengeDto(criteria: List<CriteriaDto> = emptyList()): ChallengeDto =
        ChallengeDto(
            id = this[ChallengeTable.id].value,
            description = this[ChallengeTable.description],
            title = this[ChallengeTable.title],
            imageUrl = this[ChallengeTable.imageUrl],
            constraint = this.toConstraintDto(),
            criteria = criteria,
        )
}
