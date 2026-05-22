package com.rayearth.data.remote

import io.ktor.client.HttpClient
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.plugins.logging.LogLevel
import io.ktor.client.plugins.logging.Logger
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.header
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.URLProtocol
import io.ktor.http.path
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json

const val BASE_HOST = "129.121.46.153"
const val BASE_PORT = 8080
const val BASE_URL = "http://$BASE_HOST:$BASE_PORT"
fun createHttpClient(tokenProvider: () -> String?): HttpClient {
    return HttpClient(httpClientEngine()) {

        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
                encodeDefaults = false
                prettyPrint = false
            })
        }

        install(Logging) {
            level = LogLevel.BODY
            logger = object : Logger {
                override fun log(message: String) {
                    println("[Ktor] $message")
                }
            }
        }

        install(HttpTimeout) {
            requestTimeoutMillis = 30_000
            connectTimeoutMillis = 15_000
        }

        defaultRequest {
            url {
                protocol = URLProtocol.HTTP
                host = BASE_HOST
                port = BASE_PORT
            }
            header(HttpHeaders.ContentType, ContentType.Application.Json)
            header("ngrok-skip-browser-warning", "true")

            tokenProvider()?.let { token ->
                header(HttpHeaders.Authorization, "Bearer $token")
            }
        }
    }
}
