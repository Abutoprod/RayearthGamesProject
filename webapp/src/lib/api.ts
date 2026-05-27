import axios from "axios";
import Cookies from "js-cookie";

// ─── Base URL ──────────────────────────────────────────────────────────────
// Em dev: aponta para o backend local.
// Em produção: aponte para seu domínio Cloudflare (ex: https://api.seudominio.com)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Injeta o token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redireciona para login se o token expirar (401)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      Cookies.remove("token");
      Cookies.remove("role");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// ─── TIPOS ────────────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string;
  role: string;
  userId?: number;
}

export interface FilialResponse {
  id: number;
  nome: string;
  cidade: string;
  endereco: string;
  ativo: boolean;
}

export interface ProductResponse {
  id: number;
  codigo: string;
  descricao: string;
  precoVenda: number;
  precoCompra: number;
  quantidade: number;
  categoria: string;
  filial: FilialResponse;
}

export interface ProductDTO {
  codigo: string;
  descricao: string;
  precoCompra: number;
  precoVenda: number;
  quantidade: number;
  categoria: string;
  filialId: number;
}

export interface ItemComandaDTO {
  id: number;
  produtoNome: string;
  quantidade: number;
  precoCompra: number;
  precoUnitario: number;
}

export interface ComandaResponseDTO {
  id: number;
  nomeCliente: string;
  valorTotal: number;
  aberta: boolean;
  dataAbertura: string;
  itens: ItemComandaDTO[];
}

export interface EventoDTO {
  id: number;
  titulo: string;
  descricao: string;
  dataHora: string;
  urlImagem: string;
  linkInscricao: string;
  jogoNome: string;
  filialNome: string;
}

export interface EventoRequestDTO {
  titulo: string;
  descricao: string;
  dataHora: string;
  linkInscricao: string;
  filialId: number;
  jogoId: number;
  nomeImagem: string;
}

export interface JogoDTO {
  id: number;
  nome: string;
}

export interface RankingDTO {
  usuarioId: number;
  nome: string;
  totalPontos: number;
  posicao?: number;
}

export interface LancamentoDTO {
  usuarioId: number;
  jogoId: number;
  filialId: number;
  pontos: number;
  descricao: string;
}

export interface AvisoComunidadeDTO {
  id: number;
  titulo: string;
  mensagem: string;
  urlFoto?: string;
  link?: string;
  dataExpiracao: string;
}

export interface UserMeResponse {
  id: number;
  nome: string;
  email: string;
  creditos: number;
  role: string;
}

export interface DashboardResponse {
  totalRecebido: number;
  totalCusto: number;
  produtosConsumidos: { nome: string; quantidade: number }[];
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, senha: string) =>
    api.post<LoginResponse>("/login", { email, senha }),

  registrar: (nome: string, email: string, senha: string) =>
    api.post("/api/usuarios/registrar", { nome, email, senha }),

  reenviarConfirmacao: (email: string) =>
    api.post("/api/usuarios/reenviar-confirmacao", { email }),

  esqueciSenha: (email: string) =>
    api.post("/api/usuarios/esqueci-senha", { email }),

  redefinirSenha: (token: string, novaSenha: string) =>
    api.post("/api/usuarios/redefinir-senha", { token, novaSenha }),

  getMe: () => api.get<UserMeResponse>("/api/usuarios/me"),
};

// ─── FILIAIS ─────────────────────────────────────────────────────────────

export const filialApi = {
  listar: () => api.get<FilialResponse[]>("/api/filiais"),
  criar: (data: Omit<FilialResponse, "id">) => api.post("/api/filiais", data),
  deletar: (id: number) => api.delete(`/api/filiais/${id}`),
};

// ─── ESTOQUE / PRODUTOS ───────────────────────────────────────────────────

export const estoqueApi = {
  listarPorFilial: (filialId: number) =>
    api.get<ProductResponse[]>("/api/estoque", { params: { filialId } }),

  criar: (produto: ProductDTO) => api.post<ProductResponse>("/api/estoque", produto),

  atualizar: (id: number, produto: ProductDTO) =>
    api.put<ProductResponse>(`/api/estoque/${id}`, produto),

  deletar: (id: number) => api.delete(`/api/estoque/${id}`),
};

// ─── COMANDAS ─────────────────────────────────────────────────────────────

export const comandaApi = {
  listarTodasAdmin: (filialId: number, status?: string, clienteId?: number) =>
    api.get<ComandaResponseDTO[]>("/api/comandas", {
      params: { filialId, status, clienteId },
    }),

  minhasComandas: (status?: string) =>
    api.get<ComandaResponseDTO[]>("/api/comandas/minha", { params: { status } }),

  abrir: (usuarioId: number, filialId: number) =>
    api.post(`/api/comandas/abrir/${usuarioId}`, null, { params: { filialId } }),

  adicionarItem: (
    comandaId: number,
    codigoProduto: string,
    quantidade: number
  ) =>
    api.post(`/api/comandas/${comandaId}/item`, null, {
      params: { codigoProduto, quantidade },
    }),

  fechar: (comandaId: number) =>
    api.put(`/api/comandas/${comandaId}/fechar`),

  buscarPorId: (id: number) =>
    api.get<ComandaResponseDTO>(`/api/comandas/${id}`),

  vendaRapida: (filialId: number, clienteId: number, itens: { id: number; quantidade: number }[]) =>
    api.post("/api/comandas/venda-rapida", { filialId, clienteId, itens }),
};

// ─── EVENTOS ──────────────────────────────────────────────────────────────

export const eventoApi = {
  listar: () => api.get<EventoDTO[]>("/api/eventos"),

  criar: (evento: EventoRequestDTO) => api.post("/api/eventos", evento),

  deletar: (id: number) => api.delete(`/api/eventos/${id}`),

  preCadastro: (eventoId: number) =>
    api.post(`/api/eventos/${eventoId}/pre-cadastro`),

  cancelarPreCadastro: (eventoId: number) =>
    api.delete(`/api/eventos/${eventoId}/cancelar-pre-cadastro`),

  listarParticipantes: (eventoId: number) =>
    api.get<string[]>(`/api/eventos/${eventoId}/participantes-pre-cadastrados`),
};

// ─── JOGOS ────────────────────────────────────────────────────────────────

export const jogoApi = {
  listar: () => api.get<JogoDTO[]>("/api/jogos"),
  criar: (nome: string) => api.post("/api/jogos", { nome }),
};

// ─── RANKING / PONTOS ─────────────────────────────────────────────────────

export const rankingApi = {
  consultar: (jogoId: number, filialId: number, mes?: number, ano?: number) =>
    api.get<RankingDTO[]>("/api/pontos/ranking", {
      params: { jogoId, filialId, mes, ano },
    }),

  lancar: (dados: LancamentoDTO) => api.post("/api/pontos", dados),

  minhaPosicao: (jogoId: number, filialId: number, mes: number, ano: number) =>
    api.get<RankingDTO>("/api/pontos/minha-posicao", {
      params: { jogoId, filialId, mes, ano },
    }),
};

// ─── AVISOS ───────────────────────────────────────────────────────────────

export const avisosApi = {
  listar: () => api.get<AvisoComunidadeDTO[]>("/api/avisos"),

  criar: (aviso: Omit<AvisoComunidadeDTO, "id">) =>
    api.post<AvisoComunidadeDTO>("/api/avisos", aviso),

  uploadFoto: (file: File) => {
    const form = new FormData();
    form.append("imagem", file);
    form.append("nome", file.name);
    return api.post<string>("/api/arquivos/upload-aviso", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadCarrossel: (file: File, nome: string) => {
    const form = new FormData();
    form.append("imagem", file);
    form.append("nome", nome);
    return api.post<string>("/api/arquivos/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ─── USUARIOS ─────────────────────────────────────────────────────────────

export const usuarioApi = {
  listar: () => api.get<UsuarioResponse[]>("/api/usuarios"),
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────

export const dashboardApi = {
  carregar: (filialId: number, dataInicio?: string, dataFim?: string) =>
    api.get<DashboardResponse>("/api/dashboard", {
      params: { filialId, dataInicio, dataFim },
    }),
};

// ─── HELPERS ──────────────────────────────────────────────────────────────

export function getImageUrl(path: string): string {
  const base = BASE_URL;
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function getCarrosselUrl(index: number): string {
  return `${BASE_URL}/uploads/carrossel_${index}.jpg`;
}

export function getAvisoFotoUrl(urlFoto: string): string {
  return `${BASE_URL}/images/avisos/${urlFoto}`;
}
