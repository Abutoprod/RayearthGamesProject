package com.rayearth.android.navigation

/**
 * Rotas de navegação tipadas.
 * Usar sealed class evita strings mágicas espalhadas pelo código.
 */
sealed class Screen(val route: String) {
    data object Login : Screen("login")
    data object MainMenu : Screen("main_menu")
    data object Eventos : Screen("eventos")
    data object Ranking : Screen("ranking")
    data object Perfil : Screen("perfil")
}
