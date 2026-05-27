"use client";

import { useEffect, useState, useCallback } from "react";
import {
  comandaApi, filialApi, usuarioApi,
  type ComandaResponseDTO, type FilialResponse, type UsuarioResponse,
} from "@/lib/api";
import { estoqueApi, type ProductResponse } from "@/lib/api";
import {
  Plus, Search, ShoppingBag, ChevronDown, ChevronUp,
  X, Check, Package
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminComandasPage() {
  const [comandas, setComandas] = useState<ComandaResponseDTO[]>([]);
  const [filiais, setFiliais] = useState<FilialResponse[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [produtos, setProdutos] = useState<ProductResponse[]>([]);
  const [filialId, setFilialId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"" | "abertas" | "fechadas">("");

  // Modal nova comanda
  const [showNova, setShowNova] = useState(false);
  const [novaUsuarioId, setNovaUsuarioId] = useState<number>(0);

  // Modal adicionar item
  const [addItemComandaId, setAddItemComandaId] = useState<number | null>(null);
  const [itemCodigo, setItemCodigo] = useState("");
  const [itemQtd, setItemQtd] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComandas = useCallback(async () => {
    if (!filialId) return;
    setLoading(true);
    try {
      const r = await comandaApi.listarTodasAdmin(filialId, filtroStatus || undefined);
      setComandas(Array.isArray(r.data) ? r.data : []);
    } catch {
      setComandas([]);
    } finally { setLoading(false); }
  }, [filialId, filtroStatus]);

  useEffect(() => {
    filialApi.listar().then((r) => {
      const ativas = r.data.filter((f) => f.ativo);
      setFiliais(ativas);
      if (ativas[0]) setFilialId(ativas[0].id);
    });
    usuarioApi.listar().then((r) => {
      setUsuarios(r.data);
      if (r.data[0]) setNovaUsuarioId(r.data[0].id);
    });
  }, []);

  useEffect(() => { fetchComandas(); }, [fetchComandas]);

  useEffect(() => {
    if (filialId) {
      estoqueApi.listarPorFilial(filialId).then((r) => setProdutos(r.data)).catch(() => {});
    }
  }, [filialId]);

  const abrirComanda = async () => {
    if (!novaUsuarioId || !filialId) return;
    setActionLoading(true);
    try {
      await comandaApi.abrir(novaUsuarioId, filialId);
      setShowNova(false);
      fetchComandas();
    } catch {}
    setActionLoading(false);
  };

  const adicionarItem = async () => {
    if (!addItemComandaId || !itemCodigo) return;
    setActionLoading(true);
    try {
      await comandaApi.adicionarItem(addItemComandaId, itemCodigo, itemQtd);
      setAddItemComandaId(null);
      setItemCodigo("");
      setItemQtd(1);
      fetchComandas();
    } catch {}
    setActionLoading(false);
  };

  const fecharComanda = async (id: number) => {
    if (!confirm("Fechar esta comanda?")) return;
    try { await comandaApi.fechar(id); fetchComandas(); } catch {}
  };

  const filtered = comandas.filter((c) =>
    c.nomeCliente.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtData = (s: string) => {
    try { return format(new Date(s), "dd/MM 'às' HH:mm", { locale: ptBR }); } catch { return s; }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white orange-line">Comandas</h1>
          <p className="text-white/40 text-sm mt-3">Gerenciar pedidos e mesas</p>
        </div>
        <button onClick={() => setShowNova(true)} className="btn-orange px-5 py-2.5 flex items-center gap-2 text-sm">
          <Plus size={16} /> Nova Comanda
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select value={filialId} onChange={(e) => setFilialId(Number(e.target.value))}
          className="input-dark px-3 py-2 text-sm">
          {filiais.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>

        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input type="text" placeholder="Buscar cliente..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark w-full pl-9 pr-4 py-2 text-sm" />
        </div>

        <div className="flex gap-2">
          {(["", "abertas", "fechadas"] as const).map((s) => (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filtroStatus === s ? "bg-orange text-white" : "glass text-white/40 hover:text-white"
              }`}>
              {s === "" ? "Todas" : s === "abertas" ? "Abertas" : "Fechadas"}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="glass rounded-xl h-16 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <ShoppingBag size={36} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/40 font-semibold">Nenhuma comanda encontrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className="glass rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-orange/10 flex items-center justify-center shrink-0">
                  <ShoppingBag size={16} className="text-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">#{c.id} — {c.nomeCliente}</span>
                    <span className={c.aberta ? "badge-open" : "badge-closed"}>
                      {c.aberta ? "Aberta" : "Fechada"}
                    </span>
                  </div>
                  <p className="text-white/35 text-xs">{fmtData(c.dataAbertura)} · {c.itens.length} itens</p>
                </div>
                <p className="text-orange font-black text-sm shrink-0">{fmt(c.valorTotal)}</p>

                <div className="flex items-center gap-1 shrink-0">
                  {c.aberta && (
                    <>
                      <button onClick={() => setAddItemComandaId(c.id)}
                        className="w-8 h-8 rounded-lg bg-orange/10 text-orange hover:bg-orange/20 flex items-center justify-center transition-colors">
                        <Plus size={14} />
                      </button>
                      <button onClick={() => fecharComanda(c.id)}
                        className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 flex items-center justify-center transition-colors">
                        <Check size={14} />
                      </button>
                    </>
                  )}
                  <button onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/30">
                    {expandedId === c.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {expandedId === c.id && (
                <div className="border-t border-white/5 px-4 py-3">
                  {c.itens.length === 0 ? (
                    <p className="text-white/25 text-xs text-center py-2">Sem itens</p>
                  ) : (
                    <div className="space-y-2">
                      {c.itens.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="text-white/60 flex items-center gap-1.5">
                            <Package size={11} className="text-white/20" />
                            {item.produtoNome}
                          </span>
                          <span className="text-white/30 mx-2">x{item.quantidade}</span>
                          <span className="text-white/60">{fmt(item.precoUnitario * item.quantidade)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Nova Comanda */}
      {showNova && (
        <Modal title="Nova Comanda" onClose={() => setShowNova(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase mb-1.5 block">Cliente (usuário)</label>
              <select value={novaUsuarioId} onChange={(e) => setNovaUsuarioId(Number(e.target.value))}
                className="input-dark w-full px-3 py-2.5 text-sm">
                {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome} — {u.email}</option>)}
              </select>
            </div>
            <button onClick={abrirComanda} disabled={actionLoading}
              className="btn-orange w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
              {actionLoading ? <Spinner /> : "Abrir Comanda"}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Adicionar Item */}
      {addItemComandaId && (
        <Modal title={`Adicionar Item — Comanda #${addItemComandaId}`} onClose={() => setAddItemComandaId(null)}>
          <div className="space-y-4">
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase mb-1.5 block">Produto</label>
              <select value={itemCodigo} onChange={(e) => setItemCodigo(e.target.value)}
                className="input-dark w-full px-3 py-2.5 text-sm">
                <option value="">Selecione um produto</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.codigo}>{p.descricao} — {p.codigo} (R$ {p.precoVenda.toFixed(2)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase mb-1.5 block">Quantidade</label>
              <input type="number" min={1} value={itemQtd} onChange={(e) => setItemQtd(Number(e.target.value))}
                className="input-dark w-full px-3 py-2.5 text-sm" />
            </div>
            <button onClick={adicionarItem} disabled={actionLoading || !itemCodigo}
              className="btn-orange w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
              {actionLoading ? <Spinner /> : "Adicionar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 glass rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">{title}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}
