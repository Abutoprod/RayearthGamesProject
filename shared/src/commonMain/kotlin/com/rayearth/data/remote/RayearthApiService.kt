package com.rayearth.data.remote

import com.rayearth.data.remote.dto.*
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.*
import io.ktor.http.ContentType
import io.ktor.http.contentType

/**
 * Serviço de API usando Ktor — funciona em Android e iOS.
 * Substitui a interface Retrofit [CommunityApiService] original.
 *
 * Todos os métodos retornam [Result] para tratamento de erros explícito,
 * sem precisar de try/catch nos repositórios.
 */
class RayearthApiService(private val client: HttpClient) {

    // ── Auth ──────────────────────────────────────────────────────────────────

    suspend fun login(request: LoginRequest): Result<LoginResponse> = runCatching {
        client.post("/login") {
            setBody(request)
        }.body()
    }

    suspend fun registrar(request: RegisterRequest): Result<Unit> = runCatching {
        client.post("/api/usuarios/registrar") {
            setBody(request)
        }
        Unit
    }

    suspend fun solicitarCodigoSenha(email: String): Result<Unit> = runCatching {
        client.post("/api/usuarios/esqueci-senha") {
            setBody(mapOf("email" to email))
        }
        Unit
    }

    suspend fun redefinirSenha(token: String, novaSenha: String): Result<Unit> = runCatching {
        client.post("/api/usuarios/redefinir-senha") {
            setBody(mapOf("token" to token, "novaSenha" to novaSenha))
        }
        Unit
    }

    suspend fun reenviarEmailConfirmacao(email: String): Result<String> = runCatching {
        client.post("/api/usuarios/reenviar-confirmacao") {
            setBody(mapOf("email" to email))
        }.body()
    }

    // ── Usuário ───────────────────────────────────────────────────────────────

    suspend fun getMe(): Result<UserMeResponse> = runCatching {
        client.get("/api/usuarios/me").body()
    }

    // ── Eventos ───────────────────────────────────────────────────────────────

    suspend fun listarEventos(): Result<List<EventoDTO>> = runCatching {
        client.get("/api/eventos").body()
    }

    suspend fun realizarPreCadastro(eventoId: Long): Result<String> = runCatching {
        client.post("/api/eventos/$eventoId/pre-cadastro").body()
    }

    suspend fun cancelarPreCadastro(eventoId: Long): Result<Unit> = runCatching {
        client.delete("/api/eventos/$eventoId/cancelar-pre-cadastro")
        Unit
    }

    suspend fun getParticipantes(eventoId: Long): Result<List<EventoParticipante>> = runCatching {
        client.get("/api/eventos/$eventoId/participantes-pre-cadastrados_id").body()
    }

    // ── Filiais / Jogos ───────────────────────────────────────────────────────

    suspend fun getFiliais(): Result<List<FilialResponse>> = runCatching {
        client.get("/api/filiais").body()
    }

    suspend fun getJogos(): Result<List<JogoDTO>> = runCatching {
        client.get("/api/jogos").body()
    }

    // ── Ranking ───────────────────────────────────────────────────────────────

    suspend fun consultarRanking(
        jogoId: Long,
        filialId: Long,
        mes: Int? = null,
        ano: Int? = null
    ): Result<List<RankingDTO>> = runCatching {
        client.get("/api/pontos/ranking") {
            parameter("jogoId", jogoId)
            parameter("filialId", filialId)
            mes?.let { parameter("mes", it) }
            ano?.let { parameter("ano", it) }
        }.body()
    }

    suspend fun getMinhaPosicao(
        jogoId: Long,
        filialId: Long,
        mes: Int,
        ano: Int
    ): Result<RankingDTO> = runCatching {
        client.get("/api/pontos/minha-posicao") {
            parameter("jogoId", jogoId)
            parameter("filialId", filialId)
            parameter("mes", mes)
            parameter("ano", ano)
        }.body()
    }

    // ── Comandas ──────────────────────────────────────────────────────────────

    suspend fun getMinhasComandas(status: String? = null): Result<List<ComandaResponseDTO>> = runCatching {
        client.get("/api/comandas/minha") {
            status?.let { parameter("status", it) }
        }.body()
    }

    // ── Avisos ────────────────────────────────────────────────────────────────

    suspend fun getAvisosAtivos(): Result<List<AvisoComunidadeDTO>> = runCatching {
        client.get("/api/avisos").body()
    }
}
