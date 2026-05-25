import SwiftUI
import Shared

struct ProfileView: View {
    @StateObject private var vm = ProfileObservableViewModel()

    var body: some View {
        NavigationView {
            ZStack {
                Color(hex: "110E15").ignoresSafeArea()

                if vm.uiState.carregandoPerfil {
                    ProgressView().tint(Color(hex: "E91E63"))
                } else {
                    ScrollView {
                        VStack(spacing: 20) {
                            // Nome e email
                            VStack(alignment: .leading, spacing: 4) {
                                Text(vm.uiState.nomeUsuario)
                                    .font(.largeTitle).fontWeight(.bold).foregroundColor(.white)
                                Text(vm.uiState.emailUsuario)
                                    .foregroundColor(.gray)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)

                            // Filtros
                            VStack(spacing: 10) {
                                Picker("Jogo", selection: Binding(
                                    get: { vm.uiState.jogoSelecionado?.nome ?? "" },
                                    set: { nome in
                                        if let jogo = vm.uiState.jogos.first(where: { $0.nome == nome }) {
                                            vm.selecionarJogo(jogo)
                                        }
                                    }
                                )) {
                                    ForEach(vm.uiState.jogos, id: \.id) { jogo in
                                        Text(jogo.nome).tag(jogo.nome)
                                    }
                                }
                                .pickerStyle(.menu)
                                .tint(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.white.opacity(0.08))
                                .cornerRadius(12)

                                HStack(spacing: 12) {
                                    Picker("Mês", selection: Binding(
                                        get: { vm.uiState.mesReferencia },
                                        set: { vm.setMesReferencia(mes: $0) }
                                    )) {
                                        ForEach(1...12, id: \.self) { m in
                                            Text("Mês \(m)").tag(Int32(m))
                                        }
                                    }
                                    .pickerStyle(.menu).tint(.white)
                                    .frame(maxWidth: .infinity).padding()
                                    .background(Color.white.opacity(0.08)).cornerRadius(12)

                                    Picker("Ano", selection: Binding(
                                        get: { vm.uiState.anoReferencia },
                                        set: { vm.setAnoReferencia(ano: $0) }
                                    )) {
                                        ForEach([2024, 2025, 2026], id: \.self) { a in
                                            Text("\(a)").tag(Int32(a))
                                        }
                                    }
                                    .pickerStyle(.menu).tint(.white)
                                    .frame(maxWidth: .infinity).padding()
                                    .background(Color.white.opacity(0.08)).cornerRadius(12)
                                }
                            }

                            // Gráfico de linha
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Evolução Mensal (Pontos)")
                                    .fontWeight(.bold).foregroundColor(.white)

                                if vm.uiState.carregandoGrafico {
                                    ProgressView().tint(Color(hex: "E91E63")).frame(height: 180)
                                } else {
                                    GraficoLinhaView(dados: vm.uiState.historicoGrafico)
                                        .frame(height: 180)
                                }
                            }
                            .padding(20)
                            .background(Color.white.opacity(0.04))
                            .cornerRadius(24)

                            // Comandas
                            Text("Minhas Comandas Recentes")
                                .font(.headline).fontWeight(.bold).foregroundColor(.white)
                                .frame(maxWidth: .infinity, alignment: .leading)

                            if vm.uiState.comandas.isEmpty {
                                Text("Nenhuma comanda encontrada.")
                                    .foregroundColor(.gray).font(.footnote)
                            } else {
                                ForEach(vm.uiState.comandas.filter { $0.aberta }, id: \.id) { comanda in
                                    ComandaCardView(comanda: comanda)
                                }
                            }
                        }
                        .padding(16)
                    }
                }
            }
            .navigationTitle("Perfil")
            .navigationBarTitleDisplayMode(.large)
        }
        .task { vm.inicializarPerfil() }
    }
}

struct GraficoLinhaView: View {
    let dados: [RankingPerfilDTO]

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height - 30
            let maxPts = max((dados.map { $0.pontos }.max() ?? 0), 100)
            let n = dados.count

            ZStack(alignment: .bottomLeading) {
                // Linhas de grade
                ForEach(0...3, id: \.self) { i in
                    let y = h * (1 - CGFloat(i) / 3)
                    Path { p in
                        p.move(to: CGPoint(x: 0, y: y))
                        p.addLine(to: CGPoint(x: w, y: y))
                    }
                    .stroke(Color.white.opacity(0.05), lineWidth: 1)
                }

                if n > 1 {
                    let pts = dados.enumerated().map { (i, item) -> CGPoint in
                        CGPoint(
                            x: CGFloat(i) * w / CGFloat(n - 1),
                            y: h * (1 - CGFloat(item.pontos) / CGFloat(maxPts))
                        )
                    }

                    // Linha
                    Path { p in
                        p.move(to: pts[0])
                        pts.dropFirst().forEach { p.addLine(to: $0) }
                    }
                    .stroke(Color(hex: "E91E63"), lineWidth: 3)

                    // Bolinhas e labels
                    ForEach(Array(pts.enumerated()), id: \.offset) { i, pt in
                        Circle()
                            .fill(Color(hex: "FFD700"))
                            .frame(width: 10, height: 10)
                            .position(pt)

                        Text(dados[i].nomeMes)
                            .font(.system(size: 9))
                            .foregroundColor(.gray)
                            .position(x: pt.x, y: h + 18)

                        if dados[i].pontos > 0 {
                            Text("\(Int(dados[i].pontos))")
                                .font(.system(size: 8)).fontWeight(.bold)
                                .foregroundColor(.white)
                                .position(x: pt.x, y: pt.y - 14)
                        }
                    }
                }
            }
        }
    }
}

struct ComandaCardView: View {
    let comanda: ComandaResponseDTO
    @State private var expandido = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button(action: { withAnimation { expandido.toggle() } }) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Comanda #\(comanda.id)").fontWeight(.bold).foregroundColor(.white)
                        Text(comanda.dataAbertura.components(separatedBy: "T").first ?? "")
                            .font(.caption).foregroundColor(.gray)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("R$ \(String(format: "%.2f", comanda.valorTotal))")
                            .fontWeight(.black).foregroundColor(Color(hex: "FFD700"))
                        Text(comanda.aberta ? "Aberta" : "Paga")
                            .font(.caption).fontWeight(.bold)
                            .foregroundColor(comanda.aberta ? Color(hex: "FF9800") : Color(hex: "4CAF50"))
                    }
                }
                .padding(16)
            }

            if expandido {
                Divider().background(Color.white.opacity(0.1)).padding(.horizontal, 16)
                VStack(alignment: .leading, spacing: 8) {
                    Text("PRODUTOS CONSUMIDOS:")
                        .font(.caption).fontWeight(.bold).foregroundColor(.gray)
                    ForEach(comanda.itens, id: \.produtoId) { item in
                        HStack {
                            Text("\(item.quantidade)x  \(item.descricaoProduto)")
                                .font(.footnote).foregroundColor(.white.opacity(0.9))
                            Spacer()
                            Text("R$ \(String(format: "%.2f", Double(item.quantidade) * item.precoUnitario))")
                                .font(.footnote).foregroundColor(.white)
                        }
                    }
                    Text("Toque para recolher")
                        .font(.system(size: 10)).foregroundColor(.gray)
                        .frame(maxWidth: .infinity, alignment: .center)
                }
                .padding(16)
            }
        }
        .background(Color(hex: "1E1E1E"))
        .cornerRadius(12)
    }
}