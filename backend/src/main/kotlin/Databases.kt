package org.kweb

import io.ktor.server.application.*
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.SchemaUtils
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import org.kweb.api.ai.AIResultTable
import org.kweb.api.challenge.ChallengeTable
import org.kweb.api.constraint.ConstraintTable
import org.kweb.api.criteria.ChallengeCriteriaTable
import org.kweb.api.criteria.CriteriaTable
import org.kweb.api.ranking.RankingTable
import org.kweb.api.trial.TrialTable
import java.sql.DriverManager

fun Application.configureDatabases() {
    connectToMaria(false)
}

private const val DB_DRIVER_NAME = "org.mariadb.jdbc.Driver"

fun Application.connectToMaria(embedded: Boolean) {
    Class.forName(DB_DRIVER_NAME)
    if (embedded) {
        log.info("Using embedded H2 database; set embedded=false to use postgres")
        DriverManager.getConnection("jdbc:h2:mem:test;DB_CLOSE_DELAY=-1", "root", "")
    } else {
        val url = environment.config.property("mariadb.url").getString()
        val user = environment.config.property("mariadb.user").getString()
        val password = environment.config.property("mariadb.password").getString()
        log.info("Connecting to mariadb at $url")
        Database.connect(url, driver = DB_DRIVER_NAME, user = user, password = password)

        transaction {
            SchemaUtils.create(ConstraintTable, ChallengeTable, AIResultTable, CriteriaTable, ChallengeCriteriaTable, TrialTable, RankingTable)
        }
    }
}
