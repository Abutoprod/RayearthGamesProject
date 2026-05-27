"use client";

import { useEffect, useState } from "react";
import { eventoApi, type EventoDTO } from "@/lib/api";
import { CalendarDays, MapPin, Gamepad2, ExternalLink, Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EventosPage() {
  const [eventos, setEventos] = useState<EventoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [inscritoIds, setInscritoIds] = useState<Set<number>>(new Set());
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    eventoApi.listar()
      .then((r) => setEventos(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleInscricao = async (eventoId: number) => {
    setActionLoading(eventoId);
    try {
      if (inscritoIds.has(eventoId)) {
        await eventoApi.cancelarPreCadastro(eventoId);
        setInscritoIds((prev) => { const n = new Set(prev); n.delete(eventoId); return n; });
      } else {
        await eventoApi.preCadastro(eventoId);
        setInscritoIds((prev) => new Set(prev).add(eventoId));
      }
    } catch {}
    setActionLoading(null);
  };

  const formatData = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white orange-line">Eventos</h1>
        <p className="text-white/40 text-sm mt-3">Inscreva-se nos torneios e eventos da comunidade</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl h-52 animate-pulse" />
          ))}
        </div>
      ) : eventos.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <CalendarDays size={36} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 font-semibold">Nenhum evento disponível</p>
        </div>
      ) : (
        <div className="space-y-4">
          {eventos.map((evento) => {
            const inscrito = inscritoIds.has(evento.id);
            const aLoading = actionLoading === evento.id;
            return (
              <div key={evento.id} className="glass rounded-2xl overflow-hidden card-hover">
                {/* Imagem */}
                {evento.urlImagem && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={evento.urlImagem}
                    alt={evento.titulo}
                    className="w-full h-40 object-cover"
                    onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                  />
                )}

                <div className="p-4 space-y-3">
                  {/* Título + tags */}
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-base leading-tight">{evento.titulo}</h3>
                      <p className="text-white/50 text-xs mt-1 leading-relaxed">{evento.descricao}</p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <Clock size={12} />
                      <span>{formatData(evento.dataHora)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <MapPin size={12} />
                      <span>{evento.filialNome}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <Gamepad2 size={12} />
                      <span>{evento.jogoNome}</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => toggleInscricao(evento.id)}
                      disabled={aLoading}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 ${
                        inscrito
                          ? "bg-green-500/15 border border-green-500/30 text-green-400"
                          : "btn-orange"
                      }`}
                    >
                      {aLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : inscrito ? (
                        <><Check size={14} /> Inscrito</>
                      ) : (
                        "Inscrever-se"
                      )}
                    </button>
                    {evento.linkInscricao && (
                      <a
                        href={evento.linkInscricao}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white transition-colors"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
