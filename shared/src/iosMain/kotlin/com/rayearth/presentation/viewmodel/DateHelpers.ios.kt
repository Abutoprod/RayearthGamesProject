package com.rayearth.presentation.viewmodel

import platform.Foundation.*

actual fun currentMonth(): Int = NSCalendar.currentCalendar.component(NSCalendarUnitMonth, fromDate = NSDate()).toInt()
actual fun currentYear(): Int = NSCalendar.currentCalendar.component(NSCalendarUnitYear, fromDate = NSDate()).toInt()
actual fun currentMesAnterior(): Int {
    val comps = NSDateComponents()
    comps.month = -1
    val date = NSCalendar.currentCalendar.dateByAddingComponents(comps, toDate = NSDate(), options = 0u)!!
    return NSCalendar.currentCalendar.component(NSCalendarUnitMonth, fromDate = date).toInt()
}
actual fun currentAnoMesAnterior(): Int {
    val comps = NSDateComponents()
    comps.month = -1
    val date = NSCalendar.currentCalendar.dateByAddingComponents(comps, toDate = NSDate(), options = 0u)!!
    return NSCalendar.currentCalendar.component(NSCalendarUnitYear, fromDate = date).toInt()
}
