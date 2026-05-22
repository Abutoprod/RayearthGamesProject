package com.rayearth.data.remote

import io.ktor.client.engine.HttpClientEngine

/**
 * Cada plataforma fornece seu próprio engine de rede.
 *
 * Android → OkHttp (via ktor-client-android)
 * iOS     → NSURLSession (via ktor-client-darwin)
 *
 * A implementação fica em androidMain e iosMain, respectivamente.
 */
expect fun httpClientEngine(): HttpClientEngine
