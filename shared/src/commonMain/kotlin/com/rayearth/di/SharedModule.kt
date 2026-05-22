package com.rayearth.di

import com.rayearth.data.local.TokenStorage
import com.rayearth.data.remote.RayearthApiService
import com.rayearth.data.remote.createHttpClient
import com.rayearth.data.repository.*
import com.rayearth.presentation.viewmodel.*
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module

val sharedModule = module {
    single<TokenProvider> { TokenProviderImpl(get()) }
    single { createHttpClient(tokenProvider = { get<TokenProvider>().getCachedToken() }) }
    single { RayearthApiService(get()) }
    single { AuthRepository(get(), get(), get()) }
    single { MenuRepository(get()) }
    single { EventoRepository(get()) }
    single { RankingRepository(get()) }
    single { ProfileRepository(get(), get()) }
    viewModel { LoginViewModel(get()) }
    viewModel { MainMenuViewModel(get()) }
    viewModel { EventosViewModel(get()) }
    viewModel { RankingViewModel(get()) }
    viewModel { ProfileViewModel(get()) }
}
