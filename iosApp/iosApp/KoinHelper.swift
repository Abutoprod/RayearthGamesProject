import Foundation
import Shared

enum KoinHelper {
    static func getLoginViewModel() -> LoginViewModel {
        return KoinApplication.shared.koin.get()
    }
    static func getEventosViewModel() -> EventosViewModel {
        return KoinApplication.shared.koin.get()
    }
    static func getRankingViewModel() -> RankingViewModel {
        return KoinApplication.shared.koin.get()
    }
    static func getProfileViewModel() -> ProfileViewModel {
        return KoinApplication.shared.koin.get()
    }
    static func getMainMenuViewModel() -> MainMenuViewModel {
        return KoinApplication.shared.koin.get()
    }
    static func getAuthRepository() -> AuthRepository {
        return KoinApplication.shared.koin.get()
    }
}