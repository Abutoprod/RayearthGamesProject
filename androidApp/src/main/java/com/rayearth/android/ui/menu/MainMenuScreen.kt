package com.rayearth.android.ui.menu

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import coil3.compose.AsyncImage
import com.joao.Rayearth.R
import com.rayearth.data.repository.AuthRepository
import com.rayearth.presentation.viewmodel.ConquistaCampeao
import com.rayearth.presentation.viewmodel.MainMenuViewModel
import kotlinx.coroutines.delay
import org.koin.compose.koinInject
import org.koin.compose.viewmodel.koinViewModel
import java.util.Calendar

private val OrangeAccent = Color(0xFFF56228)

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun MainMenuScreen(
    onNavigateToEvents: () -> Unit,
    onNavigateToRanking: () -> Unit,
    onNavigateToProfile: () -> Unit,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val viewModel: MainMenuViewModel = koinViewModel()
    val uiState by viewModel.uiState.collectAsState()
    val authRepository: AuthRepository = koinInject()

    var userName by remember { mutableStateOf("") }
    var abaSelecionada by remember { mutableIntStateOf(0) }

    // Carrossel — 4 banners do servidor
    val totalBanners = 4
    val estadoPager = rememberPagerState(pageCount = { totalBanners })

    LaunchedEffect(Unit) {
        userName = authRepository.getStoredUserName() ?: "Jogador"
        val isPrimeiroDia = Calendar.getInstance().get(Calendar.DAY_OF_MONTH) == 1
        viewModel.carregarDados(isPrimeiroDia)
    }

    // Auto-scroll do carrossel a cada 4 segundos
    LaunchedEffect(Unit) {
        while (true) {
            delay(4000)
            val proxima = (estadoPager.currentPage + 1) % totalBanners
            estadoPager.animateScrollToPage(proxima)
        }
    }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF0D0B11),
                tonalElevation = 12.dp,
                modifier = Modifier.border(
                    0.5.dp,
                    Color.White.copy(alpha = 0.05f),
                    RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
                )
            ) {
                NavigationBarItem(
                    selected = abaSelecionada == 0,
                    onClick = { abaSelecionada = 0 },
                    icon = { Icon(Icons.Default.Home, "Início") },
                    label = { Text("Início", fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = OrangeAccent,
                        selectedTextColor = OrangeAccent,
                        unselectedIconColor = Color.Gray.copy(0.7f),
                        unselectedTextColor = Color.Gray.copy(0.7f),
                        indicatorColor = Color(0xFF221A2B).copy(0.5f)
                    )
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { abaSelecionada = 0; onNavigateToEvents() },
                    icon = { Icon(Icons.Default.Event, "Eventos") },
                    label = { Text("Eventos", fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        unselectedIconColor = Color.Gray.copy(0.7f),
                        unselectedTextColor = Color.Gray.copy(0.7f)
                    )
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { abaSelecionada = 0; onNavigateToRanking() },
                    icon = { Icon(Icons.Default.EmojiEvents, "Ranking") },
                    label = { Text("Ranking", fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        unselectedIconColor = Color.Gray.copy(0.7f),
                        unselectedTextColor = Color.Gray.copy(0.7f)
                    )
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { abaSelecionada = 0; onNavigateToProfile() },
                    icon = { Icon(Icons.Default.Person, "Perfil") },
                    label = { Text("Perfil", fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        unselectedIconColor = Color.Gray.copy(0.7f),
                        unselectedTextColor = Color.Gray.copy(0.7f)
                    )
                )
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Camada 1 — Wallpaper de fundo
            Image(
                painter = painterResource(id = R.drawable.wallpaper),
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )

            // Camada 2 — Película escura
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.5f))
            )

            // Camada 3 — Conteúdo rolável
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(18.dp)
            ) {
                // TopBar com logo + nome + botão sair
                item {
                    Spacer(Modifier.height(16.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                modifier = Modifier.size(65.dp),
                                shape = CircleShape,
                                color = Color.White.copy(0.15f),
                                border = BorderStroke(1.4.dp, Color.White)
                            ) {
                                Image(
                                    painter = painterResource(id = R.drawable.rayeart),
                                    contentDescription = "Logo",
                                    modifier = Modifier.padding(12.dp),
                                    contentScale = ContentScale.Fit
                                )
                            }
                            Spacer(Modifier.width(12.dp))
                            Text(
                                "Rayearth Games",
                                color = Color.White,
                                fontWeight = FontWeight.Black,
                                fontSize = 20.sp,
                                letterSpacing = 0.8.sp
                            )
                        }
                        IconButton(
                            onClick = onLogout,
                            modifier = Modifier
                                .background(Color.White.copy(0.05f), CircleShape)
                                .size(36.dp)
                        ) {
                            Icon(
                                Icons.Default.ExitToApp,
                                "Sair",
                                tint = Color.White.copy(0.8f),
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }

                // Card de boas-vindas com pódios
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(0.5.dp, Color.White.copy(0.08f), RoundedCornerShape(20.dp)),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1928).copy(0.45f)),
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Column(Modifier.padding(20.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("Olá, ", color = Color.White.copy(0.7f), fontSize = 20.sp)
                                Text("$userName!", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold)
                            }
                            Spacer(Modifier.height(12.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(OrangeAccent.copy(0.15f))
                                    .border(1.dp, OrangeAccent.copy(0.3f), RoundedCornerShape(10.dp))
                                    .padding(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.EmojiEvents, null, tint = OrangeAccent, modifier = Modifier.size(14.dp))
                                    Spacer(Modifier.width(4.dp))
                                    Text(uiState.rankingResumo, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }

                // Carrossel de banners do servidor
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(195.dp)
                            .border(0.5.dp, Color.White.copy(0.1f), RoundedCornerShape(18.dp)),
                        shape = RoundedCornerShape(18.dp)
                    ) {
                        Box(Modifier.fillMaxSize()) {
                            HorizontalPager(state = estadoPager, modifier = Modifier.fillMaxSize()) { pagina ->
                                val url = "http://129.121.46.153:8080/uploads/carrossel_${pagina + 1}.jpg"
                                Box(Modifier.fillMaxSize()) {
                                    AsyncImage(
                                        model = url,
                                        contentDescription = "Banner ${pagina + 1}",
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                    Box(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .background(
                                                Brush.verticalGradient(
                                                    listOf(Color.Transparent, Color.Black.copy(0.85f)),
                                                    startY = 120f
                                                )
                                            )
                                    )
                                    Text(
                                        "Destaques da Comunidade #${pagina + 1}",
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp,
                                        modifier = Modifier.align(Alignment.BottomStart).padding(16.dp)
                                    )
                                }
                            }
                            // Indicadores do carrossel
                            Row(
                                modifier = Modifier
                                    .align(Alignment.BottomEnd)
                                    .padding(end = 16.dp, bottom = 12.dp),
                                horizontalArrangement = Arrangement.End
                            ) {
                                repeat(totalBanners) { i ->
                                    val cor = if (estadoPager.currentPage == i) OrangeAccent else Color.White.copy(0.35f)
                                    val largura = if (estadoPager.currentPage == i) 14.dp else 6.dp
                                    Box(
                                        modifier = Modifier
                                            .padding(3.dp)
                                            .clip(CircleShape)
                                            .background(cor)
                                            .size(width = largura, height = 6.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                // Título seção novidades
                item {
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Novidades da Temporada",
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 0.5.sp
                    )
                }

                // Cards de avisos dinâmicos do backend
                items(uiState.avisos) { aviso ->
                    val temFoto = !aviso.urlFoto.isNullOrEmpty()
                    val urlFoto = if (temFoto) "http://129.121.46.153:8080/images/avisos/${aviso.urlFoto}" else null

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(0.5.dp, Color.White.copy(0.05f), RoundedCornerShape(16.dp))
                            .clickable(enabled = !aviso.link.isNullOrEmpty()) {
                                try {
                                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(aviso.link)))
                                } catch (e: Exception) { e.printStackTrace() }
                            },
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF15121B)),
                        shape = RoundedCornerShape(16.dp),
                        elevation = CardDefaults.cardElevation(2.dp)
                    ) {
                        Column {
                            if (temFoto && urlFoto != null) {
                                AsyncImage(
                                    model = urlFoto,
                                    contentDescription = null,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxWidth().height(140.dp)
                                )
                            }
                            Column(Modifier.padding(16.dp)) {
                                Text(
                                    "Aviso do admin",
                                    color = if (temFoto) Color.White else OrangeAccent,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp
                                )
                                Spacer(Modifier.height(6.dp))
                                Text(aviso.mensagem, color = Color.White.copy(0.65f), fontSize = 13.sp, lineHeight = 18.sp)
                                if (!aviso.link.isNullOrEmpty()) {
                                    Spacer(Modifier.height(10.dp))
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Link, null, tint = Color(0xFF00BCD4), modifier = Modifier.size(14.dp))
                                        Spacer(Modifier.width(4.dp))
                                        Text("Toque para ver detalhes", color = Color(0xFF00BCD4), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }
                }

                item { Spacer(Modifier.height(12.dp)) }
            }
        }
    }

    // Pop-up de campeão (quando é o 1º dia do mês e o usuário ganhou o ranking)
    if (uiState.conquistasCampeao.isNotEmpty()) {
        PopUpCampeao(
            conquista = uiState.conquistasCampeao.first(),
            onDismiss = { viewModel.dispensarConquista() }
        )
    }
}

@Composable
private fun PopUpCampeao(conquista: ConquistaCampeao, onDismiss: () -> Unit) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(28.dp),
            color = Color(0xFF110E15).copy(0.95f),
            modifier = Modifier.fillMaxWidth().padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Ícone de troféu animado (substitui Lottie que não existe no KMP ainda)
                Icon(
                    Icons.Default.EmojiEvents,
                    null,
                    tint = Color(0xFFFFD700),
                    modifier = Modifier.size(100.dp)
                )
                Spacer(Modifier.height(12.dp))
                Text("¡PARABÉNS!", color = OrangeAccent, fontSize = 26.sp, fontWeight = FontWeight.Black, letterSpacing = 1.5.sp)
                Spacer(Modifier.height(12.dp))
                Text(
                    "Você garantiu o 1º lugar no ranking mensal de ${conquista.nomeJogo}, ${conquista.usuarioNome}!",
                    color = Color.White,
                    fontSize = 16.sp,
                    lineHeight = 22.sp,
                    textAlign = TextAlign.Center,
                    fontWeight = FontWeight.Medium
                )
                Spacer(Modifier.height(20.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White.copy(0.04f), RoundedCornerShape(16.dp))
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("TOTAL DE PONTOS ACUMULADOS", color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(4.dp))
                        Text("${conquista.totalPontos} PTS", color = Color(0xFFFFD700), fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
                    }
                }
                Spacer(Modifier.height(24.dp))
                Button(
                    onClick = onDismiss,
                    colors = ButtonDefaults.buttonColors(containerColor = OrangeAccent),
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Text("REIVINDICAR CONQUISTA", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }
            }
        }
    }
}
