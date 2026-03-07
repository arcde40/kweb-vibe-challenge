package org.kweb.api.trial

import org.koin.dsl.module

val trialModule = module {
    single { TrialRepository() }
}
