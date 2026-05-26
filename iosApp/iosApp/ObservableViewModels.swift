import SwiftUI
import Shared

// As funções watchXxxUiState() estão em StateFlowWatcher.kt (iosMain) e são expostas
// em Swift como StateFlowWatcherKt.watchXxx(vm:onState:).
// Elas retornam FlowCancellable — guarde e chame .cancel() no deinit.
//
// Por que não "for await state in vm.uiState"?
// StateFlow do Kotlin/Native não conforma com AsyncSequence.
// Por que não StateFlowWatcher (classe)? StateFlow<T> nos parâmetros dos métodos
// impede o Kotlin/Native de exportar a classe para o header ObjC.

// ── Login ─────────────────────────────────────────────────────────────────────

@MainActor
final class LoginObservableViewModel: ObservableObject {
    @Published private(set) var uiState: AuthUiState = AuthUiState(
        isLoading: false, error: nil, isSuccess: false
    )
    private let vm: LoginViewModel = KoinHelper.getLoginViewModel()
    private var cancellable: FlowCancellable?

    init() {
        cancellable = StateFlowWatcherKt.watchLoginUiState(vm: vm) { [weak self] state in
            self?.uiState = state
        }
    }
    deinit { cancellable?.cancel() }

    func login(email: String, senha: String, onSuccess: @escaping () -> Void) {
        vm.login(email: email, senha: senha, onSuccess: { onSuccess() }, onError: { _ in })
    }
    func registrar(nome: String, email: String, senha: String, onSuccess: @escaping () -> Void) {
        vm.cadastrarUsuario(nome: nome, email: email, senha: senha, onSuccess: { onSuccess() }, onError: { _ in })
    }
    func solicitarCodigoSenha(email: String, onSuccess: @escaping () -> Void) {
        vm.solicitarCodigoSenha(email: email, onSuccess: { onSuccess() }, onError: { _ in })
    }
    func redefinirSenha(token: String, novaSenha: String, onSuccess: @escaping () -> Void) {
        vm.redefinirSenha(token: token, novaSenha: novaSenha, onSuccess: { onSuccess() }, onError: { _ in })
    }
    func reenviarEmailConfirmacao(email: String, onSuccess: @escaping (String) -> Void) {
        vm.reenviarEmailConfirmacao(email: email, onSuccess: { msg in onSuccess(msg) }, onError: { _ in })
    }
}

// ── MainMenu ──────────────────────────────────────────────────────────────────

@MainActor
final class MainMenuObservableViewModel: ObservableObject {
    @Published private(set) var uiState: MenuUiState = MenuUiState(
        isLoading: false, avisos: [], rankingResumo: "Carregando...", conquistasCampeao: []
    )
    private let vm: MainMenuViewModel = KoinHelper.getMainMenuViewModel()
    private var cancellable: FlowCancellable?

    init() {
        cancellable = StateFlowWatcherKt.watchMenuUiState(vm: vm) { [weak self] state in
            self?.uiState = state
        }
    }
    deinit { cancellable?.cancel() }

    func carregarDados(isPrimeiroDia: Bool) {
        vm.carregarDados(isPrimeiroDia: isPrimeiroDia)
    }
    func dispensarConquista() { vm.dispensarConquista() }
}

// ── Eventos ───────────────────────────────────────────────────────────────────

@MainActor
final class EventosObservableViewModel: ObservableObject {
    @Published private(set) var uiState: EventosUiState = EventosUiState(
        isLoading: false, eventos: [], filiais: ["Todas"], jogos: ["Todos"],
        inscritosPorEvento: [:], error: nil
    )
    private let vm: EventosViewModel = KoinHelper.getEventosViewModel()
    private var cancellable: FlowCancellable?

    init() {
        cancellable = StateFlowWatcherKt.watchEventosUiState(vm: vm) { [weak self] state in
            self?.uiState = state
        }
    }
    deinit { cancellable?.cancel() }

    func toggleInscricao(eventoId: Int64, meuId: Int64, onErro: @escaping (String) -> Void) {
        vm.toggleInscricao(eventoId: eventoId, meuId: meuId, onErro: { msg in onErro(msg) })
    }
}

// ── Ranking ───────────────────────────────────────────────────────────────────

@MainActor
final class RankingObservableViewModel: ObservableObject {
    @Published private(set) var uiState: RankingUiState = RankingUiState(
        isLoading: false, jogos: [], jogoSelecionado: nil,
        filiais: [], filialSelecionada: nil, ranking: [], error: nil
    )
    private let vm: RankingViewModel = KoinHelper.getRankingViewModel()
    private var cancellable: FlowCancellable?

    init() {
        cancellable = StateFlowWatcherKt.watchRankingUiState(vm: vm) { [weak self] state in
            self?.uiState = state
        }
    }
    deinit { cancellable?.cancel() }

    func selecionarJogo(_ jogo: JogoDTO) { vm.selecionarJogo(jogo: jogo) }
    func selecionarFilial(_ filial: FilialResponse) { vm.selecionarFilial(filial: filial) }
    func buscarRanking(jogoId: Int64, filialId: Int64, mes: Int32, ano: Int32) {
        vm.buscarRanking(jogoId: jogoId, filialId: filialId, mes: mes, ano: ano)
    }
}

// ── Profile ───────────────────────────────────────────────────────────────────

@MainActor
final class ProfileObservableViewModel: ObservableObject {
    @Published private(set) var uiState: ProfileUiState = ProfileUiState(
        nomeUsuario: "Carregando...", emailUsuario: "",
        jogos: [], filiais: [], jogoSelecionado: nil, filialSelecionada: nil,
        historicoGrafico: [], comandas: [],
        mesReferencia: 1, anoReferencia: 2025,
        carregandoPerfil: true, carregandoGrafico: false
    )
    private let vm: ProfileViewModel = KoinHelper.getProfileViewModel()
    private var cancellable: FlowCancellable?

    init() {
        cancellable = StateFlowWatcherKt.watchProfileUiState(vm: vm) { [weak self] state in
            self?.uiState = state
        }
    }
    deinit { cancellable?.cancel() }

    func inicializarPerfil() { vm.inicializarPerfil() }
    func selecionarJogo(_ jogo: JogoDTO) { vm.selecionarJogo(jogo: jogo) }
    func selecionarFilial(_ filial: FilialResponse) { vm.selecionarFilial(filial: filial) }
    func setMesReferencia(mes: Int32) { vm.setMesReferencia(mes: Int32(mes)) }
    func setAnoReferencia(ano: Int32) { vm.setAnoReferencia(ano: Int32(ano)) }
}
