import Foundation
import Shared

// ─────────────────────────────────────────────────────────────────────────────
// KoinHelper
//
// Swift não consegue chamar funções genéricas de Kotlin diretamente.
// Este arquivo centraliza a resolução de dependências do Koin para o iOS.
// ─────────────────────────────────────────────────────────────────────────────

enum KoinHelper {
    static func getLoginViewModel() -> LoginViewModel {
        return LoginViewModelHelper().get()
    }
    static func getEventosViewModel() -> EventosViewModel {
        return EventosViewModelHelper().get()
    }
    static func getRankingViewModel() -> RankingViewModel {
        return RankingViewModelHelper().get()
    }
    static func getProfileViewModel() -> ProfileViewModel {
        return ProfileViewModelHelper().get()
    }
    static func getAuthRepository() -> AuthRepository {
        return AuthRepositoryHelper().get()
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// KoinInitKt — chamado no App.init()
// ─────────────────────────────────────────────────────────────────────────────
// (O módulo Kotlin precisa exportar uma função doInitKoin() no iosMain)
