package com.rayearth.android.ui.profile

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rayearth.data.remote.dto.ComandaResponseDTO
import com.rayearth.data.remote.dto.RankingPerfilDTO
import com.rayearth.presentation.viewmodel.ProfileViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserProfileScreen(
    viewModel: ProfileViewModel,
    onNavigateBack: () -> Unit
) {
    LaunchedEffect(Unit) { viewModel.inicializarPerfil() }

    // Coleta o estado centralizado — mesma abordagem dos outros ViewModels
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Perfil", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Voltar")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF110E15),
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { padding ->
        Surface(
            modifier = Modifier.fillMaxSize().padding(padding),
            color = Color(0xFF110E15)
        ) {
            if (uiState.carregandoPerfil) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFFE91E63))
                }
            } else {
                LazyColumn(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    // Nome e e-mail
                    item {
                        Column(Modifier.fillMaxWidth()) {
                            Text(uiState.nomeUsuario, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Text(uiState.emailUsuario, color = Color.Gray, fontSize = 14.sp)
                        }
                    }

                    // Filtros: jogo, mês, ano
                    item {
                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {

                            // Dropdown jogo
                            var expandidoJogo by remember { mutableStateOf(false) }
                            ExposedDropdownMenuBox(
                                expanded = expandidoJogo,
                                onExpandedChange = { expandidoJogo = !expandidoJogo }
                            ) {
                                OutlinedTextField(
                                    value = uiState.jogoSelecionado?.nome ?: "Selecione o Jogo",
                                    onValueChange = {},
                                    readOnly = true,
                                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandidoJogo) },
                                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                                    modifier = Modifier.fillMaxWidth().menuAnchor()
                                )
                                ExposedDropdownMenu(expanded = expandidoJogo, onDismissRequest = { expandidoJogo = false }) {
                                    uiState.jogos.forEach { jogo ->
                                        DropdownMenuItem(
                                            text = { Text(jogo.nome) },
                                            onClick = {
                                                viewModel.selecionarJogo(jogo)
                                                expandidoJogo = false
                                            }
                                        )
                                    }
                                }
                            }

                            // Mês e Ano lado a lado
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {

                                // Mês
                                var expandidoMes by remember { mutableStateOf(false) }
                                ExposedDropdownMenuBox(
                                    expanded = expandidoMes,
                                    onExpandedChange = { expandidoMes = !expandidoMes },
                                    modifier = Modifier.weight(1f)
                                ) {
                                    OutlinedTextField(
                                        value = "Até Mês: ${uiState.mesReferencia}",
                                        onValueChange = {},
                                        readOnly = true,
                                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandidoMes) },
                                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                                        modifier = Modifier.menuAnchor()
                                    )
                                    ExposedDropdownMenu(expanded = expandidoMes, onDismissRequest = { expandidoMes = false }) {
                                        (1..12).forEach { mes ->
                                            DropdownMenuItem(
                                                text = { Text("Mês $mes") },
                                                onClick = {
                                                    viewModel.setMesReferencia(mes)
                                                    expandidoMes = false
                                                }
                                            )
                                        }
                                    }
                                }

                                // Ano
                                var expandidoAno by remember { mutableStateOf(false) }
                                ExposedDropdownMenuBox(
                                    expanded = expandidoAno,
                                    onExpandedChange = { expandidoAno = !expandidoAno },
                                    modifier = Modifier.weight(1f)
                                ) {
                                    OutlinedTextField(
                                        value = "Ano: ${uiState.anoReferencia}",
                                        onValueChange = {},
                                        readOnly = true,
                                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandidoAno) },
                                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                                        modifier = Modifier.menuAnchor()
                                    )
                                    ExposedDropdownMenu(expanded = expandidoAno, onDismissRequest = { expandidoAno = false }) {
                                        listOf(2024, 2025, 2026).forEach { ano ->
                                            DropdownMenuItem(
                                                text = { Text("$ano") },
                                                onClick = {
                                                    viewModel.setAnoReferencia(ano)
                                                    expandidoAno = false
                                                }
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Gráfico de linha
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.04f)),
                            shape = RoundedCornerShape(24.dp)
                        ) {
                            Column(Modifier.padding(20.dp)) {
                                Text("Evolução Mensal (Pontos)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Spacer(Modifier.height(24.dp))
                                if (uiState.carregandoGrafico) {
                                    Box(Modifier.fillMaxWidth().height(170.dp), contentAlignment = Alignment.Center) {
                                        CircularProgressIndicator(color = Color(0xFFE91E63))
                                    }
                                } else {
                                    GraficoLinhaNativo(dados = uiState.historicoGrafico)
                                }
                            }
                        }
                    }

                    // Título comandas
                    item {
                        Text("Minhas Comandas Recentes", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }

                    if (uiState.comandas.isEmpty()) {
                        item {
                            Text("Nenhuma comanda encontrada.", color = Color.Gray, fontSize = 14.sp, modifier = Modifier.padding(vertical = 8.dp))
                        }
                    } else {
                        items(uiState.comandas.filter { it.aberta }) { comanda ->
                            ItemComandaExpansivel(comanda = comanda)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ItemComandaExpansivel(comanda: ComandaResponseDTO) {
    var expandido by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E1E)),
        shape = RoundedCornerShape(12.dp),
        onClick = { expandido = !expandido }
    ) {
        Column(Modifier.fillMaxWidth().padding(16.dp)) {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Comanda #${comanda.id}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    val data = comanda.dataAbertura.split("T").firstOrNull() ?: comanda.dataAbertura
                    Text(data, color = Color.Gray, fontSize = 12.sp, modifier = Modifier.padding(top = 2.dp))
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        "R$ %.2f".format(comanda.valorTotal),
                        color = Color(0xFFFFD700),
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 16.sp
                    )
                    val statusTexto = if (comanda.aberta) "Aberta" else "Paga"
                    val statusCor = if (comanda.aberta) Color(0xFFFF9800) else Color(0xFF4CAF50)
                    Text(statusTexto, color = statusCor, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 2.dp))
                }
            }

            if (expandido) {
                HorizontalDivider(color = Color.White.copy(0.1f), modifier = Modifier.padding(vertical = 12.dp), thickness = 1.dp)
                Text("PRODUTOS CONSUMIDOS:", color = Color.Gray, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 8.dp))

                if (comanda.itens.isEmpty()) {
                    Text("Nenhum produto lançado nesta comanda.", color = Color.DarkGray, fontSize = 13.sp)
                } else {
                    comanda.itens.forEach { item ->
                        Row(
                            Modifier.fillMaxWidth().padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("${item.quantidade}x  ${item.descricaoProduto}", color = Color.White.copy(0.9f), fontSize = 14.sp, modifier = Modifier.weight(1f))
                            Text("R$ %.2f".format(item.quantidade * item.precoUnitario), color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                        }
                    }
                }
                Spacer(Modifier.height(8.dp))
                Text("Toque para recolher", color = Color.DarkGray, fontSize = 10.sp, modifier = Modifier.align(Alignment.CenterHorizontally))
            }
        }
    }
}

@Composable
fun GraficoLinhaNativo(dados: List<RankingPerfilDTO>) {
    val corLinha = Color(0xFFE91E63)

    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .height(180.dp)
            .padding(start = 45.dp, end = 16.dp, bottom = 24.dp)
    ) {
        val larguraTotal = size.width
        val alturaTotal = size.height
        val numeroDePontos = dados.size
        val maxPontos = (if (dados.isNotEmpty()) dados.maxOf { it.pontos } else 0f).coerceAtLeast(100f)

        val paintEixoY = android.graphics.Paint().apply {
            color = android.graphics.Color.GRAY; textSize = 10.dp.toPx()
            textAlign = android.graphics.Paint.Align.RIGHT; isAntiAlias = true
        }
        val paintBolinhas = android.graphics.Paint().apply {
            color = android.graphics.Color.WHITE; textSize = 9.dp.toPx()
            textAlign = android.graphics.Paint.Align.CENTER; isAntiAlias = true
            typeface = android.graphics.Typeface.create(android.graphics.Typeface.DEFAULT, android.graphics.Typeface.BOLD)
        }
        val paintMeses = android.graphics.Paint().apply {
            color = android.graphics.Color.GRAY; textSize = 11.dp.toPx()
            textAlign = android.graphics.Paint.Align.CENTER; isAntiAlias = true
        }

        for (i in 0..3) {
            val prop = i.toFloat() / 3
            val y = alturaTotal * (1f - prop)
            drawLine(Color.White.copy(0.05f), Offset(0f, y), Offset(larguraTotal, y), 1.dp.toPx())
            drawContext.canvas.nativeCanvas.drawText("${(maxPontos * prop).toInt()} pts", -10.dp.toPx(), y + 4.dp.toPx(), paintEixoY)
        }

        if (numeroDePontos > 1) {
            val espX = larguraTotal / (numeroDePontos - 1)
            val coords = dados.mapIndexed { i, item ->
                Offset(i * espX, alturaTotal - (item.pontos / maxPontos * alturaTotal))
            }
            val path = Path().apply {
                coords.forEachIndexed { i, o -> if (i == 0) moveTo(o.x, o.y) else lineTo(o.x, o.y) }
            }
            drawPath(path, corLinha, style = Stroke(4.dp.toPx()))
            coords.forEachIndexed { i, o ->
                drawCircle(Color(0xFFFFD700), 5.dp.toPx(), o)
                if (dados[i].pontos > 0)
                    drawContext.canvas.nativeCanvas.drawText("${dados[i].pontos.toInt()} pts", o.x, o.y - 10.dp.toPx(), paintBolinhas)
                drawContext.canvas.nativeCanvas.drawText(dados[i].nomeMes, o.x, alturaTotal + 18.dp.toPx(), paintMeses)
            }
        } else if (numeroDePontos == 1) {
            val o = Offset(larguraTotal / 2, alturaTotal / 2)
            drawCircle(Color(0xFFFFD700), 6.dp.toPx(), o)
            drawContext.canvas.nativeCanvas.drawText("${dados[0].pontos.toInt()} pts", o.x, o.y - 12.dp.toPx(), paintBolinhas)
            drawContext.canvas.nativeCanvas.drawText(dados[0].nomeMes, o.x, alturaTotal + 18.dp.toPx(), paintMeses)
        }
    }
}
