package org.kweb.api.ai

import org.koin.dsl.module

val aiModule = module {
    single { AIRepository() }
    single { AIService(get()) }
}