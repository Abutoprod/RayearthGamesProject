import SwiftUI
import Shared

struct RankingView: View {
    @StateObject private var vm = RankingObservableViewModel()
    @State private var mes = Calendar.current.component(.month, from: Date())
    @State private var ano = Calendar.current.component(.year, from: Date())
    private let authRepository = KoinHelper.getAuthRepository()
    @State private var meuId: Int64 = 0

    var body: some View {
        NavigationView {
            ZStack {
                Color.black.ignoresSafeArea()
                VStack(spacing: 0) {
                    // Filtros
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack {
                            ForEach(vm.uiState.jogos, id: \.id) { jogo in
                                FilterPill(
                                    text: jogo.nome,
                                    selected: vm.uiState.jogoSelecionado?.id == jogo.id
                                ) { vm.selecionarJogo(jogo) }
                            }
                        }.padding(.horizontal)
                    }
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack {
                            ForEach(vm.uiState.filiais, id: \.id) { filial in
                                FilterPill(
                                    text: filial.nome,
                                    selected: vm.uiState.filialSelecionada?.id == filial.id
                                ) { vm.selecionarFilial(filial) }
                            }
                        }.padding(.horizontal)
                    }
                    .padding(.bottom, 8)

                    if vm.uiState.isLoading {
                        Spacer()
                        ProgressView().tint(Color(hex: "E91E63"))
                        Spacer()
                    } else {
                        List {
                            ForEach(Array(vm.uiState.ranking.enumerated()), id: \.offset) { index, jogador in
                                RankingRow(posicao: index + 1, jogador: jogador, isMe: jogador.usuarioId == meuId)
                                    .listRowBackground(Color(hex: "141414"))
                            }
                        }
                        .listStyle(.plain)
                        .scrollContentBackground(.hidden)
                    }
                }
            }
            .navigationTitle("Ranking Mensal")
            .navigationBarTitleDisplayMode(.large)
        }
        .task {
            meuId = (try? await authRepository.getStoredUserId()) ?? 0
        }
        .onChange(of: vm.uiState.jogoSelecionado) { _ in buscarRanking() }
        .onChange(of: vm.uiState.filialSelecionada) { _ in buscarRanking() }
    }

    func buscarRanking() {
        guard let jId = vm.uiState.jogoSelecionado?.id,
              let fId = vm.uiState.filialSelecionada?.id else { return }
        vm.buscarRanking(jogoId: jId, filialId: fId, mes: Int32(mes), ano: Int32(ano))
    }
}

struct RankingRow: View {
    let posicao: Int
    let jogador: RankingDTO
    let isMe: Bool

    var medalhaColor: Color {
        switch posicao {
        case 1: return Color(hex: "FFD700")
        case 2: return Color(hex: "C0C0C0")
        case 3: return Color(hex: "CD7F32")
        default: return .gray
        }
    }

    var body: some View {
        HStack(spacing: 12) {
            Text("\(posicao)°")
                .fontWeight(.bold)
                .foregroundColor(medalhaColor)
                .frame(width: 36)
            VStack(alignment: .leading) {
                Text(jogador.usuarioNome).fontWeight(.semibold).foregroundColor(.white)
                if isMe { Text("Você").font(.caption).foregroundColor(Color(hex: "E91E63")) }
            }
            Spacer()
            Text("\(jogador.totalPontos) pts").fontWeight(.bold).foregroundColor(.white)
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 16)
        .background(isMe ? Color(hex: "1E0A14") : Color.clear)
        .cornerRadius(12)
    }
}