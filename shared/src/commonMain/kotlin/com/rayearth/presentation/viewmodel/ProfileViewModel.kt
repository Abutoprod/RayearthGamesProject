package com.rayearth.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rayearth.data.remote.dto.*
import com.rayearth.data.repository.ProfileRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// ── Estado centralizado do perfil (exposto via StateFlow para Swift) ───────────

data class ProfileUiState(
    val nomeUsuario: String = "Carregando...",
    val emailUsuario: String = "",
    val jogos: List<JogoDTO> = emptyList(),
    val filiais: List<FilialResponse> = emptyList(),
    val jogoSelecionado: JogoDTO? = null,
    val filialSelecionada: FilialResponse? = null,
    val historicoGrafico: List<RankingPerfilDTO> = emptyList(),
    val comandas: List<ComandaResponseDTO> = emptyList(),
    val mesReferencia: Int = 1,
    val anoReferencia: Int = 2025,
    val carregandoPerfil: Boolean = true,
    val carregandoGrafico: Boolean = false
)

class ProfileViewModel(private val repository: ProfileRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState(
        mesReferencia = currentMonth(),
        anoReferencia = currentYear()
    ))
    val uiState = _uiState.asStateFlow()

    fun inicializarPerfil() {
        viewModelScope.launch {
            _uiState.update { it.copy(carregandoPerfil = true) }
            try {
                val dadosUser = repository.buscarDadosUsuario().getOrNull()
                if (dadosUser != null) {
                    _uiState.update { it.copy(nomeUsuario = dadosUser.nome, emailUsuario = dadosUser.email) }
                }

                val jogos = repository.buscarJogos().getOrDefault(emptyList())
                val filiais = repository.buscarFiliais().getOrDefault(emptyList())
                val primeiroJogo = jogos.firstOrNull()
                val primeiraFilial = filiais.firstOrNull()
                    ?: FilialResponse(1L, "Filial Padrão", "Desconhecida", "Sem Endereço", true)

                _uiState.update {
                    it.copy(
                        jogos = jogos,
                        filiais = filiais,
                        jogoSelecionado = primeiroJogo,
                        filialSelecionada = primeiraFilial
                    )
                }

                atualizarGrafico()

                val comandasReais = repository.buscarMinhasComandas().getOrDefault(emptyList())
                _uiState.update { it.copy(comandas = comandasReais) }

            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _uiState.update { it.copy(carregandoPerfil = false) }
            }
        }
    }

    fun selecionarJogo(jogo: JogoDTO) {
        _uiState.update { it.copy(jogoSelecionado = jogo) }
        atualizarGrafico()
    }

    fun selecionarFilial(filial: FilialResponse) {
        _uiState.update { it.copy(filialSelecionada = filial) }
        atualizarGrafico()
    }

    fun setMesReferencia(mes: Int) {
        _uiState.update { it.copy(mesReferencia = mes) }
        atualizarGrafico()
    }

    fun setAnoReferencia(ano: Int) {
        _uiState.update { it.copy(anoReferencia = ano) }
        atualizarGrafico()
    }

    fun atualizarGrafico() {
        val state = _uiState.value
        val jId = state.jogoSelecionado?.id ?: return
        val fId = state.filialSelecionada?.id ?: return

        viewModelScope.launch {
            _uiState.update { it.copy(carregandoGrafico = true) }
            try {
                val dados = repository.buscarHistoricoPontos(jId, fId, state.mesReferencia, state.anoReferencia)
                _uiState.update { it.copy(historicoGrafico = dados) }
            } finally {
                _uiState.update { it.copy(carregandoGrafico = false) }
            }
        }
    }
}
