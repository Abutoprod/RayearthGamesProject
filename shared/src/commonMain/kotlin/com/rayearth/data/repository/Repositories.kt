package com.rayearth.data.repository

import com.rayearth.data.local.TokenStorage
import com.rayearth.data.remote.RayearthApiService
import com.rayearth.data.remote.dto.*
import com.rayearth.di.TokenProvider

// ── Auth ──────────────────────────────────────────────────────────────────────

class AuthRepository(
    private val api: RayearthApiService,
    private val tokenStorage: TokenStorage,
    private val tokenProvider: TokenProvider
) {
    suspend fun login(email: String, senha: String): Result<UserMeResponse> {
        val loginResult = api.login(LoginRequest(email, senha))
        return loginResult.fold(
            onSuccess = { loginResponse ->
                tokenStorage.saveToken(loginResponse.token)
                tokenProvider.set(loginResponse.token)
                val meResult = api.getMe()
                meResult.fold(
                    onSuccess = { user ->
                        tokenStorage.saveUserId(user.id)
                        tokenStorage.saveUserName(user.nome)
                        Result.success(user)
                    },
                    onFailure = { Result.failure(it) }
                )
            },
            onFailure = { Result.failure(it) }
        )
    }

    suspend fun registrar(nome: String, email: String, senha: String): Result<Unit> =
        api.registrar(RegisterRequest(nome, email, senha))

    suspend fun solicitarCodigoSenha(email: String): Result<Unit> =
        api.solicitarCodigoSenha(email)

    suspend fun redefinirSenha(token: String, novaSenha: String): Result<Unit> =
        api.redefinirSenha(token, novaSenha)

    suspend fun reenviarEmailConfirmacao(email: String): Result<String> =
        api.reenviarEmailConfirmacao(email)

    suspend fun logout() {
        tokenStorage.clearAll()
        tokenProvider.set(null)
    }

    suspend fun getStoredUserName(): String? = tokenStorage.getUserName()
    suspend fun getStoredUserId(): Long? = tokenStorage.getUserId()
    suspend fun isLoggedIn(): Boolean = tokenStorage.getToken() != null
}

// ── Menu ──────────────────────────────────────────────────────────────────────

class MenuRepository(private val api: RayearthApiService) {
    suspend fun buscarAvisosAtivos(): Result<List<AvisoComunidadeDTO>> = api.getAvisosAtivos()
    suspend fun buscarJogos(): Result<List<JogoDTO>> = api.getJogos()
    suspend fun buscarFiliais(): Result<List<FilialResponse>> = api.getFiliais()
    suspend fun getMinhaPosicao(jogoId: Long, filialId: Long, mes: Int, ano: Int): Result<RankingDTO> =
        api.getMinhaPosicao(jogoId, filialId, mes, ano)
}

// ── Evento ────────────────────────────────────────────────────────────────────

class EventoRepository(private val api: RayearthApiService) {
    suspend fun buscarEventos(): Result<List<EventoDTO>> = api.listarEventos()
    suspend fun buscarFiliais(): Result<List<FilialResponse>> = api.getFiliais()
    suspend fun buscarJogos(): Result<List<JogoDTO>> = api.getJogos()
    suspend fun buscarParticipantes(eventoId: Long): Result<List<EventoParticipante>> = api.getParticipantes(eventoId)
    suspend fun inscrever(eventoId: Long): Result<String> = api.realizarPreCadastro(eventoId)
    suspend fun cancelar(eventoId: Long): Result<Unit> = api.cancelarPreCadastro(eventoId)
}

// ── Ranking ───────────────────────────────────────────────────────────────────

class RankingRepository(private val api: RayearthApiService) {
    suspend fun buscarJogos(): Result<List<JogoDTO>> = api.getJogos()
    suspend fun buscarFiliais(): Result<List<FilialResponse>> = api.getFiliais()
    suspend fun buscarRankingMensal(jogoId: Long, filialId: Long, mes: Int, ano: Int): Result<List<RankingDTO>> =
        api.consultarRanking(jogoId, filialId, mes, ano)
    suspend fun getMinhaPosicao(jogoId: Long, filialId: Long, mes: Int, ano: Int): Result<RankingDTO> =
        api.getMinhaPosicao(jogoId, filialId, mes, ano)
}

// ── Profile ───────────────────────────────────────────────────────────────────
/*
class ProfileRepository(
    private val api: RayearthApiService,
    private val tokenStorage: TokenStorage
) {
    suspend fun buscarDadosUsuario(): Result<UserMeResponse> = api.getMe()
    suspend fun buscarJogos(): Result<List<JogoDTO>> = api.getJogos()
    suspend fun buscarFiliais(): Result<List<FilialResponse>> = api.getFiliais()
    suspend fun buscarHistoricoPontos(jogoId: Long, filialId: Long, mes: Int, ano: Int): Result<List<RankingDTO>> =
        api.consultarRanking(jogoId, filialId, mes, ano)
    suspend fun buscarMinhasComandas(): Result<List<ComandaResponseDTO>> = api.getMinhasComandas()
}
*/