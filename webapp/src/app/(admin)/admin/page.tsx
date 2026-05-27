"use client";

import { useEffect, useState } from "react";
import { filialApi, type FilialResponse } from "@/lib/api";
import { api } from "@/lib/api";
import {
  TrendingUp, TrendingDown, DollarSign, Package,
  CalendarDays, ShoppingCart, BarChart3
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface DashboardData {
  totalRecebido: number;
  totalCusto: number;
  produtosConsumidos: { nome: string; quantidade: number }[];
}

const COLORS = ["#F56228", "#FF7A45", "#FFB347", "#E55B3C", "#C94B2F", "#FF9060", "#D9602A"];

export default function AdminDashboardPage() {
  const [filiais, setFiliais] = useState<FilialResponse[]>([]);
  const [filialId, setFilialId] = useState<number>(0);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    filialApi.listar().then((r) => {
      setFiliais(r.data.filter((f) => f.ativo));
      if (r.data[0]) setFilialId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!filialId) return;
    fetchDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filialId]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get<DashboardData>("/api/dashboard", {
        params: { filialId, dataInicio: dataInicio || undefined, dataFim: dataFim || undefined },
      });
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const lucro = (data?.totalRecebido ?? 0) - (data?.totalCusto ?? 0);
  const margemPct = data?.totalRecebido
    ? ((lucro / data.totalRecebido) * 100).toFixed(1)
    : "0.0";

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Título + filtros */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-black text-white orange-line">Dashboard</h1>
          <p className="text-white/40 text-sm mt-3">Resumo de vendas e desempenho</p>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-white/40 text-xs uppercase font-semibold mb-1 block">Filial</label>
            <select
              value={filialId}
              onChange={(e) => setFilialId(Number(e.target.value))}
              className="input-dark px-3 py-2 text-sm"
            >
              {filiais.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase font-semibold mb-1 block">De</label>
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
              className="input-dark px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase font-semibold mb-1 block">Até</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)}
              className="input-dark px-3 py-2 text-sm" />
          </div>
          <button onClick={fetchDashboard} className="btn-orange px-5 py-2 text-sm">
            Filtrar
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Vendas Totais"
          value={fmt(data?.totalRecebido ?? 0)}
          icon={DollarSign}
          color="text-green-400"
          bg="bg-green-400/10"
          border="border-green-400/15"
          loading={loading}
        />
        <KpiCard
          title="Custo Total"
          value={fmt(data?.totalCusto ?? 0)}
          icon={TrendingDown}
          color="text-red-400"
          bg="bg-red-400/10"
          border="border-red-400/15"
          loading={loading}
        />
        <KpiCard
          title="Lucro Estimado"
          value={fmt(lucro)}
          icon={TrendingUp}
          color="text-blue-400"
          bg="bg-blue-400/10"
          border="border-blue-400/15"
          loading={loading}
        />
        <KpiCard
          title="Margem"
          value={`${margemPct}%`}
          icon={BarChart3}
          color="text-orange"
          bg="bg-orange/10"
          border="border-orange/15"
          loading={loading}
        />
      </div>

      {/* Gráfico de produtos */}
      {data && data.produtosConsumidos.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-white font-bold text-base mb-4">Produtos Mais Vendidos</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.produtosConsumidos}
                dataKey="quantidade"
                nameKey="nome"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
              >
                {data.produtosConsumidos.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#1E1928", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#fff" }}
                formatter={(v: number) => [`${v} un.`, "Qtd"]}
              />
              <Legend
                formatter={(v) => <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Nova Comanda", icon: ShoppingCart, href: "/admin/comandas" },
          { label: "PDV Rápido", icon: Package, href: "/admin/pdv" },
          { label: "Novo Evento", icon: CalendarDays, href: "/admin/eventos" },
        ].map(({ label, icon: Icon, href }) => (
          <a key={href} href={href}
            className="glass rounded-xl p-4 flex flex-col items-center gap-2 card-hover border border-white/5 hover:border-orange/20 group">
            <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center group-hover:bg-orange/20 transition-colors">
              <Icon size={18} className="text-orange" />
            </div>
            <span className="text-white/70 text-xs font-semibold text-center">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function KpiCard({
  title, value, icon: Icon, color, bg, border, loading
}: {
  title: string; value: string; icon: React.ElementType;
  color: string; bg: string; border: string; loading?: boolean;
}) {
  return (
    <div className={`glass rounded-2xl p-5 border ${border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
      </div>
      <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      {loading ? (
        <div className="h-7 w-24 bg-white/5 rounded animate-pulse" />
      ) : (
        <p className="text-white font-black text-xl">{value}</p>
      )}
    </div>
  );
}
