package com.rayearth

import com.rayearth.data.remote.dto.*
import com.rayearth.data.repository.AuthRepository
import com.rayearth.data.repository.EventoRepository
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

// ─────────────────────────────────────────────────────────────────────────────
// Fakes para testes (sem Mockito — funciona em KMP)
// ─────────────────────────────────────────────────────────────────────────────

class FakeTokenStorage : com.rayearth.data.local.TokenStorage {
    private var token: String? = null
    private var userId: Long? = null
    private var userName: String? = null

    override suspend fun saveToken(token: String)    { this.token = token }
    override suspend fun getToken(): String?          = token
    override suspend fun saveUserId(id: Long)         { userId = id }
    override suspend fun getUserId(): Long?           = userId
    override suspend fun saveUserName(name: String)   { userName = name }
    override suspend fun getUserName(): String?       = userName
    override suspend fun clearAll() { token = null; userId = null; userName = null }
}

class FakeTokenProvider : com.rayearth.di.TokenProvider {
    private var cached: String? = null
    override fun getCachedToken() = cached
    override suspend fun refresh() {}
    override fun set(token: String?) { cached = token }
}

// ─────────────────────────────────────────────────────────────────────────────
// TokenStorage Tests
// ─────────────────────────────────────────────────────────────────────────────

class TokenStorageTest {

    private val storage = FakeTokenStorage()

    @Test
    fun `saveToken persists token`() = runTest {
        storage.saveToken("abc123")
        assertEquals("abc123", storage.getToken())
    }

    @Test
    fun `clearAll removes all data`() = runTest {
        storage.saveToken("abc")
        storage.saveUserId(1L)
        storage.saveUserName("João")
        storage.clearAll()
        assertEquals(null, storage.getToken())
        assertEquals(null, storage.getUserId())
        assertEquals(null, storage.getUserName())
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Serialization Tests
// ─────────────────────────────────────────────────────────────────────────────

class DtoTest {

    @Test
    fun `LoginRequest holds correct fields`() {
        val req = LoginRequest("user@test.com", "senha123")
        assertEquals("user@test.com", req.email)
        assertEquals("senha123", req.senha)
    }

    @Test
    fun `EventoDTO fields are accessible`() {
        val evento = EventoDTO(
            id = 1L,
            titulo = "Torneio de MTG",
            descricao = "Formato Modern",
            dataHora = "2025-06-01T18:00",
            urlImagem = "https://example.com/img.jpg",
            linkInscricao = "https://example.com/inscricao",
            jogoNome = "Magic: The Gathering",
            filialNome = "Filial Centro"
        )
        assertEquals("Torneio de MTG", evento.titulo)
        assertEquals("Magic: The Gathering", evento.jogoNome)
    }

    @Test
    fun `RankingDTO posicao defaults to zero`() {
        val dto = RankingDTO(
            usuarioId = 42L,
            usuarioNome = "Jogador X",
            totalPontos = 500
        )
        assertEquals(0, dto.posicao)
    }

    @Test
    fun `FilialResponse ativo field`() {
        val filial = FilialResponse(1L, "Filial Sul", "São Paulo", "Rua A, 10", true)
        assertTrue(filial.ativo)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — runTest KMP-compatible
// ─────────────────────────────────────────────────────────────────────────────

fun runTest(block: suspend () -> Unit) {
    kotlinx.coroutines.runBlocking { block() }
}
