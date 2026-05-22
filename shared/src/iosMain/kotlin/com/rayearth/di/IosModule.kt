package com.rayearth.di

import com.rayearth.data.local.IosTokenStorage
import com.rayearth.data.local.TokenStorage
import org.koin.dsl.module

val iosModule = module {
    single<TokenStorage> { IosTokenStorage() }
}
