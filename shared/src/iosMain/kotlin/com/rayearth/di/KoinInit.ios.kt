package com.rayearth.di

import org.koin.core.context.startKoin
import org.koin.core.module.Module

/**
 * Ponto de entrada do Koin para iOS.
 * Chamado pelo Swift no App.init().
 *
 * Swift: KoinInitKt.doInitKoin(modules: [IosModuleKt.iosModule, SharedModuleKt.sharedModule])
 */
fun initKoin(vararg extraModules: Module) {
    startKoin {
        modules(iosModule, sharedModule, *extraModules)
    }
}
