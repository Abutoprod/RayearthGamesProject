"use client";

import { useEffect, useState } from "react";
import {
  comandaApi, filialApi, estoqueApi, usuarioApi,
  type FilialResponse, type ProductResponse, type UsuarioResponse,
} from "@/lib/api";
import { Plus, Minus, Trash2, Zap, ShoppingCart } from "lucide-react";

interface CartItem {
  produtoId: number;
  codigo: string;
  nome: string;
  preco: number;
  quantidade: number;
}

export default function AdminPdvPage() {
  const [filiais, setFiliais] = useState<FilialResponse[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [produtos, setProdutos] = useState<ProductResponse[]>([]);
  const [filialId, setFilialId] = useState<number>(0);
  const [clienteId, setClienteId] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    filialApi.listar().then((r) => {
      const ativas = r.data.filter((f) => f.ativo);
      setFiliais(ativas);
      if (ativas[0]) setFilialId(ativas[0].id);
    });
    usuarioApi.listar().then((r) => {
      setUsuarios(r.data);
      if (r.data[0]) setClienteId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!filialId) return;
    estoqueApi.listarPorFilial(filialId).then((r) => setProdutos(r.data)).catch(() => {});
    setCart([]);
  }, [filialId]);

  const addToCart = (p: ProductResponse) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.produtoId === p.id);
      if (existing) {
        return prev.map((i) => i.produtoId === p.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      }
      return [...prev, { produtoId: p.id, codigo: p.codigo, nome: p.descricao, preco: p.precoVenda, quantidade: 1 }];
    });
  };

  const updateQty = (produtoId: number, delta: number) => {
    setCart((prev) =>
      prev.map((i) => i.produtoId === produtoId ? { ...i, quantidade: Math.max(1, i.quantidade + delta) } : i)
    );
  };

  const removeFromCart = (produtoId: number) => {
    setCart((prev) => prev.filter((i) => i.produtoId !== produtoId));
  };

  const total = cart.reduce((sum, i) => sum + i.preco * i.quantidade, 0);

  const confirmar = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      await comandaApi.vendaRapida(
        filialId,
        clienteId,
        cart.map((i) => ({ id: i.produtoId, quantidade: i.quantidade }))
      );
      setCart([]);
      setSuccessMsg("Venda realizada com sucesso!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch {
      alert("Erro ao processar venda.");
    }
    setLoading(false);
  };

  const filteredProdutos = produtos.filter((p) =>
    p.descricao.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white orange-line">PDV Rápido</h1>
        <p className="text-white/40 text-sm mt-3">Venda direta sem abrir comanda</p>
      </div>

      {successMsg && (
        <div className="bg-green-500/15 border border-green-500/25 rounded-xl px-5 py-3 text-green-400 font-semibold text-sm flex items-center gap-2">
          ✓ {successMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Produtos */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <select value={filialId} onChange={(e) => setFilialId(Number(e.target.value))}
              className="input-dark px-3 py-2 text-sm">
              {filiais.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
            <select value={clienteId} onChange={(e) => setClienteId(Number(e.target.value))}
              className="input-dark px-3 py-2 text-sm flex-1">
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>

          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto..."
            className="input-dark w-full px-4 py-2.5 text-sm" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredProdutos.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.quantidade === 0}
                className="glass rounded-xl p-4 text-left card-hover hover:border-orange/20 border border-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center mb-3">
                  <ShoppingCart size={14} className="text-orange" />
                </div>
                <p className="text-white text-xs font-bold leading-tight line-clamp-2 mb-1">{p.descricao}</p>
                <p className="text-orange font-black text-sm">{fmt(p.precoVenda)}</p>
                <p className={`text-xs mt-0.5 ${p.quantidade < 5 ? "text-red-400" : "text-white/30"}`}>
                  Estoque: {p.quantidade}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Carrinho */}
        <div className="glass rounded-2xl p-5 flex flex-col gap-4 h-fit sticky top-4">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-orange" />
            <h2 className="text-white font-bold">Carrinho</h2>
            {cart.length > 0 && (
              <span className="ml-auto bg-orange text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>

          {cart.length === 0 ? (
            <p className="text-white/25 text-sm text-center py-6">Adicione produtos ao carrinho</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.produtoId} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{item.nome}</p>
                    <p className="text-white/40 text-xs">{fmt(item.preco)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.produtoId, -1)}
                      className="w-6 h-6 rounded-lg bg-white/5 text-white/50 flex items-center justify-center hover:bg-white/10">
                      <Minus size={10} />
                    </button>
                    <span className="text-white text-xs font-bold w-6 text-center">{item.quantidade}</span>
                    <button onClick={() => updateQty(item.produtoId, 1)}
                      className="w-6 h-6 rounded-lg bg-white/5 text-white/50 flex items-center justify-center hover:bg-white/10">
                      <Plus size={10} />
                    </button>
                  </div>
                  <p className="text-orange text-xs font-black w-16 text-right">{fmt(item.preco * item.quantidade)}</p>
                  <button onClick={() => removeFromCart(item.produtoId)}
                    className="text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-white/5 pt-3">
            <div className="flex justify-between mb-4">
              <span className="text-white/50 font-semibold">Total</span>
              <span className="text-orange font-black text-xl">{fmt(total)}</span>
            </div>
            <button
              onClick={confirmar}
              disabled={loading || cart.length === 0}
              className="btn-orange w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Zap size={16} /> Confirmar Venda</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
