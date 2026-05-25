import SwiftUI
import Shared

@main
struct iOSApp: App {

    init() {
        IosKoinInitKt.initKoin()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}