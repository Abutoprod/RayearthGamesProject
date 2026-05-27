"use client";

import { useEffect, useState } from "react";
import { rankingApi, filialApi, jogoApi, type RankingDTO, type FilialResponse, type JogoDTO } from "@/lib/api";
import { Trophy, Medal, Crown } from "lucide-react";

const medalColors = [
  "text-yellow-400 bg-yellow-400/15",
  "text-gray-300 bg-gray-300/10",
  "text-amber-600 bg-amber-600/15",
];

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingDTO[]>([]);
  const [filiais, setFiliais] = useState<FilialResponse[]>([]);
  const [jogos, setJogos] = useState<JogoDTO[]>([]);
  const [filialId, setFilialId] = useState<number>(0);
  const [jogoId, setJogoId] = useState<number>(0);
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    filialApi.listar().then((r) => { setFiliais(r.data); if (r.data[0]) setFilialId(r.data[0].id); });
    jogoApi.listar().then((r) => { setJogos(r.data); if (r.data[0]) setJogoId(r.data[0].id); });
  }, []);

  useEffect(() => {
    if (!filialId || !jogoId) return;
    setLoading(true);
    rankingApi.consultar(jogoId, filialId, mes, ano)
      .then((r) => setRanking(r.data))
      .catch(() => setRanking([]))
      .finally(() => setLoading(false));
  }, [filialId, jogoId, mes, ano]);

  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white orange-line">Ranking</h1>
        <p className="text-white/40 text-sm mt-3">Classificação mensal por jogo e filial</p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/40 text-xs uppercase font-semibold mb-1.5 block">Filial</label>
          <select
            value={filialId}
            onChange={(e) => setFilialId(Number(e.target.value))}
            className="input-dark w-full px-3 py-2.5 text-sm"
          >
            {filiais.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase font-semibold mb-1.5 block">Jogo</label>
          <select
            value={jogoId}
            onChange={(e) => setJogoId(Number(e.target.value))}
            className="input-dark w-full px-3 py-2.5 text-sm"
          >
            {jogos.map((j) => <option key={j.id} value={j.id}>{j.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase font-semibold mb-1.5 block">Mês</label>
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="input-dark w-full px-3 py-2.5 text-sm"
          >
            {meses.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase font-semibold mb-1.5 block">Ano</label>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="input-dark w-full px-3 py-2.5 text-sm"
          >
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Pódio top 3 */}
      {!loading && ranking.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 pt-2">
          {[ranking[1], ranking[0], ranking[2]].map((p, idx) => {
            if (!p) return null;
            const order = idx === 1 ? 0 : idx === 0 ? 1 : 2;
            const heights = ["h-20", "h-28", "h-16"];
            const realPos = order === 0 ? 1 : order === 1 ? 2 : 3;
            return (
              <div key={p.usuarioId} className={`flex flex-col items-center justify-end gap-1 ${order === 0 ? "order-first" : order === 1 ? "order-none" : "order-last"}`}>
                {realPos === 1 && <Crown size={20} className="text-yellow-400 mb-1" />}
                <div className={`glass rounded-t-xl w-full ${heights[realPos - 1]} flex flex-col items-center justify-center gap-1 ${realPos === 1 ? "border-orange/30" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${medalColors[realPos - 1]}`}>
                    {realPos}
                  </div>
                  <p className="text-white text-xs font-bold text-center leading-tight px-1 line-clamp-2">{p.nome}</p>
                  <p className="text-orange text-xs font-black">{p.totalPontos}pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lista completa */}
      <div className="space-y-2">
        {loading ? (
          Array.from({length:5}).map((_,i) => (
            <div key={i} className="glass rounded-xl h-14 animate-pulse" />
          ))
        ) : ranking.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <Trophy size={32} className="text-white/15 mx-auto mb-2" />
            <p className="text-white/30 text-sm">Sem dados para este período</p>
          </div>
        ) : (
          ranking.map((p, i) => (
            <div key={p.usuarioId} className={`flex items-center gap-3 glass rounded-xl px-4 py-3 ${i < 3 ? "border-orange/15" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${i < 3 ? medalColors[i] : "bg-white/5 text-white/30"}`}>
                {i < 3 ? <Medal size={14} /> : i + 1}
              </div>
              <p className="flex-1 text-white text-sm font-semibold truncate">{p.nome}</p>
              <p className="text-orange font-black text-sm">{p.totalPontos} pts</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
