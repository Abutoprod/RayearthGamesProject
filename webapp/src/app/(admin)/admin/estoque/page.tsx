"use client";

import { useEffect, useState, useCallback } from "react";
import {
  estoqueApi, filialApi,
  type ProductResponse, type ProductDTO, type FilialResponse,
} from "@/lib/api";
import { Plus, Search, Package, Edit2, X, Trash2 } from "lucide-react";

const CATEGORIAS = [
  "TCG", "Miniaturas", "Board Games", "RPG",
  "Acessórios", "Bebidas", "Snacks", "Outros",
];

// Aceita vírgula ou ponto como separador decimal
function parseMoney(v: string): number {
  const normalized = v.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

function parseQtd(v: string): number {
  const n = parseInt(v, 10);
  return isNaN(n) ? 0 : n;
}

interface FormState {
  codigo: string;
  descricao: string;
  precoCompra: string;
  precoVenda: string;
  quantidade: string;
  categoria: string;
  filialId: number;
}

const emptyForm = (filialId: number): FormState => ({
  codigo: "", descricao: "", precoCompra: "", precoVenda: "",
  quantidade: "", categoria: "TCG", filialId,
});

export default function AdminEstoquePage() {
  const [produtos, setProdutos] = useState<ProductResponse[]>([]);
  const [filiais, setFiliais] = useState<FilialResponse[]>([]);
  const [filialId, setFilialId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(0));

  const fetchProdutos = useCallback(async () => {
    if (!filialId) return;
    setLoading(true);
    try {
      const r = await estoqueApi.listarPorFilial(filialId);
      setProdutos(Array.isArray(r.data) ? r.data : []);
    } catch { setProdutos([]); }
    finally { setLoading(false); }
  }, [filialId]);

  useEffect(() => {
    filialApi.listar().then((r) => {
      const ativas = r.data.filter((f) => f.ativo);
      setFiliais(ativas);
      if (ativas[0]) setFilialId(ativas[0].id);
    });
  }, []);

  useEffect(() => { fetchProdutos(); }, [fetchProdutos]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const openNew = () => {
    setEditingProduct(null);
    setForm(emptyForm(filialId));
    setShowModal(true);
  };

  const openEdit = (p: ProductResponse) => {
    setEditingProduct(p);
    setForm({
      codigo: p.codigo,
      descricao: p.descricao,
      precoCompra: p.precoCompra.toString().replace(".", ","),
      precoVenda: p.precoVenda.toString().replace(".", ","),
      quantidade: p.quantidade.toString(),
      categoria: p.categoria,
      filialId: p.filial.id,
    });
    setShowModal(true);
  };

  const buildDTO = (): ProductDTO => ({
    codigo: form.codigo,
    descricao: form.descricao,
    precoCompra: parseMoney(form.precoCompra),
    precoVenda: parseMoney(form.precoVenda),
    quantidade: parseQtd(form.quantidade),
    categoria: form.categoria,
    filialId,
  });

  const save = async () => {
    setSaving(true);
    try {
      const dto = buildDTO();
      if (editingProduct) {
        await estoqueApi.atualizar(editingProduct.id, dto);
      } else {
        await estoqueApi.criar(dto);
      }
      setShowModal(false);
      fetchProdutos();
    } catch {}
    setSaving(false);
  };

  const deletar = async (id: number) => {
    if (!confirm("Excluir produto?")) return;
    try { await estoqueApi.deletar(id); fetchProdutos(); } catch {}
  };

  const filtered = produtos.filter(
    (p) =>
      p.descricao.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white orange-line">Estoque</h1>
          <p className="text-white/40 text-sm mt-3">Gerenciar produtos e inventário</p>
        </div>
        <button onClick={openNew} className="btn-orange px-5 py-2.5 flex items-center gap-2 text-sm">
          <Plus size={16} /> Novo Produto
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
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="input-dark w-full pl-9 pr-4 py-2 text-sm" />
        </div>
      </div>

      {/* Tabela */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Código", "Produto", "Categoria", "Qtd", "Compra", "Venda", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-white/40 text-xs font-semibold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/25">
                    <Package size={28} className="mx-auto mb-2" />
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-white/50 font-mono text-xs">{p.codigo}</td>
                    <td className="px-4 py-3 text-white font-semibold">{p.descricao}</td>
                    <td className="px-4 py-3">
                      <span className="bg-orange/10 text-orange/80 text-xs px-2 py-0.5 rounded-full">{p.categoria}</span>
                    </td>
                    <td className={`px-4 py-3 font-bold ${p.quantidade < 5 ? "text-red-400" : "text-white"}`}>
                      {p.quantidade}
                    </td>
                    <td className="px-4 py-3 text-white/50">{fmt(p.precoCompra)}</td>
                    <td className="px-4 py-3 text-green-400 font-semibold">{fmt(p.precoVenda)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)}
                          className="w-7 h-7 rounded-lg bg-orange/10 text-orange hover:bg-orange/20 flex items-center justify-center">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => deletar(p.id)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 glass rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold">{editingProduct ? "Editar Produto" : "Novo Produto"}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Código */}
              <div>
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Código</label>
                <input value={form.codigo} onChange={set("codigo")}
                  className="input-dark w-full px-3 py-2.5 text-sm" placeholder="Ex: TCG-001" />
              </div>

              {/* Categoria */}
              <div>
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Categoria</label>
                <select value={form.categoria} onChange={set("categoria")}
                  className="input-dark w-full px-3 py-2.5 text-sm">
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Descrição */}
              <div className="col-span-2">
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Descrição</label>
                <input value={form.descricao} onChange={set("descricao")}
                  className="input-dark w-full px-3 py-2.5 text-sm" placeholder="Nome do produto" />
              </div>

              {/* Preço Compra */}
              <div>
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Preço Compra</label>
                <input value={form.precoCompra} onChange={set("precoCompra")}
                  inputMode="decimal"
                  className="input-dark w-full px-3 py-2.5 text-sm" placeholder="0,00" />
              </div>

              {/* Preço Venda */}
              <div>
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Preço Venda</label>
                <input value={form.precoVenda} onChange={set("precoVenda")}
                  inputMode="decimal"
                  className="input-dark w-full px-3 py-2.5 text-sm" placeholder="0,00" />
              </div>

              {/* Quantidade */}
              <div className="col-span-2">
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Quantidade</label>
                <input value={form.quantidade} onChange={set("quantidade")}
                  inputMode="numeric"
                  className="input-dark w-full px-3 py-2.5 text-sm" placeholder="0" />
              </div>
            </div>

            <button onClick={save} disabled={saving}
              className="btn-orange w-full py-3 mt-5 flex items-center justify-center gap-2 disabled:opacity-50">
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : "Salvar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
