import SwiftUI

// ─────────────────────────────────────────────────────────────────────────────
// RayearthTheme
//
// Design tokens centralizados. Muda aqui e reflete em toda a UI iOS.
// Espelha as cores do tema Android (Color(0xFFE91E63), etc.)
// ─────────────────────────────────────────────────────────────────────────────

enum RayearthTheme {

    // Cores primárias
    static let accent       = Color(hex: "E91E63")
    static let accentLight  = Color(hex: "E91E63").opacity(0.15)

    // Backgrounds
    static let background   = Color(hex: "0F0F0F")
    static let surface      = Color(hex: "141414")
    static let surfaceHigh  = Color(hex: "1A1A1A")
    static let surfaceTop   = Color(hex: "2A2A2A")

    // Texto
    static let textPrimary  = Color.white
    static let textSecondary = Color(hex: "9E9E9E")

    // Status
    static let success      = Color(hex: "4CAF50")
    static let error        = Color(hex: "CF6679")
    static let gold         = Color(hex: "FFD700")
    static let silver       = Color(hex: "C0C0C0")
    static let bronze       = Color(hex: "CD7F32")

    // Gradiente de fundo padrão
    static var backgroundGradient: LinearGradient {
        LinearGradient(
            colors: [Color(hex: "0F0F0F"), Color.black],
            startPoint: .top,
            endPoint: .bottom
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ViewModifiers reutilizáveis
// ─────────────────────────────────────────────────────────────────────────────

struct RayearthCardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(RayearthTheme.surfaceHigh)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

struct RayearthButtonStyle: ButtonStyle {
    var isDestructive: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(isDestructive ? RayearthTheme.error : RayearthTheme.accent)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .opacity(configuration.isPressed ? 0.85 : 1.0)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

extension View {
    func rayearthCard() -> some View {
        modifier(RayearthCardStyle())
    }
}
