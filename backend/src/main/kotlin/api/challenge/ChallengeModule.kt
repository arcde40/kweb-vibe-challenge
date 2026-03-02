package org.kweb.api.challenge

import org.koin.dsl.module

val challengeModule = module {
    single { ChallengeRepository() }
    single { ChallengeService(get()) }
}