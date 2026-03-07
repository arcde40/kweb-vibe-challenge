package org.kweb.api.criteria

import org.jetbrains.exposed.v1.core.Table
import org.kweb.api.challenge.ChallengeTable

object ChallengeCriteriaTable : Table(name = "challenge_criteria") {
    val challenge = reference("challenge_id", ChallengeTable)
    val criteria = reference("criteria_id", CriteriaTable)
    override val primaryKey = PrimaryKey(challenge, criteria)
}
