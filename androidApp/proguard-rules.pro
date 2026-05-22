# Keep Kotlin Serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keepclassmembers class kotlinx.serialization.json.** { *** Companion; }
-keepclasseswithmembers class kotlinx.serialization.json.** { kotlinx.serialization.KSerializer serializer(...); }
-keep,includedescriptorclasses class com.rayearth.**$$serializer { *; }
-keepclassmembers class com.rayearth.** { *** Companion; }
-keepclasseswithmembers class com.rayearth.** { kotlinx.serialization.KSerializer serializer(...); }

# Keep Ktor
-keep class io.ktor.** { *; }
-keep class kotlinx.coroutines.** { *; }

# Keep Koin
-keep class org.koin.** { *; }

# Keep ViewModel
-keep class * extends androidx.lifecycle.ViewModel { *; }
