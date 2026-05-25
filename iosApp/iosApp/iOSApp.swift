import SwiftUI

@main
struct iOSApp: App {
    var body: some Scene {
        WindowGroup {
            ZStack {
                Color.black.ignoresSafeArea()
                VStack(spacing: 20) {
                    Text("RAYEARTH GAMES")
                        .font(.largeTitle)
                        .fontWeight(.black)
                        .foregroundColor(Color(red: 0.91, green: 0.11, blue: 0.39))
                    Text("iOS App funcionando!")
                        .foregroundColor(.white)
                }
            }
        }
    }
}