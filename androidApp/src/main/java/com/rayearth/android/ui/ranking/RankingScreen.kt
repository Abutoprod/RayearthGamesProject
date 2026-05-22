package com.rayearth.android.ui.ranking

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.rayearth.data.remote.dto.RankingDTO
import com.rayearth.presentation.viewmodel.RankingViewModel
import com.rayearth.data.repository.AuthRepository
import org.koin.compose.koinInject
import java.util.Calendar

@Composable
fun RankingScreen(viewModel: RankingViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val authRepository: AuthRepository = koinInject()
    var meuId by remember { mutableLongStateOf(0L) }

    val calendar = remember { Calendar.getInstance() }
    val mesAtual = calendar.get(Calendar.MONTH) + 1
    val anoAtual = calendar.get(Calendar.YEAR)

    LaunchedEffect(Unit) {
        meuId = authRepository.getStoredUserId() ?: 0L
    }

    // Dispara a busca quando jogo e filial forem selecionados
    LaunchedEffect(uiState.jogoSelecionado, uiState.filialSelecionada) {
        val jogoId = uiState.jogoSelecionado?.id ?: return@LaunchedEffect
        val filialId = uiState.filialSelecionada?.id ?: return@LaunchedEffect
        viewModel.buscarRanking(jogoId, filialId, mesAtual, anoAtual)
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0F0F0F), Color(0xFF000000))))
            .systemBarsPadding()
    ) {
        Column(Modifier.fillMaxSize()) {
            // Header
            Column(
                modifier = Modifier
                    .background(Color.Black.copy(alpha = 0.7f))
                    .padding(16.dp)
            ) {
                Text("RANKING", color = Color(0xFFE91E63), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelMedium)
                Text("Classificação Mensal", color = Color.White, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Black)

                Spacer(Modifier.height(12.dp))

                // Filtro de jogos
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(uiState.jogos) { jogo ->
                        FilterChip(
                            selected = uiState.jogoSelecionado?.id == jogo.id,
                            onClick = { viewModel.selecionarJogo(jogo) },
                            label = { Text(jogo.nome) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFFE91E63),
                                selectedLabelColor = Color.White,
                                containerColor = Color(0xFF1A1A1A),
                                labelColor = Color.Gray
                            )
                        )
                    }
                }

                Spacer(Modifier.height(8.dp))

                // Filtro de filiais
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(uiState.filiais) { filial ->
                        FilterChip(
                            selected = uiState.filialSelecionada?.id == filial.id,
                            onClick = { viewModel.selecionarFilial(filial) },
                            label = { Text(filial.nome) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFFE91E63),
                                selectedLabelColor = Color.White,
                                containerColor = Color(0xFF1A1A1A),
                                labelColor = Color.Gray
                            )
                        )
                    }
                }
            }

            if (uiState.isLoading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFFE91E63))
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    itemsIndexed(uiState.ranking) { index, jogador ->
                        RankingRow(
                            posicao = index + 1,
                            jogador = jogador,
                            isMe = jogador.usuarioId == meuId
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun RankingRow(posicao: Int, jogador: RankingDTO, isMe: Boolean) {
    val medalhaColor = when (posicao) {
        1 -> Color(0xFFFFD700)
        2 -> Color(0xFFC0C0C0)
        3 -> Color(0xFFCD7F32)
        else -> Color.Gray
    }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isMe) Color(0xFF1E0A14) else Color(0xFF141414)
        ),
        border = if (isMe) CardDefaults.outlinedCardBorder() else null
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "$posicao°",
                color = medalhaColor,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.width(36.dp)
            )
            Column(Modifier.weight(1f)) {
                Text(jogador.usuarioNome, color = Color.White, fontWeight = FontWeight.SemiBold)
                if (isMe) Text("Você", color = Color(0xFFE91E63), style = MaterialTheme.typography.labelSmall)
            }
            Text(
                "${jogador.totalPontos} pts",
                color = Color.White,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
