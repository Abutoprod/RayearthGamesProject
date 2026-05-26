package com.rayearth.di

import com.rayearth.data.repository.AuthRepository
import com.rayearth.presentation.viewmodel.*
import org.koin.core.context.startKoin
import org.koin.mp.KoinPlatform

// Função principal de inicialização — renomeada para evitar conflito com Koin 4.x built-ins
@Throws(Throwable::class)
fun startAppKoin() {
    startKoin {
        modules(iosModule, sharedModule)
    }
}

// Funções provider para Swift (substitui KoinApplication.shared.koin.get() do Koin 3.x)
fun provideLoginViewModel(): LoginViewModel = KoinPlatform.getKoin().get()
fun provideMainMenuViewModel(): MainMenuViewModel = KoinPlatform.getKoin().get()
fun provideEventosViewModel(): EventosViewModel = KoinPlatform.getKoin().get()
fun provideRankingViewModel(): RankingViewModel = KoinPlatform.getKoin().get()
fun provideProfileViewModel(): ProfileViewModel = KoinPlatform.getKoin().get()
fun provideAuthRepository(): AuthRepository = KoinPlatform.getKoin().get()
