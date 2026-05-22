package com.rayearth.di

import android.content.Context
import com.rayearth.data.local.AndroidTokenStorage
import com.rayearth.data.local.TokenStorage
import org.koin.dsl.module

/**
 * Módulo Koin específico do Android.
 * Provê implementações que dependem do Context do Android.
 */
fun androidModule(context: Context) = module {
    single<TokenStorage> { AndroidTokenStorage(context) }
}
