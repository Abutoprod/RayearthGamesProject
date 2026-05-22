package com.rayearth.data.remote

import io.ktor.client.engine.HttpClientEngine
import io.ktor.client.engine.darwin.Darwin

/**
 * Usa NSURLSession — engine nativo do iOS.
 * Respeita automaticamente as políticas de privacidade da Apple
 * (App Transport Security, certificate pinning, etc.).
 */
actual fun httpClientEngine(): HttpClientEngine = Darwin.create {
    configureRequest {
        setTimeoutInterval(30.0)
    }
}
