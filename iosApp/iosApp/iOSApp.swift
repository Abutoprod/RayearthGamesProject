import SwiftUI
import Shared

@main
struct iOSApp: App {

    init() {
        // Inicializa o Koin com os módulos iOS + compartilhado
        KoinInitKt.doInitKoin()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}