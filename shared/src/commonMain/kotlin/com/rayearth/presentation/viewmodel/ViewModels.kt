package com.rayearth.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rayearth.data.remote.dto.*
import com.rayearth.data.repository.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// ── Auth ──────────────────────────────────────────────────────────────────────

data class AuthUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val isSuccess: Boolean = false
)

class LoginViewModel(private val repository: AuthRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState = _uiState.asStateFlow()

    /** Login — só salva o token, busca /me depois */
    fun login(email: String, senha: String, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            repository.login(email, senha).fold(
                onSuccess = {
                    _uiState.update { it.copy(isLoading = false, isSuccess = true) }
                    onSuccess()
                },
                onFailure = { e ->
                    val msg = if (e.message?.contains("401") == true || e.message?.contains("403") == true)
                        "Login falhou: Verifique suas credenciais"
                    else "Erro de conexão com o servidor"
                    _uiState.update { it.copy(isLoading = false, error = msg) }
                    onError(msg)
                }
            )
        }
    }

    fun cadastrarUsuario(nome: String, email: String, senha: String, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            repository.registrar(nome, email, senha).fold(
                onSuccess = { _uiState.update { it.copy(isLoading = false) }; onSuccess() },
                onFailure = { e ->
                    _uiState.update { it.copy(isLoading = false) }
                    onError("Erro no servidor: Verifique se o e-mail já existe.")
                }
            )
        }
    }

    fun solicitarCodigoSenha(email: String, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            repository.solicitarCodigoSenha(email).fold(
                onSuccess = { _uiState.update { it.copy(isLoading = false) }; onSuccess() },
                onFailure = { _uiState.update { it.copy(isLoading = false) }; onError("Erro no servidor") }
            )
        }
    }

    fun redefinirSenha(token: String, novaSenha: String, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            repository.redefinirSenha(token, novaSenha).fold(
                onSuccess = { _uiState.update { it.copy(isLoading = false) }; onSuccess() },
                onFailure = { _uiState.update { it.copy(isLoading = false) }; onError("Código inválido!") }
            )
        }
    }

    fun reenviarEmailConfirmacao(email: String, onSuccess: (String) -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            repository.reenviarEmailConfirmacao(email).fold(
                onSuccess = { msg -> _uiState.update { it.copy(isLoading = false) }; onSuccess(msg) },
                onFailure = { e -> _uiState.update { it.copy(isLoading = false) }; onError(e.message ?: "Erro ao reenviar e-mail.") }
            )
        }
    }

    fun clearError() = _uiState.update { it.copy(error = null) }
}

// ── MainMenu ──────────────────────────────────────────────────────────────────

data class MenuUiState(
    val isLoading: Boolean = false,
    val avisos: List<AvisoComunidadeDTO> = emptyList(),
    val rankingResumo: String = "Carregando pódios...",
    val conquistasCampeao: List<ConquistaCampeao> = emptyList()
)

data class ConquistaCampeao(
    val usuarioNome: String,
    val totalPontos: Int,
    val nomeJogo: String
)

class MainMenuViewModel(private val repository: MenuRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(MenuUiState())
    val uiState = _uiState.asStateFlow()

    fun carregarDados(isPrimeiroDia: Boolean) {
        viewModelScope.launch {
            try {
                // Avisos da comunidade
                val avisos = repository.buscarAvisosAtivos().getOrDefault(emptyList())
                _uiState.update { it.copy(avisos = avisos) }

                // Pódios do mês anterior
                val jogos = repository.buscarJogos().getOrDefault(emptyList())
                val filiais = repository.buscarFiliais().getOrDefault(emptyList())
                val mesAnterior = currentMesAnterior()
                val anoAnterior = currentAnoMesAnterior()

                var resumo = ""
                val conquistas = mutableListOf<ConquistaCampeao>()

                for (jogo in jogos) {
                    for (filial in filiais) {
                        repository.getMinhaPosicao(jogo.id, filial.id, mesAnterior, anoAnterior)
                            .onSuccess { dados ->
                                if (dados.posicao in 1..3) {
                                    resumo += "${jogo.nome}: ${dados.posicao}º | "
                                }
                                if (isPrimeiroDia && dados.posicao == 1) {
                                    conquistas.add(ConquistaCampeao(dados.usuarioNome, dados.totalPontos, jogo.nome))
                                }
                            }
                    }
                }

                _uiState.update {
                    it.copy(
                        rankingResumo = resumo.trimEnd(' ', '|').ifEmpty { "Nenhum pódio recente" },
                        conquistasCampeao = conquistas
                    )
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(rankingResumo = "Modo Offline") }
            }
        }
    }

    fun dispensarConquista() {
        _uiState.update { it.copy(conquistasCampeao = it.conquistasCampeao.drop(1)) }
    }
}

// ── Eventos ───────────────────────────────────────────────────────────────────

data class EventosUiState(
    val isLoading: Boolean = false,
    val eventos: List<EventoDTO> = emptyList(),
    val filiais: List<String> = listOf("Todas"),
    val jogos: List<String> = listOf("Todos"),
    val inscritosPorEvento: Map<Long, List<Long>> = emptyMap(),
    val error: String? = null
)

class EventosViewModel(private val repository: EventoRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(EventosUiState())
    val uiState = _uiState.asStateFlow()

    init { carregarDados() }

    fun carregarDados() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            try {
                val eventos = repository.buscarEventos().getOrDefault(emptyList())
                val filiais = repository.buscarFiliais().getOrDefault(emptyList())
                val jogos = repository.buscarJogos().getOrDefault(emptyList())
                _uiState.update {
                    it.copy(
                        eventos = eventos,
                        filiais = listOf("Todas") + filiais.map { f -> f.nome },
                        jogos = listOf("Todos") + jogos.map { j -> j.nome },
                        isLoading = false
                    )
                }
                eventos.forEach { atualizarParticipantes(it.id) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = "Erro ao carregar eventos") }
            }
        }
    }

    private suspend fun atualizarParticipantes(eventoId: Long) {
        repository.buscarParticipantes(eventoId).onSuccess { lista ->
            _uiState.update { state ->
                state.copy(inscritosPorEvento = state.inscritosPorEvento + (eventoId to lista.map { it.id }))
            }
        }
    }

    fun toggleInscricao(eventoId: Long, meuId: Long, onErro: (String) -> Unit) {
        viewModelScope.launch {
            val jaInscrito = _uiState.value.inscritosPorEvento[eventoId]?.contains(meuId) == true
            val result = if (jaInscrito) repository.cancelar(eventoId) else repository.inscrever(eventoId)
            result.fold(
                onSuccess = { atualizarParticipantes(eventoId) },
                onFailure = { e -> onErro(e.message ?: "Erro ao processar inscrição") }
            )
        }
    }
}

// ── Ranking ───────────────────────────────────────────────────────────────────

data class RankingUiState(
    val isLoading: Boolean = false,
    val jogos: List<JogoDTO> = emptyList(),
    val jogoSelecionado: JogoDTO? = null,
    val filiais: List<FilialResponse> = emptyList(),
    val filialSelecionada: FilialResponse? = null,
    val ranking: List<RankingDTO> = emptyList(),
    val error: String? = null
)

class RankingViewModel(private val repository: RankingRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(RankingUiState())
    val uiState = _uiState.asStateFlow()

    init { inicializarDados() }

    private fun inicializarDados() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            val jogos = repository.buscarJogos().getOrDefault(emptyList())
            val filiais = repository.buscarFiliais().getOrDefault(emptyList())
            _uiState.update {
                it.copy(
                    jogos = jogos, jogoSelecionado = jogos.firstOrNull(),
                    filiais = filiais, filialSelecionada = filiais.firstOrNull(),
                    isLoading = false
                )
            }
        }
    }

    fun selecionarJogo(jogo: JogoDTO) = _uiState.update { it.copy(jogoSelecionado = jogo) }
    fun selecionarFilial(filial: FilialResponse) = _uiState.update { it.copy(filialSelecionada = filial) }

    fun buscarRanking(jogoId: Long, filialId: Long, mes: Int, ano: Int) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            repository.buscarRankingMensal(jogoId, filialId, mes, ano).fold(
                onSuccess = { lista -> _uiState.update { it.copy(ranking = lista, isLoading = false) } },
                onFailure = { _uiState.update { it.copy(ranking = emptyList(), isLoading = false) } }
            )
        }
    }
}

// ── Helpers multiplataforma ───────────────────────────────────────────────────

expect fun currentMonth(): Int
expect fun currentYear(): Int
expect fun currentMesAnterior(): Int
expect fun currentAnoMesAnterior(): Int
