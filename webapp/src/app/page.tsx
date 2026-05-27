"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import Cookies from "js-cookie";
import { Eye, EyeOff, LogIn, AlertCircle, ChevronRight, ArrowLeft, Mail, KeyRound } from "lucide-react";
import Image from "next/image";

type View = "login" | "register" | "reenviar" | "esqueci" | "redefinir";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [tab, setTab] = useState<"login" | "register">("login");

  // Login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Register
  const [nome, setNome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regSenha, setRegSenha] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Reenviar confirmação
  const [reenviarEmail, setReenviarEmail] = useState("");
  const [reenviarLoading, setReenviarLoading] = useState(false);
  const [reenviarSuccess, setReenviarSuccess] = useState(false);

  // Esqueci senha
  const [esqueciEmail, setEsqueciEmail] = useState("");
  const [esqueciLoading, setEsqueciLoading] = useState(false);
  const [esqueciSuccess, setEsqueciSuccess] = useState(false);

  // Redefinir senha
  const [redefinirToken, setRedefinirToken] = useState("");
  const [redefinirSenha, setRedefinirSenha] = useState("");
  const [redefinirLoading, setRedefinirLoading] = useState(false);
  const [redefinirSuccess, setRedefinirSuccess] = useState(false);

  const clearError = () => setError("");

  const goTo = (v: View) => {
    clearError();
    setView(v);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      const res = await authApi.login(email, senha);
      const { token, role } = res.data;
      Cookies.set("token", token, { expires: 7, sameSite: "lax" });
      Cookies.set("role", role, { expires: 7, sameSite: "lax" });
      router.push(role === "ROLE_ADMIN" || role === "ADMIN" ? "/admin" : "/app");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setError("Sua conta ainda não foi confirmada. Verifique seu e-mail ou clique em \"Reenviar confirmação\".");
      } else {
        setError("E-mail ou senha incorretos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setRegLoading(true);
    try {
      await authApi.registrar(nome, regEmail, regSenha);
      setRegSuccess(true);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setError("Este e-mail já está cadastrado. Tente fazer login.");
      } else {
        setError("Erro ao criar conta. Verifique os dados.");
      }
    } finally {
      setRegLoading(false);
    }
  };

  const handleReenviar = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setReenviarLoading(true);
    try {
      await authApi.reenviarConfirmacao(reenviarEmail);
      setReenviarSuccess(true);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 400) {
        setError("E-mail não encontrado ou conta já está ativa.");
      } else {
        setError("Não foi possível enviar o e-mail agora. Tente novamente em instantes.");
      }
    } finally {
      setReenviarLoading(false);
    }
  };

  const handleEsqueci = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setEsqueciLoading(true);
    try {
      await authApi.esqueciSenha(esqueciEmail);
      setEsqueciSuccess(true);
    } catch {
      setError("Não foi possível enviar o e-mail agora. Tente novamente em instantes.");
    } finally {
      setEsqueciLoading(false);
    }
  };

  const handleRedefinir = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setRedefinirLoading(true);
    try {
      await authApi.redefinirSenha(redefinirToken, redefinirSenha);
      setRedefinirSuccess(true);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 400) {
        setError("Código inválido ou expirado. Solicite um novo código.");
      } else {
        setError("Erro ao redefinir senha. Tente novamente.");
      }
    } finally {
      setRedefinirLoading(false);
    }
  };

  // ── Sub-views ──────────────────────────────────────────────────────────────

  if (view === "reenviar") {
    return (
      <PageShell>
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <button onClick={() => goTo("login")} className="flex items-center gap-1 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors">
            <ArrowLeft size={14} /> Voltar
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
              <Mail size={20} className="text-orange" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Reenviar Confirmação</h2>
              <p className="text-white/40 text-xs">Receba o link de ativação novamente</p>
            </div>
          </div>

          {error && <ErrorBox message={error} />}

          {reenviarSuccess ? (
            <SuccessBox
              title="E-mail enviado!"
              description="Verifique sua caixa de entrada e clique no link para ativar sua conta."
              action={{
                label: "Ir para o Login",
                onClick: () => { goTo("login"); setReenviarSuccess(false); setReenviarEmail(""); },
              }}
            />
          ) : (
            <form onSubmit={handleReenviar} className="space-y-4">
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 block">E-mail cadastrado</label>
                <input
                  type="email"
                  value={reenviarEmail}
                  onChange={(e) => setReenviarEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="input-dark w-full px-4 py-3 text-sm"
                />
              </div>
              <button type="submit" disabled={reenviarLoading} className="btn-orange w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                {reenviarLoading ? <Spinner /> : "Reenviar E-mail"}
              </button>
            </form>
          )}
        </div>
      </PageShell>
    );
  }

  if (view === "esqueci") {
    return (
      <PageShell>
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <button onClick={() => goTo("login")} className="flex items-center gap-1 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors">
            <ArrowLeft size={14} /> Voltar
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
              <KeyRound size={20} className="text-orange" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Recuperar Senha</h2>
              <p className="text-white/40 text-xs">Enviaremos um código de 6 dígitos</p>
            </div>
          </div>

          {error && <ErrorBox message={error} />}

          {esqueciSuccess ? (
            <SuccessBox
              title="Código enviado!"
              description="Verifique seu e-mail e insira o código de 6 dígitos abaixo."
              action={{
                label: "Inserir código",
                onClick: () => { setEsqueciSuccess(false); goTo("redefinir"); },
              }}
            />
          ) : (
            <form onSubmit={handleEsqueci} className="space-y-4">
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 block">E-mail cadastrado</label>
                <input
                  type="email"
                  value={esqueciEmail}
                  onChange={(e) => setEsqueciEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="input-dark w-full px-4 py-3 text-sm"
                />
              </div>
              <button type="submit" disabled={esqueciLoading} className="btn-orange w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                {esqueciLoading ? <Spinner /> : "Enviar Código"}
              </button>
            </form>
          )}
        </div>
      </PageShell>
    );
  }

  if (view === "redefinir") {
    return (
      <PageShell>
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <button onClick={() => goTo("esqueci")} className="flex items-center gap-1 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors">
            <ArrowLeft size={14} /> Voltar
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
              <KeyRound size={20} className="text-orange" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Nova Senha</h2>
              <p className="text-white/40 text-xs">Use o código recebido no e-mail</p>
            </div>
          </div>

          {error && <ErrorBox message={error} />}

          {redefinirSuccess ? (
            <SuccessBox
              title="Senha alterada!"
              description="Sua senha foi redefinida com sucesso. Faça login com a nova senha."
              action={{
                label: "Ir para o Login",
                onClick: () => { goTo("login"); setRedefinirSuccess(false); setRedefinirToken(""); setRedefinirSenha(""); },
              }}
            />
          ) : (
            <form onSubmit={handleRedefinir} className="space-y-4">
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 block">Código recebido</label>
                <input
                  type="text"
                  value={redefinirToken}
                  onChange={(e) => setRedefinirToken(e.target.value)}
                  placeholder="000000"
                  required
                  maxLength={6}
                  className="input-dark w-full px-4 py-3 text-sm tracking-widest text-center"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 block">Nova senha</label>
                <input
                  type="password"
                  value={redefinirSenha}
                  onChange={(e) => setRedefinirSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="input-dark w-full px-4 py-3 text-sm"
                />
              </div>
              <button type="submit" disabled={redefinirLoading} className="btn-orange w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                {redefinirLoading ? <Spinner /> : "Redefinir Senha"}
              </button>
            </form>
          )}
        </div>
      </PageShell>
    );
  }

  // ── Login / Register (view principal) ─────────────────────────────────────

  return (
    <PageShell>
      <div className="glass rounded-2xl p-8 shadow-2xl">
        {/* Tabs */}
        <div className="flex rounded-xl bg-bg-input p-1 mb-6">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); clearError(); setRegSuccess(false); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === t ? "bg-orange text-white shadow-lg" : "text-white/40 hover:text-white/70"
              }`}
            >
              {t === "login" ? "Entrar" : "Criar Conta"}
            </button>
          ))}
        </div>

        {error && <ErrorBox message={error} />}

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 block">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="input-dark w-full px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 block">Senha</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-dark w-full px-4 py-3 pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-orange w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <Spinner /> : <><LogIn size={18} /> Entrar</>}
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => goTo("esqueci")}
                className="text-white/30 text-xs hover:text-orange transition-colors"
              >
                Esqueceu a senha?
              </button>
              <button
                type="button"
                onClick={() => goTo("reenviar")}
                className="text-white/30 text-xs hover:text-orange transition-colors"
              >
                Reenviar confirmação
              </button>
            </div>
          </form>
        ) : regSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-white font-bold text-lg">Conta criada!</p>
            <p className="text-white/50 text-sm mt-2">Verifique seu e-mail para confirmar o cadastro.</p>
            <button
              onClick={() => { setTab("login"); setRegSuccess(false); }}
              className="btn-orange w-full py-3 mt-6 flex items-center justify-center gap-2"
            >
              Ir para o Login <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 block">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
                className="input-dark w-full px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 block">E-mail</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="input-dark w-full px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 block">Senha</label>
              <input
                type="password"
                value={regSenha}
                onChange={(e) => setRegSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="input-dark w-full px-4 py-3 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={regLoading}
              className="btn-orange w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {regLoading ? <Spinner /> : "Criar Conta"}
            </button>
          </form>
        )}
      </div>
    </PageShell>
  );
}

// ── Componentes auxiliares ───────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-96 h-96 bg-orange/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[5%] w-72 h-72 bg-purple-500/8 rounded-full blur-3xl" />
        <div className="absolute top-[40%] left-[60%] w-48 h-48 bg-orange/5 rounded-full blur-2xl" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Rayearth Games"
            width={88}
            height={88}
            className="rounded-2xl mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-3xl font-black text-white tracking-tight">Rayearth Games</h1>
          <p className="text-white/40 text-sm mt-1">Plataforma oficial da comunidade</p>
        </div>
        {children}
        <p className="text-center text-white/20 text-xs mt-6">
          Rayearth Games © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-red-400 text-sm">
      <AlertCircle size={16} className="shrink-0" />
      {message}
    </div>
  );
}

function SuccessBox({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: { label: string; onClick: () => void };
}) {
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">✓</span>
      </div>
      <p className="text-white font-bold text-lg">{title}</p>
      <p className="text-white/50 text-sm mt-2">{description}</p>
      <button
        onClick={action.onClick}
        className="btn-orange w-full py-3 mt-6 flex items-center justify-center gap-2"
      >
        {action.label} <ChevronRight size={16} />
      </button>
    </div>
  );
}

function Spinner() {
  return <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}
