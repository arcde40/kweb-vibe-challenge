package org.kweb.api.challenge

import io.ktor.server.plugins.NotFoundException

class ChallengeService(
    private val challengeRepository: ChallengeRepository,
) {
    suspend fun getRandomChallenge() =
        challengeRepository.findRandom()
            ?: throw NotFoundException("Challenge not found")

    suspend fun getChallenge(id: Int) = challengeRepository.findById(id)

    suspend fun getChallenges() = challengeRepository.findAll()
}
