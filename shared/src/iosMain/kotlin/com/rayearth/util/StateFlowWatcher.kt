package com.rayearth.util

import com.rayearth.presentation.viewmodel.*
import kotlinx.coroutines.*

/**
 * Suporte a observação de StateFlow para Swift/iOS.
 *
 * Por que NÃO usar StateFlow<T> nos parâmetros?
 * Kotlin/Native não exporta métodos com StateFlow<T> (tipo genérico de coroutines)
 * para o header ObjC — a classe inteira fica invisível no Swift.
 * Solução: funções top-level que recebem o ViewModel (ObjC-compatible) diretamente
 * e acessam o uiState internamente, fora da assinatura pública.
 */

/** Objeto retornado pelas funções watch* para cancelar a observação. */
class FlowCancellable(private val scope: CoroutineScope) {
    fun cancel() { scope.cancel() }
}

private fun newScope() = CoroutineScope(Dispatchers.Main + SupervisorJob())

fun watchLoginUiState(vm: LoginViewModel, onState: (AuthUiState) -> Unit): FlowCancellable {
    val scope = newScope()
    scope.launch { vm.uiState.collect { onState(it) } }
    return FlowCancellable(scope)
}

fun watchMenuUiState(vm: MainMenuViewModel, onState: (MenuUiState) -> Unit): FlowCancellable {
    val scope = newScope()
    scope.launch { vm.uiState.collect { onState(it) } }
    return FlowCancellable(scope)
}

fun watchEventosUiState(vm: EventosViewModel, onState: (EventosUiState) -> Unit): FlowCancellable {
    val scope = newScope()
    scope.launch { vm.uiState.collect { onState(it) } }
    return FlowCancellable(scope)
}

fun watchRankingUiState(vm: RankingViewModel, onState: (RankingUiState) -> Unit): FlowCancellable {
    val scope = newScope()
    scope.launch { vm.uiState.collect { onState(it) } }
    return FlowCancellable(scope)
}

fun watchProfileUiState(vm: ProfileViewModel, onState: (ProfileUiState) -> Unit): FlowCancellable {
    val scope = newScope()
    scope.launch { vm.uiState.collect { onState(it) } }
    return FlowCancellable(scope)
}
