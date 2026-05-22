package com.rayearth.data.local

/**
 * Armazenamento seguro do token de autenticação.
 *
 * Android → DataStore Preferences (substitui o objeto estático TokenManager)
 * iOS     → Keychain via NSUserDefaults (em produção, use Security framework)
 *
 * A interface é suspendível para suportar I/O assíncrono em ambas as plataformas.
 */
interface TokenStorage {
    suspend fun saveToken(token: String)
    suspend fun getToken(): String?
    suspend fun saveUserId(id: Long)
    suspend fun getUserId(): Long?
    suspend fun saveUserName(name: String)
    suspend fun getUserName(): String?
    suspend fun clearAll()
}
