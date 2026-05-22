package com.rayearth.di

import com.rayearth.data.local.TokenStorage
import kotlinx.coroutines.runBlocking

/**
 * Provê o token em memória para o Ktor client (sem suspend).
 * Na inicialização, carrega do TokenStorage para sobreviver a restarts.
 */
interface TokenProvider {
    fun getCachedToken(): String?
    fun set(token: String?)
}

class TokenProviderImpl(private val storage: TokenStorage) : TokenProvider {
    private var cached: String? = runBlocking { storage.getToken() }
    override fun getCachedToken(): String? = cached
    override fun set(token: String?) { cached = token }
}
