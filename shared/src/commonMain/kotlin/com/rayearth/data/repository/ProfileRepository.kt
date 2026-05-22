package com.rayearth.data.repository

import com.rayearth.data.local.TokenStorage
import com.rayearth.data.remote.RayearthApiService
import com.rayearth.data.remote.dto.*

class ProfileRepository(
    private val api: RayearthApiService,
    private val tokenStorage: TokenStorage
) {
    private val nomesMeses = listOf("Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez")

    suspend fun buscarDadosUsuario(): Result<UserMeResponse> = api.getMe()
    suspend fun buscarJogos(): Result<List<JogoDTO>> = api.getJogos()
    suspend fun buscarFiliais(): Result<List<FilialResponse>> = api.getFiliais()
    suspend fun buscarMinhasComandas(): Result<List<ComandaResponseDTO>> = api.getMinhasComandas()

    /**
     * Busca a posição do usuário mês a mês (de Jan até [mesLimite])
     * e constrói o histórico para o gráfico — idêntico ao ProfileRepository original.
     */
    suspend fun buscarHistoricoPontos(
        jogoId: Long,
        filialId: Long,
        mesLimite: Int,
        anoLimite: Int
    ): List<RankingPerfilDTO> {
        val lista = mutableListOf<RankingPerfilDTO>()
        for (mes in 1..mesLimite) {
            try {
                val result = api.getMinhaPosicao(jogoId, filialId, mes, anoLimite)
                result.fold(
                    onSuccess = { dados ->
                        lista.add(RankingPerfilDTO(nomesMeses[mes - 1], dados.totalPontos.toFloat(), dados.posicao))
                    },
                    onFailure = {
                        lista.add(RankingPerfilDTO(nomesMeses[mes - 1], 0f, 0))
                    }
                )
            } catch (e: Exception) {
                lista.add(RankingPerfilDTO(nomesMeses[mes - 1], 0f, 0))
            }
        }
        return lista
    }
}
