package com.rayearth.android

import android.app.Application
import com.rayearth.di.androidModule
import com.rayearth.di.sharedModule
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin
import org.koin.core.logger.Level

class RayearthApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidLogger(Level.ERROR) // só loga erros em debug para não poluir
            androidContext(this@RayearthApplication)
            modules(
                androidModule(this@RayearthApplication),
                sharedModule
            )
        }
    }
}
