package com.rayearth.data.local

import platform.Foundation.NSUserDefaults

val platform:

/**
 * Implementação iOS do TokenStorage usando NSUserDefaults.
 *
 * ⚠️ Em produção, substitua por Keychain para dados sensíveis como tokens:
 *    Use Security.framework ou uma biblioteca como KeychainAccess.
 *    O App Store Review rejeita apps que armazenam credenciais em NSUserDefaults
 *    sem criptografia para dados marcados como sensíveis.
 */
class IosTokenStorage : TokenStorage {

    private val defaults = NSUserDefaults.standardUserDefaults

    private companion object {
        const val KEY_TOKEN = "auth_token"
        const val KEY_USER_ID = "user_id"
        const val KEY_USER_NAME = "user_name"
    }

    override suspend fun saveToken(token: String) {
        defaults.setObject(token, KEY_TOKEN)
    }

    override suspend fun getToken(): String? =
        defaults.stringForKey(KEY_TOKEN)

    override suspend fun saveUserId(id: Long) {
        defaults.setObject(id.toString(), KEY_USER_ID)
    }

    override suspend fun getUserId(): Long? =
        defaults.stringForKey(KEY_USER_ID)?.toLongOrNull()

    override suspend fun saveUserName(name: String) {
        defaults.setObject(name, KEY_USER_NAME)
    }

    override suspend fun getUserName(): String? =
        defaults.stringForKey(KEY_USER_NAME)

    override suspend fun clearAll() {
        listOf(KEY_TOKEN, KEY_USER_ID, KEY_USER_NAME).forEach {
            defaults.removeObjectForKey(it)
        }
    }
}
