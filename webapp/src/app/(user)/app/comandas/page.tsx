"use client";

import { useEffect, useState } from "react";
import { comandaApi, type ComandaResponseDTO } from "@/lib/api";
import { Receipt, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MinhasComandasPage() {
  const [comandas, setComandas] = useState<ComandaResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    // Usuário só vê comandas abertas
    comandaApi.minhasComandas("abertas")
      .then((r) => setComandas(Array.isArray(r.data) ? r.data : []))
      .catch(() => setComandas([]))
      .finally(() => setLoading(false));
  }, []);

  const formatData = (s: string) => {
    try { return format(new Date(s), "dd/MM/yy 'às' HH:mm", { locale: ptBR }); }
    catch { return s; }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white orange-line">Minhas Comandas</h1>
        <p className="text-white/40 text-sm mt-3">Seus pedidos em aberto</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="glass rounded-xl h-20 animate-pulse" />)}
        </div>
      ) : comandas.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <Receipt size={36} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/40 font-semibold">Nenhuma comanda aberta</p>
          <p className="text-white/25 text-sm mt-1">Você não tem pedidos ativos no momento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comandas.map((c) => (
            <div key={c.id} className="glass rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-white/2 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center shrink-0">
                  <ShoppingBag size={18} className="text-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white font-bold text-sm">Comanda #{c.id}</p>
                    <span className="badge-open">Aberta</span>
                  </div>
                  <p className="text-white/40 text-xs">{formatData(c.dataAbertura)} · {c.itens.length} {c.itens.length === 1 ? "item" : "itens"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-orange font-black text-sm">
                    {c.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                  {expandedId === c.id
                    ? <ChevronUp size={14} className="text-white/30 ml-auto" />
                    : <ChevronDown size={14} className="text-white/30 ml-auto" />}
                </div>
              </button>

              {expandedId === c.id && (
                <div className="border-t border-white/5 px-4 py-3">
                  {c.itens.length === 0 ? (
                    <p className="text-white/25 text-xs text-center py-2">Nenhum item ainda</p>
                  ) : (
                    <div className="space-y-2">
                      {c.itens.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="text-white/60 flex-1 truncate">{item.produtoNome}</span>
                          <span className="text-white/30 mx-3">x{item.quantidade}</span>
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
    </div>
  );
}
