package com.rayearth.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// ── Auth ──────────────────────────────────────────────────────────────────────

@Serializable
data class LoginRequest(
    val email: String,
    val senha: String
)

@Serializable
data class LoginResponse(
    val token: String,
    val role: String? = null,
    val userId: Long? = null
)
@Serializable
data class RegisterRequest(
    val nome: String,
    val email: String,
    val senha: String
)

// ── Usuário ───────────────────────────────────────────────────────────────────

@Serializable
data class UserMeResponse(
    val id: Long,
    val nome: String,
    val email: String,
    val creditos: Double,
    val role: String
)

// ── Eventos ───────────────────────────────────────────────────────────────────

@Serializable
data class EventoDTO(
    val id: Long,
    val titulo: String,
    val descricao: String,
    val dataHora: String,
    val urlImagem: String,
    val linkInscricao: String,
    val jogoNome: String,
    val filialNome: String
)

@Serializable
data class EventoParticipante(
    val id: Long,
    val nome: String
)

// ── Filiais / Jogos ───────────────────────────────────────────────────────────

@Serializable
data class FilialResponse(
    val id: Long,
    val nome: String,
    val cidade: String,
    val endereco: String,
    val ativo: Boolean
)

@Serializable
data class JogoDTO(
    val id: Long,
    val nome: String
)

// ── Ranking ───────────────────────────────────────────────────────────────────

@Serializable
data class RankingDTO(
    @SerialName("usuarioId") val usuarioId: Long,
    @SerialName("nome") val usuarioNome: String,
    @SerialName("totalPontos") val totalPontos: Int,
    @SerialName("posicao") val posicao: Int = 0
)

@Serializable
data class RankingPerfilDTO(
    val nomeMes: String,
    val pontos: Float,
    val posicao: Int
)

@Serializable
data class MinhaPosicaoResponse(
    val posicao: Int,
    val pontos: Int,
    val recompensa: String? = null,
    val jogoNome: String? = null
)

// ── Comandas ──────────────────────────────────────────────────────────────────

@Serializable
data class ComandaResponseDTO(
    val id: Long,
    val nomeCliente: String,
    val valorTotal: Double,
    val aberta: Boolean,
    val dataAbertura: String,
    val itens: List<ItemComandaDTO>
)

@Serializable
data class ItemComandaDTO(
    val produtoId: Long,
    @SerialName("produtoNome") val descricaoProduto: String,
    val quantidade: Int,
    val precoCompra: Double,
    val precoUnitario: Double
)

// ── Avisos ────────────────────────────────────────────────────────────────────

@Serializable
data class AvisoComunidadeDTO(
    val id: Long,
    val titulo: String,
    val mensagem: String,
    val urlFoto: String? = null,
    val link: String? = null,
    val dataExpiracao: String
)
