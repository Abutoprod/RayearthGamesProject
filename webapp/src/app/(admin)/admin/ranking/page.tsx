"use client";

import { useEffect, useState } from "react";
import {
  rankingApi, filialApi, jogoApi, usuarioApi,
  type RankingDTO, type FilialResponse, type JogoDTO, type UsuarioResponse,
  type LancamentoDTO,
} from "@/lib/api";
import { Trophy, Medal, Plus, X, Crown } from "lucide-react";

const medalColors = [
  "text-yellow-400 bg-yellow-400/15 border-yellow-400/25",
  "text-gray-300 bg-gray-300/10 border-gray-300/15",
  "text-amber-600 bg-amber-600/15 border-amber-600/25",
];

export default function AdminRankingPage() {
  const [ranking, setRanking] = useState<RankingDTO[]>([]);
  const [filiais, setFiliais] = useState<FilialResponse[]>([]);
  const [jogos, setJogos] = useState<JogoDTO[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [filialId, setFilialId] = useState<number>(0);
  const [jogoId, setJogoId] = useState<number>(0);
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  // Modal lançar pontos
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lancamento, setLancamento] = useState<LancamentoDTO>({
    usuarioId: 0, jogoId: 0, filialId: 0, pontos: 0, descricao: "",
  });

  useEffect(() => {
    filialApi.listar().then((r) => {
      const ativas = r.data.filter((f) => f.ativo);
      setFiliais(ativas);
      if (ativas[0]) {
        setFilialId(ativas[0].id);
        setLancamento((l) => ({ ...l, filialId: ativas[0].id }));
      }
    });
    jogoApi.listar().then((r) => {
      setJogos(r.data);
      if (r.data[0]) {
        setJogoId(r.data[0].id);
        setLancamento((l) => ({ ...l, jogoId: r.data[0].id }));
      }
    });
    usuarioApi.listar().then((r) => {
      setUsuarios(r.data);
      if (r.data[0]) setLancamento((l) => ({ ...l, usuarioId: r.data[0].id }));
    });
  }, []);

  useEffect(() => {
    if (!filialId || !jogoId) return;
    setLoading(true);
    rankingApi.consultar(jogoId, filialId, mes, ano)
      .then((r) => setRanking(r.data))
      .catch(() => setRanking([]))
      .finally(() => setLoading(false));
  }, [filialId, jogoId, mes, ano]);

  const lancarPontos = async () => {
    setSaving(true);
    try {
      await rankingApi.lancar(lancamento);
      setShowModal(false);
      // Recarrega
      rankingApi.consultar(jogoId, filialId, mes, ano)
        .then((r) => setRanking(r.data)).catch(() => {});
    } catch { alert("Erro ao lançar pontos."); }
    setSaving(false);
  };

  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white orange-line">Ranking</h1>
          <p className="text-white/40 text-sm mt-3">Classificação mensal e lançamento de pontos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-orange px-5 py-2.5 flex items-center gap-2 text-sm">
          <Plus size={16} /> Lançar Pontos
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="text-white/40 text-xs font-semibold uppercase mb-1 block">Filial</label>
          <select value={filialId} onChange={(e) => setFilialId(Number(e.target.value))}
            className="input-dark px-3 py-2 text-sm">
            {filiais.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="text-white/40 text-xs font-semibold uppercase mb-1 block">Jogo</label>
          <select value={jogoId} onChange={(e) => setJogoId(Number(e.target.value))}
            className="input-dark px-3 py-2 text-sm">
            {jogos.map((j) => <option key={j.id} value={j.id}>{j.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="text-white/40 text-xs font-semibold uppercase mb-1 block">Mês</label>
          <select value={mes} onChange={(e) => setMes(Number(e.target.value))}
            className="input-dark px-3 py-2 text-sm">
            {meses.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-white/40 text-xs font-semibold uppercase mb-1 block">Ano</label>
          <select value={ano} onChange={(e) => setAno(Number(e.target.value))}
            className="input-dark px-3 py-2 text-sm">
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Pódio top 3 */}
      {!loading && ranking.length >= 3 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-end justify-center gap-4">
            {[ranking[1], ranking[0], ranking[2]].map((p, idx) => {
              if (!p) return null;
              const realPos = idx === 1 ? 1 : idx === 0 ? 2 : 3;
              const heights = ["h-24", "h-32", "h-20"];
              return (
                <div key={p.usuarioId} className="flex flex-col items-center gap-2">
                  {realPos === 1 && <Crown size={22} className="text-yellow-400" />}
                  <div className={`${heights[realPos - 1]} w-24 glass rounded-t-2xl flex flex-col items-center justify-center gap-1 border ${medalColors[realPos - 1]}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${medalColors[realPos - 1]}`}>
                      {realPos}
                    </div>
                    <p className="text-white text-xs font-bold text-center leading-tight px-2">{p.nome}</p>
                    <p className="text-orange text-xs font-black">{p.totalPontos}pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabela completa */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left text-white/40 text-xs font-semibold uppercase">#</th>
              <th className="px-4 py-3 text-left text-white/40 text-xs font-semibold uppercase">Jogador</th>
              <th className="px-4 py-3 text-right text-white/40 text-xs font-semibold uppercase">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({length:5}).map((_,i) => (
                <tr key={i}><td colSpan={3} className="px-4 py-3">
                  <div className="h-5 bg-white/5 rounded animate-pulse" />
                </td></tr>
              ))
            ) : ranking.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-10 text-center text-white/25">
                <Trophy size={28} className="mx-auto mb-2" />
                Sem dados para este período
              </td></tr>
            ) : ranking.map((p, i) => (
              <tr key={p.usuarioId} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  {i < 3 ? (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${medalColors[i]}`}>
                      <Medal size={12} />
                    </div>
                  ) : (
                    <span className="text-white/30 font-bold text-xs">{i + 1}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white font-semibold">{p.nome}</td>
                <td className="px-4 py-3 text-right text-orange font-black">{p.totalPontos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Lançar Pontos */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 glass rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold">Lançar Pontos</h3>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Usuário</label>
                <select value={lancamento.usuarioId}
                  onChange={(e) => setLancamento((l) => ({ ...l, usuarioId: Number(e.target.value) }))}
                  className="input-dark w-full px-3 py-2.5 text-sm">
                  {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Jogo</label>
                  <select value={lancamento.jogoId}
                    onChange={(e) => setLancamento((l) => ({ ...l, jogoId: Number(e.target.value) }))}
                    className="input-dark w-full px-3 py-2.5 text-sm">
                    {jogos.map((j) => <option key={j.id} value={j.id}>{j.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Filial</label>
                  <select value={lancamento.filialId}
                    onChange={(e) => setLancamento((l) => ({ ...l, filialId: Number(e.target.value) }))}
                    className="input-dark w-full px-3 py-2.5 text-sm">
                    {filiais.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Pontos</label>
                <input type="number" min={1} value={lancamento.pontos}
                  onChange={(e) => setLancamento((l) => ({ ...l, pontos: Number(e.target.value) }))}
                  className="input-dark w-full px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Descrição</label>
                <input value={lancamento.descricao}
                  onChange={(e) => setLancamento((l) => ({ ...l, descricao: e.target.value }))}
                  placeholder="Ex: 1º lugar torneio Mai/2026"
                  className="input-dark w-full px-3 py-2.5 text-sm" />
              </div>
              <button onClick={lancarPontos} disabled={saving || !lancamento.pontos}
                className="btn-orange w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Lançar Pontos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
