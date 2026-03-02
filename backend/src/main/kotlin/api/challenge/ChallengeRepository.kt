package org.kweb.api.challenge

import org.jetbrains.exposed.v1.core.Random
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.SortOrder
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction
import org.kweb.api.challenge.model.ChallengeDto
import org.kweb.api.constraint.ConstraintTable
import org.kweb.api.constraint.toConstraintDto

class ChallengeRepository {
    suspend fun findRandom(): ChallengeDto? =
        suspendTransaction {
            (ChallengeTable innerJoin ConstraintTable)
                .selectAll()
                .orderBy(Random())
                .limit(1)
                .singleOrNull()
                ?.toChallengeDto()
        }

    suspend fun findAll(): List<ChallengeDto> =
        suspendTransaction {
            (ChallengeTable innerJoin ConstraintTable)
                .selectAll()
                .orderBy(ChallengeTable.id, SortOrder.ASC)
                .map { it.toChallengeDto() }
        }

    fun ResultRow.toChallengeDto(): ChallengeDto =
        ChallengeDto(
            id = this[ChallengeTable.id].value,
            description = this[ChallengeTable.description],
            title = this[ChallengeTable.title],
            imageUrl = this[ChallengeTable.imageUrl],
            constraint = this.toConstraintDto(),
        )
}
