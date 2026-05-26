import SwiftUI
import Shared

@main
struct iOSApp: App {

    init() {
        try! IosKoinInitKt.startAppKoin()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}
