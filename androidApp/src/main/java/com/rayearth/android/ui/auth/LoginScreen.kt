package com.rayearth.android.ui.auth

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.joao.Rayearth.R
import com.rayearth.presentation.viewmodel.LoginViewModel

// Cores originais do app
private val OrangeBack = Color(0xFFF56228)
private val YellowBack = Color(0xFFFFD54F)

@Composable
fun LoginScreen(
    viewModel: LoginViewModel,
    onLoginSuccess: () -> Unit
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    var email by remember { mutableStateOf("") }
    var senha by remember { mutableStateOf("") }

    // Diálogo: Esqueci a senha (passo 1 — e-mail)
    var showEsqueciSenha by remember { mutableStateOf(false) }
    var emailRecuperacao by remember { mutableStateOf("") }

    // Diálogo: Redefinir senha (passo 2 — código + nova senha)
    var showRedefinirSenha by remember { mutableStateOf(false) }
    var codigoRecuperacao by remember { mutableStateOf("") }
    var novaSenha by remember { mutableStateOf("") }

    // Diálogo: Cadastro
    var showCadastro by remember { mutableStateOf(false) }
    var nomeCadastro by remember { mutableStateOf("") }
    var emailCadastro by remember { mutableStateOf("") }
    var senhaCadastro by remember { mutableStateOf("") }

    // Diálogo: Reenviar e-mail de ativação
    var showReenviarEmail by remember { mutableStateOf(false) }
    var emailReenvio by remember { mutableStateOf("") }

    LaunchedEffect(uiState.isSuccess) {
        if (uiState.isSuccess) onLoginSuccess()
    }

    Box(modifier = Modifier.fillMaxSize()) {
        // Fundo com degradê laranja/amarelo — idêntico ao original
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            OrangeBack.copy(alpha = 0.9f),
                            YellowBack.copy(alpha = 0.8f)
                        )
                    )
                )
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 32.dp)
                .statusBarsPadding(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Logo em círculo com borda branca
            Surface(
                modifier = Modifier.size(120.dp),
                shape = CircleShape,
                color = Color.White.copy(alpha = 0.15f),
                border = BorderStroke(2.dp, Color.White)
            ) {
                androidx.compose.foundation.Image(
                    painter = painterResource(id = R.drawable.rayeart),
                    contentDescription = "Logo",
                    modifier = Modifier.padding(20.dp)
                )
            }

            Spacer(Modifier.height(24.dp))
            Text("RAYEARTH GAMES", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
            Spacer(Modifier.height(32.dp))

            // Campo e-mail
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("E-mail") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            Spacer(Modifier.height(16.dp))

            // Campo senha
            OutlinedTextField(
                value = senha,
                onValueChange = { senha = it },
                label = { Text("Senha") },
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            // Links auxiliares
            TextButton(
                onClick = { showEsqueciSenha = true },
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("Esqueci minha senha", color = Color.White.copy(alpha = 0.8f))
            }

            TextButton(onClick = { emailReenvio = email; showReenviarEmail = true }) {
                Text(
                    "Não recebeu o e-mail de ativação? Reenviar",
                    color = Color.White.copy(alpha = 0.8f),
                    fontSize = 14.sp
                )
            }

            Spacer(Modifier.height(24.dp))

            // Botão ENTRAR
            Button(
                onClick = {
                    viewModel.login(
                        email = email,
                        senha = senha,
                        onSuccess = {},
                        onError = { erro -> Toast.makeText(context, erro, Toast.LENGTH_SHORT).show() }
                    )
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                enabled = !uiState.isLoading
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = OrangeBack)
                } else {
                    Text("ENTRAR", color = OrangeBack, fontWeight = FontWeight.Black)
                }
            }

            TextButton(onClick = { showCadastro = true }) {
                Text("Não tem uma conta? Cadastre-se aqui", color = Color.White, fontWeight = FontWeight.Bold)
            }
        }

        // ── DIÁLOGO 1: Reenviar e-mail de ativação ──────────────────────────
        if (showReenviarEmail) {
            AlertDialog(
                onDismissRequest = { showReenviarEmail = false },
                title = { Text("Reenviar Confirmação de Conta") },
                text = {
                    Column {
                        Text("Digite o e-mail cadastrado para receber um novo link de ativação:")
                        Spacer(Modifier.height(8.dp))
                        OutlinedTextField(
                            value = emailReenvio,
                            onValueChange = { emailReenvio = it },
                            label = { Text("E-mail") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            if (emailReenvio.isNotBlank()) {
                                viewModel.reenviarEmailConfirmacao(
                                    email = emailReenvio,
                                    onSuccess = { msg ->
                                        showReenviarEmail = false
                                        Toast.makeText(context, msg, Toast.LENGTH_LONG).show()
                                    },
                                    onError = { erro -> Toast.makeText(context, erro, Toast.LENGTH_LONG).show() }
                                )
                            }
                        },
                        enabled = !uiState.isLoading
                    ) {
                        if (uiState.isLoading) CircularProgressIndicator(Modifier.size(20.dp), color = Color.White)
                        else Text("REENVIAR")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showReenviarEmail = false }) { Text("CANCELAR") }
                }
            )
        }

        // ── DIÁLOGO 2: Esqueci a senha — passo 1 (e-mail) ───────────────────
        if (showEsqueciSenha) {
            AlertDialog(
                onDismissRequest = { showEsqueciSenha = false },
                title = { Text("Recuperar Senha") },
                text = {
                    OutlinedTextField(
                        value = emailRecuperacao,
                        onValueChange = { emailRecuperacao = it },
                        label = { Text("Digite seu e-mail") },
                        modifier = Modifier.fillMaxWidth()
                    )
                },
                confirmButton = {
                    Button(
                        onClick = {
                            viewModel.solicitarCodigoSenha(
                                email = emailRecuperacao,
                                onSuccess = {
                                    showEsqueciSenha = false
                                    showRedefinirSenha = true
                                },
                                onError = { msg -> Toast.makeText(context, msg, Toast.LENGTH_SHORT).show() }
                            )
                        },
                        enabled = !uiState.isLoading
                    ) {
                        if (uiState.isLoading) CircularProgressIndicator(Modifier.size(20.dp), color = Color.White)
                        else Text("ENVIAR CÓDIGO")
                    }
                }
            )
        }

        // ── DIÁLOGO 3: Redefinir senha — passo 2 (código + nova senha) ───────
        if (showRedefinirSenha) {
            AlertDialog(
                onDismissRequest = { showRedefinirSenha = false },
                title = { Text("Nova Senha") },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = codigoRecuperacao,
                            onValueChange = { codigoRecuperacao = it },
                            label = { Text("Código (6 dígitos)") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = novaSenha,
                            onValueChange = { novaSenha = it },
                            label = { Text("Nova Senha") },
                            visualTransformation = PasswordVisualTransformation(),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(onClick = {
                        viewModel.redefinirSenha(
                            token = codigoRecuperacao,
                            novaSenha = novaSenha,
                            onSuccess = {
                                showRedefinirSenha = false
                                Toast.makeText(context, "Senha alterada!", Toast.LENGTH_SHORT).show()
                            },
                            onError = { Toast.makeText(context, "Código Inválido!", Toast.LENGTH_SHORT).show() }
                        )
                    }) { Text("ALTERAR") }
                }
            )
        }

        // ── DIÁLOGO 4: Cadastro ──────────────────────────────────────────────
        if (showCadastro) {
            AlertDialog(
                onDismissRequest = { showCadastro = false },
                title = { Text("Criar Conta") },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(value = nomeCadastro, onValueChange = { nomeCadastro = it }, label = { Text("Nome Completo") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = emailCadastro, onValueChange = { emailCadastro = it }, label = { Text("E-mail") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = senhaCadastro, onValueChange = { senhaCadastro = it }, label = { Text("Senha") }, visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth())
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            viewModel.cadastrarUsuario(
                                nome = nomeCadastro,
                                email = emailCadastro,
                                senha = senhaCadastro,
                                onSuccess = {
                                    showCadastro = false
                                    Toast.makeText(context, "Confirme seu E-mail!", Toast.LENGTH_LONG).show()
                                },
                                onError = { erro -> Toast.makeText(context, erro, Toast.LENGTH_LONG).show() }
                            )
                        },
                        enabled = !uiState.isLoading
                    ) {
                        if (uiState.isLoading) CircularProgressIndicator(Modifier.size(20.dp), color = Color.White)
                        else Text("CADASTRAR")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showCadastro = false }) { Text("CANCELAR") }
                }
            )
        }
    }
}
