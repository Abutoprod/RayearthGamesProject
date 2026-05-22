import SwiftUI
import Shared

@main
struct RayearthApp: App {

    init() {
        // Inicializa o Koin com os módulos iOS + compartilhado
        KoinInitKt.doInitKoin(modules: [IosModuleKt.iosModule, SharedModuleKt.sharedModule])
    }

    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}
