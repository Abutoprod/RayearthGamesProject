import SwiftUI
import Combine
import Shared

// ─────────────────────────────────────────────────────────────────────────────
// ObservableViewModel
//
// O Swift não observa StateFlow do Kotlin automaticamente.
// Este wrapper genérico assina qualquer StateFlow e republica
// as mudanças como @Published para que as Views SwiftUI reajam.
// ─────────────────────────────────────────────────────────────────────────────

@MainActor
class ObservableState<T: AnyObject>: ObservableObject {
    @Published var value: T

    private var task: Task<Void, Never>?

    init(initialValue: T, flow: Kotlinx_coroutines_coreStateFlow) {
        self.value = initialValue
        task = Task { [weak self] in
            for await newValue in flow {
                guard let self = self else { break }
                if let typed = newValue as? T {
                    self.value = typed
                }
            }
        }
    }

    deinit { task?.cancel() }
}

// ─────────────────────────────────────────────────────────────────────────────
// LoginObservableViewModel
// ─────────────────────────────────────────────────────────────────────────────

@MainActor
final class LoginObservableViewModel: ObservableObject {
    @Published private(set) var uiState: AuthUiState

    private let vm: LoginViewModel

    init() {
        self.vm = KoinHelper.getLoginViewModel()
        self.uiState = vm.uiState.value as! AuthUiState
        observeState()
    }

    private func observeState() {
        Task {
            for await state in vm.uiState {
                if let typed = state as? AuthUiState {
                    uiState = typed
                }
            }
        }
    }

    func login(email: String, senha: String, onSuccess: @escaping () -> Void) {
        vm.login(email: email, senha: senha, onSuccess: { onSuccess() })
    }

    func registrar(nome: String, email: String, senha: String, onSuccess: @escaping () -> Void) {
        vm.registrar(nome: nome, email: email, senha: senha, onSuccess: { onSuccess() })
    }

    func solicitarCodigoSenha(email: String, onSuccess: @escaping () -> Void) {
        vm.solicitarCodigoSenha(email: email, onSuccess: { onSuccess() })
    }

    func redefinirSenha(token: String, novaSenha: String, onSuccess: @escaping () -> Void) {
        vm.redefinirSenha(token: token, novaSenha: novaSenha, onSuccess: { onSuccess() })
    }

    func clearError() { vm.clearError() }
}

// ─────────────────────────────────────────────────────────────────────────────
// EventosObservableViewModel
// ─────────────────────────────────────────────────────────────────────────────

@MainActor
final class EventosObservableViewModel: ObservableObject {
    @Published private(set) var uiState: EventosUiState

    private let vm: EventosViewModel

    init() {
        self.vm = KoinHelper.getEventosViewModel()
        self.uiState = vm.uiState.value as! EventosUiState
        observeState()
    }

    private func observeState() {
        Task {
            for await state in vm.uiState {
                if let typed = state as? EventosUiState {
                    uiState = typed
                }
            }
        }
    }

    func toggleInscricao(eventoId: Int64, meuId: Int64, onErro: @escaping (String) -> Void) {
        vm.toggleInscricao(eventoId: eventoId, meuId: meuId, onErro: { msg in onErro(msg) })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// RankingObservableViewModel
// ─────────────────────────────────────────────────────────────────────────────

@MainActor
final class RankingObservableViewModel: ObservableObject {
    @Published private(set) var uiState: RankingUiState

    private let vm: RankingViewModel

    init() {
        self.vm = KoinHelper.getRankingViewModel()
        self.uiState = vm.uiState.value as! RankingUiState
        observeState()
    }

    private func observeState() {
        Task {
            for await state in vm.uiState {
                if let typed = state as? RankingUiState {
                    uiState = typed
                }
            }
        }
    }

    func selecionarJogo(_ jogo: JogoDTO) { vm.selecionarJogo(jogo: jogo) }
    func selecionarFilial(_ filial: FilialResponse) { vm.selecionarFilial(filial: filial) }
    func buscarRanking(jogoId: Int64, filialId: Int64, mes: Int32, ano: Int32) {
        vm.buscarRanking(jogoId: jogoId, filialId: filialId, mes: mes, ano: ano)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ProfileObservableViewModel
// ─────────────────────────────────────────────────────────────────────────────

@MainActor
final class ProfileObservableViewModel: ObservableObject {
    @Published private(set) var uiState: ProfileUiState

    private let vm: ProfileViewModel

    init() {
        self.vm = KoinHelper.getProfileViewModel()
        self.uiState = vm.uiState.value as! ProfileUiState
        observeState()
    }

    private func observeState() {
        Task {
            for await state in vm.uiState {
                if let typed = state as? ProfileUiState {
                    uiState = typed
                }
            }
        }
    }

    func inicializarPerfil() { vm.inicializarPerfil() }
    func selecionarJogo(_ jogo: JogoDTO) { vm.selecionarJogo(jogo: jogo) }
    func selecionarFilial(_ filial: FilialResponse) { vm.selecionarFilial(filial: filial) }
}
