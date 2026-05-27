"use client";

import { useEffect, useState, useCallback } from "react";
import {
  eventoApi, filialApi, jogoApi, avisosApi,
  type EventoDTO, type FilialResponse, type JogoDTO,
} from "@/lib/api";
import { Plus, Trash2, X, CalendarDays, MapPin, Gamepad2, Clock, Image as ImageIcon, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState<EventoDTO[]>([]);
  const [filiais, setFiliais] = useState<FilialResponse[]>([]);
  const [jogos, setJogos] = useState<JogoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Modal inscritos
  const [inscritosEvento, setInscritosEvento] = useState<EventoDTO | null>(null);
  const [inscritos, setInscritos] = useState<string[]>([]);
  const [loadingInscritos, setLoadingInscritos] = useState(false);

  const [form, setForm] = useState({
    titulo: "", descricao: "", dataHora: "",
    linkInscricao: "", filialId: 0, jogoId: 0, nomeImagem: "",
  });

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    try { const r = await eventoApi.listar(); setEventos(r.data); }
    catch { setEventos([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchEventos();
    filialApi.listar().then((r) => {
      const ativas = r.data.filter((f) => f.ativo);
      setFiliais(ativas);
      if (ativas[0]) setForm((f) => ({ ...f, filialId: ativas[0].id }));
    });
    jogoApi.listar().then((r) => {
      setJogos(r.data);
      if (r.data[0]) setForm((f) => ({ ...f, jogoId: r.data[0].id }));
    });
  }, [fetchEventos]);

  const verInscritos = async (evento: EventoDTO) => {
    setInscritosEvento(evento);
    setInscritos([]);
    setLoadingInscritos(true);
    try {
      const r = await eventoApi.listarParticipantes(evento.id);
      setInscritos(Array.isArray(r.data) ? r.data : []);
    } catch { setInscritos([]); }
    finally { setLoadingInscritos(false); }
  };

  const criar = async () => {
    setSaving(true);
    try {
      let nomeImagem = form.nomeImagem;
      if (imageFile) {
        const res = await avisosApi.uploadCarrossel(imageFile, imageFile.name);
        nomeImagem = typeof res.data === "string" ? res.data : imageFile.name;
      }
      await eventoApi.criar({ ...form, nomeImagem });
      setShowModal(false);
      setImageFile(null);
      setForm((f) => ({ ...f, titulo: "", descricao: "", dataHora: "", linkInscricao: "", nomeImagem: "" }));
      fetchEventos();
    } catch { alert("Erro ao criar evento."); }
    setSaving(false);
  };

  const deletar = async (id: number) => {
    if (!confirm("Excluir este evento?")) return;
    try { await eventoApi.deletar(id); fetchEventos(); } catch {}
  };

  const fmtData = (s: string) => {
    try { return format(new Date(s), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }); } catch { return s; }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white orange-line">Eventos</h1>
          <p className="text-white/40 text-sm mt-3">Criar e gerenciar torneios e eventos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-orange px-5 py-2.5 flex items-center gap-2 text-sm">
          <Plus size={16} /> Novo Evento
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="glass rounded-2xl h-56 animate-pulse" />)}
        </div>
      ) : eventos.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <CalendarDays size={40} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/40 font-semibold">Nenhum evento cadastrado</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventos.map((e) => (
            <div key={e.id} className="glass rounded-2xl overflow-hidden card-hover group">
              {e.urlImagem ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.urlImagem} alt={e.titulo} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-orange/5 flex items-center justify-center">
                  <CalendarDays size={36} className="text-orange/30" />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-white font-bold text-sm leading-tight flex-1">{e.titulo}</h3>
                  <button onClick={() => deletar(e.id)}
                    className="text-white/15 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-white/45 text-xs line-clamp-2">{e.descricao}</p>
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-1.5 text-white/35 text-xs">
                    <Clock size={11} /><span>{fmtData(e.dataHora)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/35 text-xs">
                    <MapPin size={11} /><span>{e.filialNome}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/35 text-xs">
                    <Gamepad2 size={11} /><span>{e.jogoNome}</span>
                  </div>
                </div>

                {/* Botão ver inscritos */}
                <button
                  onClick={() => verInscritos(e)}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-orange/10 hover:text-orange text-white/40 text-xs font-semibold transition-all"
                >
                  <Users size={13} />
                  Ver inscritos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal inscritos */}
      {inscritosEvento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInscritosEvento(null)} />
          <div className="relative z-10 glass rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-bold">Inscritos</h3>
                <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{inscritosEvento.titulo}</p>
              </div>
              <button onClick={() => setInscritosEvento(null)} className="text-white/30 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {loadingInscritos ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : inscritos.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} className="text-white/15 mx-auto mb-3" />
                <p className="text-white/40 text-sm font-semibold">Nenhum inscrito ainda</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-white/30 text-xs font-semibold mb-3">
                  {inscritos.length} {inscritos.length === 1 ? "inscrito" : "inscritos"}
                </p>
                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                  {inscritos.map((nome, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
                      <div className="w-7 h-7 rounded-full bg-orange/15 flex items-center justify-center shrink-0">
                        <span className="text-orange text-xs font-black">{nome.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-white text-sm font-semibold truncate">{nome}</span>
                      <span className="text-white/25 text-xs ml-auto shrink-0">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal criar evento */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 glass rounded-2xl w-full max-w-lg p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold">Novo Evento</h3>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Título", key: "titulo", type: "text" },
                { label: "Descrição", key: "descricao", type: "textarea" },
                { label: "Data e Hora", key: "dataHora", type: "datetime-local" },
                { label: "Link de Inscrição (opcional)", key: "linkInscricao", type: "url" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">{label}</label>
                  {type === "textarea" ? (
                    <textarea
                      value={(form as Record<string, unknown>)[key] as string}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      rows={3}
                      className="input-dark w-full px-3 py-2.5 text-sm resize-none"
                    />
                  ) : (
                    <input type={type}
                      value={(form as Record<string, unknown>)[key] as string}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="input-dark w-full px-3 py-2.5 text-sm" />
                  )}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Filial</label>
                  <select value={form.filialId} onChange={(e) => setForm((f) => ({ ...f, filialId: Number(e.target.value) }))}
                    className="input-dark w-full px-3 py-2.5 text-sm">
                    {filiais.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Jogo</label>
                  <select value={form.jogoId} onChange={(e) => setForm((f) => ({ ...f, jogoId: Number(e.target.value) }))}
                    className="input-dark w-full px-3 py-2.5 text-sm">
                    {jogos.map((j) => <option key={j.id} value={j.id}>{j.nome}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Imagem do Evento</label>
                <label className="flex items-center gap-3 input-dark px-3 py-2.5 cursor-pointer hover:border-orange/30 transition-colors">
                  <ImageIcon size={16} className="text-white/30" />
                  <span className="text-white/40 text-sm">{imageFile ? imageFile.name : "Clique para selecionar"}</span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              <button onClick={criar} disabled={saving || !form.titulo || !form.dataHora}
                className="btn-orange w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Criar Evento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
