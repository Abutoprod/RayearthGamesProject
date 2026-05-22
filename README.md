# RayearthGames — KMP (Kotlin Multiplatform)

## ⚡ Primeiro passo obrigatório antes de abrir no Android Studio

O arquivo `gradle-wrapper.jar` não pode ser incluído no ZIP por restrições de rede.
Gere-o com um único comando:

```bash
gradle wrapper --gradle-version 8.9
```

> Se não tiver o Gradle instalado: https://gradle.org/install/
> Ou use o SDK Manager do Android Studio: Tools → SDK Manager → SDK Tools → Gradle.

---

## Como abrir no Android Studio

1. Extraia o ZIP
2. Execute `gradle wrapper --gradle-version 8.9` dentro da pasta raiz
3. Abra o Android Studio → **Open** → selecione a pasta raiz `RayearthGames/`
4. Aguarde o sync do Gradle (primeira vez pode demorar ~3 min baixando dependências)
5. Selecione o run configuration **androidApp** e execute

---

## Estrutura do projeto

```
RayearthGames/
├── shared/                   ← Código compartilhado Android + iOS
│   └── src/
│       ├── commonMain/       ← Lógica de negócio, ViewModels, DTOs, repositórios
│       ├── androidMain/      ← Implementações Android (DataStore, OkHttp engine)
│       └── iosMain/          ← Implementações iOS (NSUserDefaults, Darwin engine)
├── androidApp/               ← UI Android com Compose
└── iosApp/                   ← UI iOS com SwiftUI (abrir no Xcode)
```

## Principais dependências

| Lib | Versão | Função |
|-----|--------|--------|
| Ktor | 3.0.0 | HTTP client (substitui Retrofit) |
| Koin | 4.0.0 | Injeção de dependência |
| kotlinx.serialization | 1.7.3 | JSON (substitui Gson) |
| Compose Multiplatform | 1.7.0 | UI compartilhada |
| DataStore | 1.1.1 | Persistência do token (Android) |
| Coil 3 | 3.0.3 | Carregamento de imagens |

## Configuração do servidor

O IP do servidor está em:
`shared/src/commonMain/kotlin/com/rayearth/data/remote/HttpClientFactory.kt`

```kotlin
fun createHttpClient(..., baseUrl: String = "http://129.121.46.153:8080")
```

Para produção, altere para HTTPS e remova o domínio do `network_security_config.xml`.
