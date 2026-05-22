package com.rayearth.data.remote

import io.ktor.client.engine.HttpClientEngine
import io.ktor.client.engine.okhttp.OkHttp
import java.util.concurrent.TimeUnit

actual fun httpClientEngine(): HttpClientEngine = OkHttp.create {
    config {
        connectTimeout(15, TimeUnit.SECONDS)
        readTimeout(30, TimeUnit.SECONDS)
        writeTimeout(30, TimeUnit.SECONDS)
        // Permite HTTP para o servidor de desenvolvimento
        // Em produção usar apenas HTTPS e remover isto
        followRedirects(true)
    }
}
