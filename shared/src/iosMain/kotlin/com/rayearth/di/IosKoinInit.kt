package com.rayearth.di

import org.koin.core.context.startKoin

fun initKoin() {
    startKoin {
        modules(iosModule, sharedModule)
    }
}
