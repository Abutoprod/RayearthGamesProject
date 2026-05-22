package com.rayearth.presentation.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rayearth.data.remote.dto.*
import com.rayearth.data.repository.ProfileRepository
import kotlinx.coroutines.launch

class ProfileViewModel(private val repository: ProfileRepository) : ViewModel() {

    var nomeUsuario by mutableStateOf("Carregando...")
        private set
    var emailUsuario by mutableStateOf("")
        private set

    val listaJogos = mutableStateListOf<JogoDTO>()
    val listaFiliais = mutableStateListOf<FilialResponse>()

    var jogoSelecionado by mutableStateOf<JogoDTO?>(null)
    var filialSelecionada by mutableStateOf<FilialResponse?>(null)

    var mesReferencia by mutableStateOf(currentMonth())
    var anoReferencia by mutableStateOf(currentYear())

    val historicoGrafico = mutableStateListOf<RankingPerfilDTO>()

    var carregandoPerfil by mutableStateOf(true)
        private set
    var carregandoGrafico by mutableStateOf(false)
        private set

    val comandas = mutableStateListOf<ComandaResponseDTO>()

    fun inicializarPerfil() {
        viewModelScope.launch {
            carregandoPerfil = true
            try {
                val dadosUser = repository.buscarDadosUsuario().getOrNull()
                if (dadosUser != null) {
                    nomeUsuario = dadosUser.nome
                    emailUsuario = dadosUser.email
                }

                val jogos = repository.buscarJogos().getOrDefault(emptyList())
                listaJogos.clear()
                listaJogos.addAll(jogos)
                if (jogos.isNotEmpty()) jogoSelecionado = jogos.first()

                val filiais = repository.buscarFiliais().getOrDefault(emptyList())
                listaFiliais.clear()
                listaFiliais.addAll(filiais)
                filialSelecionada = filiais.firstOrNull() ?: FilialResponse(1L, "Filial Padrão", "Desconhecida", "Sem Endereço", true)

                atualizarGrafico()

                val comandasReais = repository.buscarMinhasComandas().getOrDefault(emptyList())
                comandas.clear()
                comandas.addAll(comandasReais)

            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                carregandoPerfil = false
            }
        }
    }

    fun atualizarGrafico() {
        val jId = jogoSelecionado?.id ?: return
        val fId = filialSelecionada?.id ?: return

        viewModelScope.launch {
            carregandoGrafico = true
            try {
                val dados = repository.buscarHistoricoPontos(jId, fId, mesReferencia, anoReferencia)
                historicoGrafico.clear()
                historicoGrafico.addAll(dados)
            } finally {
                carregandoGrafico = false
            }
        }
    }
}
