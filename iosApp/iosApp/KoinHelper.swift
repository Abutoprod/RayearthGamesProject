import Foundation
import Shared

// Koin 4.x — acesso via funções provider exportadas do Kotlin (IosKoinInit.kt)
// KoinApplication.shared.koin.get() era API Koin 3.x e não existe mais no 4.x
enum KoinHelper {
    static func getLoginViewModel() -> LoginViewModel {
        return IosKoinInitKt.provideLoginViewModel()
    }
    static func getMainMenuViewModel() -> MainMenuViewModel {
        return IosKoinInitKt.provideMainMenuViewModel()
    }
    static func getEventosViewModel() -> EventosViewModel {
        return IosKoinInitKt.provideEventosViewModel()
    }
    static func getRankingViewModel() -> RankingViewModel {
        return IosKoinInitKt.provideRankingViewModel()
    }
    static func getProfileViewModel() -> ProfileViewModel {
        return IosKoinInitKt.provideProfileViewModel()
    }
    static func getAuthRepository() -> AuthRepository {
        return IosKoinInitKt.provideAuthRepository()
    }
}
