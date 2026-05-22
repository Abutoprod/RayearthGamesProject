package com.rayearth.presentation.viewmodel

import java.util.Calendar

actual fun currentMonth(): Int = Calendar.getInstance().get(Calendar.MONTH) + 1
actual fun currentYear(): Int = Calendar.getInstance().get(Calendar.YEAR)
actual fun currentMesAnterior(): Int {
    val c = Calendar.getInstance().also { it.add(Calendar.MONTH, -1) }
    return c.get(Calendar.MONTH) + 1
}
actual fun currentAnoMesAnterior(): Int {
    val c = Calendar.getInstance().also { it.add(Calendar.MONTH, -1) }
    return c.get(Calendar.YEAR)
}
