import SwiftUI

struct SplashView: View {
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            ProgressView()
                .tint(Color(hex: "E91E63"))
                .scaleEffect(1.5)
        }
    }
}