import SwiftUI
import Shared

struct MainMenuView: View {
    let onLogout: () -> Void
    @StateObject private var vm = MainMenuObservableViewModel()
    @State private var selectedTab = 0
    private let authRepository = KoinHelper.getAuthRepository()
    @State private var userName = ""

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeTab(vm: vm, userName: userName, onLogout: {
                Task {
                    try? await authRepository.logout()
                    onLogout()
                }
            })
            .tabItem { Label("Início", systemImage: "house.fill") }
            .tag(0)

            EventosView()
                .tabItem { Label("Eventos", systemImage: "calendar") }
                .tag(1)

            RankingView()
                .tabItem { Label("Ranking", systemImage: "trophy.fill") }
                .tag(2)

            ProfileView()
                .tabItem { Label("Perfil", systemImage: "person.fill") }
                .tag(3)
        }
        .accentColor(Color(hex: "F56228"))
        .task {
            userName = (try? await authRepository.getStoredUserName()) ?? "Jogador"
            vm.carregarDados(isPrimeiroDia: Calendar.current.component(.day, from: Date()) == 1)
        }
    }
}

struct HomeTab: View {
    @ObservedObject var vm: MainMenuObservableViewModel
    let userName: String
    let onLogout: () -> Void

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 18) {
                    // Card boas vindas
                    HStack {
                        VStack(alignment: .leading) {
                            Text("Olá, \(userName)!")
                                .font(.title2).fontWeight(.black).foregroundColor(.white)
                            HStack(spacing: 4) {
                                Image(systemName: "trophy.fill").foregroundColor(Color(hex: "F56228")).font(.caption)
                                Text(vm.uiState.rankingResumo)
                                    .font(.caption).foregroundColor(.white).fontWeight(.bold)
                            }
                            .padding(.horizontal, 10).padding(.vertical, 5)
                            .background(Color(hex: "F56228").opacity(0.15))
                            .cornerRadius(8)
                        }
                        Spacer()
                    }
                    .padding(20)
                    .background(Color(hex: "1E1928").opacity(0.45))
                    .cornerRadius(20)

                    // Carrossel banners
                    TabView {
                        ForEach(1...4, id: \.self) { i in
                            AsyncImage(url: URL(string: "http://129.121.46.153:8080/uploads/carrossel_\(i).jpg")) { img in
                                img.resizable().scaledToFill()
                            } placeholder: {
                                Color(hex: "1A1A1A")
                            }
                            .frame(maxWidth: .infinity)
                            .clipped()
                        }
                    }
                    .tabViewStyle(.page)
                    .frame(height: 195)
                    .cornerRadius(18)

                    // Avisos
                    if !vm.uiState.avisos.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Novidades da Temporada")
                                .font(.headline).fontWeight(.black).foregroundColor(.white)
                            ForEach(vm.uiState.avisos, id: \.id) { aviso in
                                AvisoCard(aviso: aviso)
                            }
                        }
                    }
                }
                .padding(16)
            }
            .background(Color.black.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Image("rayeart").resizable().frame(width: 32, height: 32).clipShape(Circle())
                }
                ToolbarItem(placement: .principal) {
                    Text("Rayearth Games").fontWeight(.black).foregroundColor(.white)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: onLogout) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                            .foregroundColor(.gray)
                    }
                }
            }
        }
    }
}

struct AvisoCard: View {
    let aviso: AvisoComunidadeDTO

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let urlFoto = aviso.urlFoto, !urlFoto.isEmpty {
                AsyncImage(url: URL(string: "http://129.121.46.153:8080/images/avisos/\(urlFoto)")) { img in
                    img.resizable().scaledToFill()
                } placeholder: { Color(hex: "1A1A1A") }
                .frame(height: 140).clipped()
            }
            VStack(alignment: .leading, spacing: 4) {
                Text("Aviso do admin").fontWeight(.bold).foregroundColor(.white)
                Text(aviso.mensagem).font(.caption).foregroundColor(.white.opacity(0.65))
            }
            .padding(12)
        }
        .background(Color(hex: "15121B"))
        .cornerRadius(16)
    }
}