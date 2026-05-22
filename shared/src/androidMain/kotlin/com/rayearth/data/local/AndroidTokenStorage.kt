package com.rayearth.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "rayearth_prefs")

/**
 * Implementação Android do TokenStorage usando DataStore Preferences.
 * Persistência real — sobrevive a reinicializações do app.
 */
class AndroidTokenStorage(private val context: Context) : TokenStorage {

    private companion object {
        val KEY_TOKEN = stringPreferencesKey("auth_token")
        val KEY_USER_ID = longPreferencesKey("user_id")
        val KEY_USER_NAME = stringPreferencesKey("user_name")
    }

    override suspend fun saveToken(token: String) {
        context.dataStore.edit { it[KEY_TOKEN] = token }
    }

    override suspend fun getToken(): String? =
        context.dataStore.data.map { it[KEY_TOKEN] }.firstOrNull()

    override suspend fun saveUserId(id: Long) {
        context.dataStore.edit { it[KEY_USER_ID] = id }
    }

    override suspend fun getUserId(): Long? =
        context.dataStore.data.map { it[KEY_USER_ID] }.firstOrNull()

    override suspend fun saveUserName(name: String) {
        context.dataStore.edit { it[KEY_USER_NAME] = name }
    }

    override suspend fun getUserName(): String? =
        context.dataStore.data.map { it[KEY_USER_NAME] }.firstOrNull()

    override suspend fun clearAll() {
        context.dataStore.edit { it.clear() }
    }
}
