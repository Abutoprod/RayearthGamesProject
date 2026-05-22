package com.rayearth.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.rayearth.android.navigation.Screen
import com.rayearth.android.ui.auth.LoginScreen
import com.rayearth.android.ui.events.EventosScreen
import com.rayearth.android.ui.menu.MainMenuScreen
import com.rayearth.android.ui.profile.UserProfileScreen
import com.rayearth.android.ui.ranking.RankingScreen
import com.rayearth.android.ui.theme.RayearthTheme
import com.rayearth.data.repository.AuthRepository
import com.rayearth.presentation.viewmodel.LoginViewModel
import com.rayearth.presentation.viewmodel.EventosViewModel
import com.rayearth.presentation.viewmodel.RankingViewModel
import com.rayearth.presentation.viewmodel.ProfileViewModel
import kotlinx.coroutines.runBlocking
import org.koin.android.ext.android.inject
import org.koin.compose.viewmodel.koinViewModel

class MainActivity : ComponentActivity() {

    private val authRepository: AuthRepository by inject()

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val isLoggedIn = runBlocking { authRepository.isLoggedIn() }

        setContent {
            RayearthTheme {
                val navController = rememberNavController()
                val startDestination = if (isLoggedIn) Screen.MainMenu.route else Screen.Login.route

                NavHost(navController = navController, startDestination = startDestination) {

                    composable(Screen.Login.route) {
                        val viewModel: LoginViewModel = koinViewModel()
                        LoginScreen(
                            viewModel = viewModel,
                            onLoginSuccess = {
                                navController.navigate(Screen.MainMenu.route) {
                                    popUpTo(Screen.Login.route) { inclusive = true }
                                }
                            }
                        )
                    }

                    composable(Screen.MainMenu.route) {
                        MainMenuScreen(
                            onNavigateToEvents = { navController.navigate(Screen.Eventos.route) },
                            onNavigateToRanking = { navController.navigate(Screen.Ranking.route) },
                            onNavigateToProfile = { navController.navigate(Screen.Perfil.route) },
                            onLogout = {
                                runBlocking { authRepository.logout() }
                                navController.navigate(Screen.Login.route) {
                                    popUpTo(Screen.MainMenu.route) { inclusive = true }
                                }
                            }
                        )
                    }

                    composable(Screen.Eventos.route) {
                        val viewModel: EventosViewModel = koinViewModel()
                        EventosScreen(viewModel = viewModel)
                    }

                    composable(Screen.Ranking.route) {
                        val viewModel: RankingViewModel = koinViewModel()
                        RankingScreen(viewModel = viewModel)
                    }

                    composable(Screen.Perfil.route) {
                        val viewModel: ProfileViewModel = koinViewModel()
                        UserProfileScreen(
                            viewModel = viewModel,
                            onNavigateBack = { navController.popBackStack() }
                        )
                    }
                }
            }
        }
    }
}
