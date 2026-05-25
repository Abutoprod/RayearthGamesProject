package com.rayearth.android.ui.events

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.rayearth.data.remote.dto.EventoDTO
import com.rayearth.data.repository.AuthRepository
import com.rayearth.presentation.viewmodel.EventosViewModel
import org.koin.compose.koinInject
import com.rayearth.data.remote.BASE_URL
@Composable
fun EventosScreen(viewModel: EventosViewModel) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    val authRepository: AuthRepository = koinInject()
    var meuId by remember { mutableLongStateOf(0L) }
    LaunchedEffect(Unit) { meuId = authRepository.getStoredUserId() ?: 0L }

    var filialSelecionada by remember { mutableStateOf("Todas") }
    var jogoSelecionado by remember { mutableStateOf("Todos") }

    val eventosFiltrados = remember(uiState.eventos, filialSelecionada, jogoSelecionado) {
        uiState.eventos.filter {
            (filialSelecionada == "Todas" || it.filialNome == filialSelecionada) &&
            (jogoSelecionado == "Todos" || it.jogoNome == jogoSelecionado)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0F0F0F), Color(0xFF000000))))
    ) {
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                Column(
                    modifier = Modifier
                        .background(Color.Black.copy(alpha = 0.7f))
                        .statusBarsPadding()
                        .padding(bottom = 12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("EXPLORAR", color = Color(0xFFE91E63), fontWeight = FontWeight.Bold, letterSpacing = 2.sp, style = MaterialTheme.typography.labelMedium)
                            Text("Eventos Rayearth", color = Color.White, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Black)
                        }
                        Surface(
                            color = Color(0xFF1E1E1E), shape = CircleShape,
                            modifier = Modifier.size(40.dp).border(1.dp, Color.DarkGray, CircleShape)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("${eventosFiltrados.size}", color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                    FilterRow(uiState.filiais, filialSelecionada) { filialSelecionada = it }
                    FilterRow(uiState.jogos, jogoSelecionado) { jogoSelecionado = it }
                }
            }
        ) { padding ->
            if (uiState.isLoading && uiState.eventos.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFFE91E63))
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    if (eventosFiltrados.isEmpty()) {
                        item {
                            Box(Modifier.fillParentMaxSize(), contentAlignment = Alignment.Center) {
                                Text("Nenhum evento encontrado", color = Color.Gray)
                            }
                        }
                    }
                    items(eventosFiltrados) { evento ->
                        val inscritos = uiState.inscritosPorEvento[evento.id] ?: emptyList()
                        EventoCard(
                            evento = evento,
                            estaInscrito = inscritos.contains(meuId),
                            onAcaoClick = {
                                viewModel.toggleInscricao(evento.id, meuId) { erro ->
                                    Toast.makeText(context, erro, Toast.LENGTH_SHORT).show()
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun FilterRow(items: List<String>, selected: String, onSelect: (String) -> Unit) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(items) { item ->
            FilterChip(
                selected = item == selected,
                onClick = { onSelect(item) },
                label = { Text(item, style = MaterialTheme.typography.labelSmall) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Color(0xFFE91E63),
                    selectedLabelColor = Color.White,
                    containerColor = Color(0xFF1A1A1A),
                    labelColor = Color.Gray
                ),
                border = FilterChipDefaults.filterChipBorder(
                    enabled = true,
                    selected = item == selected,
                    borderColor = Color.DarkGray,
                    selectedBorderColor = Color.Transparent
                )
            )
        }
    }
}

@Composable
private fun EventoCard(
    evento: EventoDTO,
    estaInscrito: Boolean,
    onAcaoClick: () -> Unit
) {
    // Formata a data: "2026-05-22T18:00:00" → dia "22/05" e hora "18:00"
    val (diaFormatado, horaFormatada) = remember(evento.dataHora) {
        try {
            val partes = evento.dataHora.split("T")
            val data = partes[0].split("-")
            val hora = partes.getOrNull(1)?.substring(0, 5) ?: "--:--"
            val diaFmt = "${data[2]}/${data[1]}"
            Pair(diaFmt, hora)
        } catch (e: Exception) {
            Pair("--/--", "--:--")
        }
    }

    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF141414)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            val nomeArquivoLimpo = evento.urlImagem
                .substringAfterLast("/")
                .replace(" ", "_")
                .replace(":", "")

            // Imagem com badge de data sobreposto no canto superior esquerdo
            Box {
                AsyncImage(
                    model = if (nomeArquivoLimpo.isNotEmpty()) "${BASE_URL}/uploads/$nomeArquivoLimpo" else "",
                    contentDescription = evento.titulo,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxWidth().height(180.dp)
                )

                // Badge de data — canto superior esquerdo
                Surface(
                    modifier = Modifier
                        .padding(12.dp)
                        .align(Alignment.TopStart),
                    shape = RoundedCornerShape(10.dp),
                    color = Color.Black.copy(alpha = 0.75f)
                ) {
                    Column(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = diaFormatado,
                            color = Color.White,
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp
                        )
                        Text(
                            text = horaFormatada,
                            color = Color(0xFFE91E63),
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            }

            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Chip(evento.jogoNome)
                    Chip(evento.filialNome)
                }
                Text(
                    evento.titulo,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    evento.descricao,
                    color = Color.Gray,
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Button(
                    onClick = onAcaoClick,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (estaInscrito) Color(0xFF1A1A1A) else Color(0xFFE91E63)
                    ),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text(
                        text = if (estaInscrito) "Cancelar inscrição" else "Inscrever-me",
                        color = if (estaInscrito) Color.Gray else Color.White,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}
@Composable
private fun Chip(text: String) {
    Surface(color = Color(0xFF2A2A2A), shape = RoundedCornerShape(6.dp)) {
        Text(text, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp), color = Color.Gray, style = MaterialTheme.typography.labelSmall)
    }
}
