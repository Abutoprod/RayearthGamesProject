import SwiftUI
import Shared

struct EventosView: View {
    @StateObject private var vm = EventosObservableViewModel()
    @State private var filialSelecionada = "Todas"
    @State private var jogoSelecionado = "Todos"
    private let authRepository = KoinHelper.getAuthRepository()
    @State private var meuId: Int64 = 0

    var eventosFiltrados: [EventoDTO] {
        vm.uiState.eventos.filter {
            (filialSelecionada == "Todas" || $0.filialNome == filialSelecionada) &&
            (jogoSelecionado == "Todos" || $0.jogoNome == jogoSelecionado)
        }
    }

    var body: some View {
        NavigationView {
            ZStack {
                Color.black.ignoresSafeArea()

                if vm.uiState.isLoading && vm.uiState.eventos.isEmpty {
                    ProgressView().tint(Color(hex: "E91E63"))
                } else {
                    ScrollView {
                        // Filtros
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack {
                                ForEach(vm.uiState.filiais, id: \.self) { f in
                                    FilterPill(text: f, selected: f == filialSelecionada) { filialSelecionada = f }
                                }
                            }.padding(.horizontal)
                        }
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack {
                                ForEach(vm.uiState.jogos, id: \.self) { j in
                                    FilterPill(text: j, selected: j == jogoSelecionado) { jogoSelecionado = j }
                                }
                            }.padding(.horizontal)
                        }

                        LazyVStack(spacing: 20) {
                            ForEach(eventosFiltrados, id: \.id) { evento in
                                EventoCardView(
                                    evento: evento,
                                    estaInscrito: vm.uiState.inscritosPorEvento[evento.id]?.contains(meuId) ?? false,
                                    onAcao: { vm.toggleInscricao(eventoId: evento.id, meuId: meuId) { _ in } }
                                )
                            }
                        }.padding(16)
                    }
                }
            }
            .navigationTitle("Eventos Rayearth")
            .navigationBarTitleDisplayMode(.large)
        }
        .task { meuId = (try? await authRepository.getStoredUserId()) ?? 0 }
    }
}

struct EventoCardView: View {
    let evento: EventoDTO
    let estaInscrito: Bool
    let onAcao: () -> Void

    var body: some View {
        let nomeArquivoLimpo = evento.urlImagem
            .components(separatedBy: "/").last?
            .replacingOccurrences(of: " ", with: "_")
            .replacingOccurrences(of: ":", with: "") ?? ""

        let (dia, hora) = parseData(evento.dataHora)

        VStack(alignment: .leading, spacing: 0) {
            ZStack(alignment: .topLeading) {
                AsyncImage(url: URL(string: nomeArquivoLimpo.isEmpty ? "" : "http://129.121.46.153:8080/uploads/\(nomeArquivoLimpo)")) { img in
                    img.resizable().scaledToFill()
                } placeholder: { Color(hex: "1A1A1A") }
                .frame(height: 180).clipped()

                // Badge data
                VStack(spacing: 2) {
                    Text(dia).font(.subheadline).fontWeight(.black).foregroundColor(.white)
                    Text(hora).font(.caption).fontWeight(.bold).foregroundColor(Color(hex: "E91E63"))
                }
                .padding(.horizontal, 10).padding(.vertical, 6)
                .background(Color.black.opacity(0.75))
                .cornerRadius(10)
                .padding(12)
            }

            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    TagPill(text: evento.jogoNome)
                    TagPill(text: evento.filialNome)
                }
                Text(evento.titulo).fontWeight(.bold).foregroundColor(.white).lineLimit(2)
                Text(evento.descricao).font(.caption).foregroundColor(.gray).lineLimit(2)

                Button(action: onAcao) {
                    Text(estaInscrito ? "Cancelar inscrição" : "Inscrever-me")
                        .fontWeight(.semibold)
                        .foregroundColor(estaInscrito ? .gray : .white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(estaInscrito ? Color(hex: "1A1A1A") : Color(hex: "E91E63"))
                        .cornerRadius(10)
                }
            }
            .padding(16)
        }
        .background(Color(hex: "141414"))
        .cornerRadius(20)
    }

    func parseData(_ dataHora: String) -> (String, String) {
        let partes = dataHora.split(separator: "T")
        guard partes.count >= 2 else { return ("--/--", "--:--") }
        let data = partes[0].split(separator: "-")
        guard data.count == 3 else { return ("--/--", "--:--") }
        let hora = String(partes[1].prefix(5))
        return ("\(data[2])/\(data[1])", hora)
    }
}

struct FilterPill: View {
    let text: String
    let selected: Bool
    let onTap: () -> Void
    var body: some View {
        Button(action: onTap) {
            Text(text).font(.caption).fontWeight(.semibold)
                .padding(.horizontal, 12).padding(.vertical, 6)
                .background(selected ? Color(hex: "E91E63") : Color(hex: "1A1A1A"))
                .foregroundColor(selected ? .white : .gray)
                .cornerRadius(20)
        }
    }
}

struct TagPill: View {
    let text: String
    var body: some View {
        Text(text).font(.caption)
            .padding(.horizontal, 8).padding(.vertical, 4)
            .background(Color(hex: "2A2A2A"))
            .foregroundColor(.gray)
            .cornerRadius(6)
    }
}