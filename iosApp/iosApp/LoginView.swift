import SwiftUI
import Shared

struct LoginView: View {
    let onLoginSuccess: () -> Void

    @StateObject private var vm = LoginObservableViewModel()
    @State private var email = ""
    @State private var senha = ""
    @State private var showCadastro = false
    @State private var showEsqueciSenha = false
    @State private var showRedefinirSenha = false
    @State private var showReenviar = false
    @State private var emailRecuperacao = ""
    @State private var emailReenvio = ""
    @State private var codigoRecuperacao = ""
    @State private var novaSenha = ""
    @State private var nomeCadastro = ""
    @State private var emailCadastro = ""
    @State private var senhaCadastro = ""
    @State private var toastMsg = ""
    @State private var showToast = false

    var body: some View {
        ZStack {
            // Fundo degradê laranja/amarelo
            LinearGradient(
                colors: [Color(hex: "F56228").opacity(0.9), Color(hex: "FFD54F").opacity(0.8)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 20) {
                Spacer()

                // Logo
                ZStack {
                    Circle()
                        .fill(Color.white.opacity(0.15))
                        .frame(width: 110, height: 110)
                        .overlay(Circle().stroke(Color.white, lineWidth: 2))
                    Image("rayeart")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 70, height: 70)
                }

                Text("RAYEARTH GAMES")
                    .font(.headline)
                    .fontWeight(.black)
                    .foregroundColor(.white)

                // Campos
                VStack(spacing: 16) {
                    RayearthTextField(placeholder: "E-mail", text: $email, isSecure: false)
                    RayearthTextField(placeholder: "Senha", text: $senha, isSecure: true)
                }
                .padding(.top, 8)

                // Links auxiliares
                VStack(spacing: 4) {
                    Button("Esqueci minha senha") { showEsqueciSenha = true }
                        .foregroundColor(.white.opacity(0.8))
                        .font(.footnote)

                    Button("Não recebeu o e-mail de ativação? Reenviar") { showReenviar = true }
                        .foregroundColor(.white.opacity(0.8))
                        .font(.footnote)
                        .multilineTextAlignment(.center)
                }

                // Botão entrar
                Button {
                    vm.login(email: email, senha: senha) {
                        onLoginSuccess()
                    }
                } label: {
                    ZStack {
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Color.white)
                            .frame(height: 54)
                        if vm.uiState.isLoading {
                            ProgressView().tint(Color(hex: "F56228"))
                        } else {
                            Text("ENTRAR")
                                .fontWeight(.black)
                                .foregroundColor(Color(hex: "F56228"))
                        }
                    }
                }
                .disabled(vm.uiState.isLoading)

                Button("Não tem uma conta? Cadastre-se aqui") { showCadastro = true }
                    .foregroundColor(.white)
                    .fontWeight(.bold)
                    .font(.footnote)

                Spacer()
            }
            .padding(.horizontal, 32)

            // Toast de erro
            if showToast {
                VStack {
                    Spacer()
                    Text(toastMsg)
                        .padding()
                        .background(Color.black.opacity(0.8))
                        .foregroundColor(.white)
                        .cornerRadius(12)
                        .padding(.bottom, 40)
                }
                .transition(.move(edge: .bottom))
            }
        }
        .onChange(of: vm.uiState.error) { error in
            if let error = error {
                toastMsg = error
                withAnimation { showToast = true }
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    withAnimation { showToast = false }
                }
            }
        }
        // Diálogo esqueci a senha
        .alert("Recuperar Senha", isPresented: $showEsqueciSenha) {
            TextField("E-mail", text: $emailRecuperacao)
            Button("Enviar Código") {
                vm.solicitarCodigoSenha(email: emailRecuperacao) {
                    showRedefinirSenha = true
                }
            }
            Button("Cancelar", role: .cancel) {}
        }
        // Diálogo redefinir senha
        .alert("Nova Senha", isPresented: $showRedefinirSenha) {
            TextField("Código (6 dígitos)", text: $codigoRecuperacao)
            SecureField("Nova Senha", text: $novaSenha)
            Button("Alterar") {
                vm.redefinirSenha(token: codigoRecuperacao, novaSenha: novaSenha) {
                    toastMsg = "Senha alterada!"
                    withAnimation { showToast = true }
                }
            }
            Button("Cancelar", role: .cancel) {}
        }
        // Diálogo reenviar
        .alert("Reenviar Confirmação", isPresented: $showReenviar) {
            TextField("E-mail", text: $emailReenvio)
            Button("Reenviar") {
                vm.reenviarEmailConfirmacao(email: emailReenvio) { msg in
                    toastMsg = msg
                    withAnimation { showToast = true }
                }
            }
            Button("Cancelar", role: .cancel) {}
        }
        // Diálogo cadastro
        .sheet(isPresented: $showCadastro) {
            CadastroView(onSuccess: {
                showCadastro = false
                toastMsg = "Confirme seu E-mail!"
                withAnimation { showToast = true }
            }, onDismiss: { showCadastro = false })
        }
    }
}

struct RayearthTextField: View {
    let placeholder: String
    @Binding var text: String
    let isSecure: Bool

    var body: some View {
        Group {
            if isSecure {
                SecureField(placeholder, text: $text)
            } else {
                TextField(placeholder, text: $text)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
            }
        }
        .padding()
        .background(Color.white.opacity(0.15))
        .cornerRadius(16)
        .foregroundColor(.white)
        .tint(.white)
    }
}

struct CadastroView: View {
    let onSuccess: () -> Void
    let onDismiss: () -> Void
    @StateObject private var vm = LoginObservableViewModel()
    @State private var nome = ""
    @State private var email = ""
    @State private var senha = ""

    var body: some View {
        NavigationView {
            Form {
                TextField("Nome Completo", text: $nome)
                TextField("E-mail", text: $email).keyboardType(.emailAddress).autocapitalization(.none)
                SecureField("Senha", text: $senha)
            }
            .navigationTitle("Criar Conta")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Cadastrar") {
                        vm.registrar(nome: nome, email: email, senha: senha) { onSuccess() }
                    }
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { onDismiss() }
                }
            }
        }
    }
}