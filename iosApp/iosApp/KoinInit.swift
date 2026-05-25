import Foundation
import Shared

// Wrapper simples para inicializar o Koin
// Evita crash na inicialização do app
func initKoin() {
    // O Koin é inicializado pelo módulo Kotlin via KoinInit.ios.kt
    // que chama startKoin com iosModule + sharedModule
}