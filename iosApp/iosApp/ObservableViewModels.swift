import SwiftUI
import Shared

// StateFlowWatcher: wrapper Kotlin (StateFlowWatcher.kt) que coleta o StateFlow
// num CoroutineScope(Dispatchers.Main) e dispara um callback Swift.
// Substitui "for await state in vm.uiState" — StateFlow do Kotlin/Native 2.x
// não conforma com AsyncSequence, logo o for-await não funciona.

// ── Login ─────────────────────────────────────────────────────────────────────

@MainActor
final class LoginObservableViewModel: ObservableObject {
    @Published private(set) var uiState: AuthUiState = AuthUiState(
        isLoading: false, error: nil, isSuccess: false
    )
    private let vm: LoginViewModel = KoinHelper.getLoginViewModel()
    private let watcher = StateFlowWatcher()

    init() {
        watcher.watchAuthUiState(flow: vm.uiState) { [weak self] state in
            self?.uiState = state
        }
    }
    deinit { watcher.cancel() }

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
    private let watcher = StateFlowWatcher()

    init() {
        watcher.watchMenuUiState(flow: vm.uiState) { [weak self] state in
            self?.uiState = state
        }
    }
    deinit { watcher.cancel() }

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
    private let watcher = StateFlowWatcher()

    init() {
        watcher.watchEventosUiState(flow: vm.uiState) { [weak self] state in
            self?.uiState = state
        }
    }
    deinit { watcher.cancel() }

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
    private let watcher = StateFlowWatcher()

    init() {
        watcher.watchRankingUiState(flow: vm.uiState) { [weak self] state in
            self?.uiState = state
        }
    }
    deinit { watcher.cancel() }

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
    private let watcher = StateFlowWatcher()

    init() {
        watcher.watchProfileUiState(flow: vm.uiState) { [weak self] state in
            self?.uiState = state
        }
    }
    deinit { watcher.cancel() }

    func inicializarPerfil() { vm.inicializarPerfil() }
    func selecionarJogo(_ jogo: JogoDTO) { vm.selecionarJogo(jogo: jogo) }
    func selecionarFilial(_ filial: FilialResponse) { vm.selecionarFilial(filial: filial) }
    func setMesReferencia(mes: Int32) { vm.setMesReferencia(mes: Int32(mes)) }
    func setAnoReferencia(ano: Int32) { vm.setAnoReferencia(ano: Int32(ano)) }
}
