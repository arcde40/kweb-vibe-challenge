package org.kweb.api.ranking

import org.koin.dsl.module

val rankingModule = module {
    single { RankingRepository() }
    single { RankingService(get()) }
}
