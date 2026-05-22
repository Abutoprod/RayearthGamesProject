package com.rayearth.android.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val RayearthColorScheme = darkColorScheme(
    primary = Color(0xFFE91E63),
    onPrimary = Color.White,
    background = Color(0xFF0F0F0F),
    surface = Color(0xFF1A1A1A),
    onBackground = Color.White,
    onSurface = Color.White,
    error = Color(0xFFCF6679)
)

@Composable
fun RayearthTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = RayearthColorScheme,
        content = content
    )
}
