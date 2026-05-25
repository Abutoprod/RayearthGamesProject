import SwiftUI
import Shared

@main
struct iOSApp: App {

    init() {
        DiKoinInit_iosKt.initKoin()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}