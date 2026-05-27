"use client";

import { useEffect, useState, useCallback } from "react";
import { avisosApi, getCarrosselUrl, getAvisoFotoUrl, type AvisoComunidadeDTO } from "@/lib/api";
import { authApi } from "@/lib/api";
import Cookies from "js-cookie";
import { ExternalLink, Trophy, ChevronLeft, ChevronRight } from "lucide-react";

export default function UserHomePage() {
  const [avisos, setAvisos] = useState<AvisoComunidadeDTO[]>([]);
  const [userName, setUserName] = useState("Jogador");
  const [rankingResumo, setRankingResumo] = useState("Carregando ranking...");
  const [slide, setSlide] = useState(0);
  const totalBanners = 4;

  // Auto-avança o carrossel
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % totalBanners), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    avisosApi.listar().then((r) => setAvisos(r.data)).catch(() => {});

    const token = Cookies.get("token");
    if (token) {
      authApi.getMe()
        .then((r) => {
          setUserName(r.data.nome.split(" ")[0]);
        })
        .catch(() => {});
    }
  }, []);

  const prevSlide = () => setSlide((s) => (s - 1 + totalBanners) % totalBanners);
  const nextSlide = () => setSlide((s) => (s + 1) % totalBanners);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-sm">Bem-vindo de volta,</p>
          <h1 className="text-2xl font-black text-white">{userName}!</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center">
          <span className="text-orange font-black text-xl">R</span>
        </div>
      </div>

      {/* Ranking pill */}
      <div className="inline-flex items-center gap-2 bg-orange/10 border border-orange/20 rounded-full px-4 py-2">
        <Trophy size={14} className="text-orange" />
        <span className="text-white text-xs font-bold">Confira o ranking deste mês →</span>
      </div>

      {/* Carrossel de banners */}
      <div className="relative rounded-2xl overflow-hidden h-48 bg-bg-card border border-white/5 group">
        {Array.from({ length: totalBanners }, (_, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${slide === i ? "opacity-100" : "opacity-0"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getCarrosselUrl(i + 1)}
              alt={`Banner ${i + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <p className="absolute bottom-3 left-4 text-white font-bold text-sm">
              Destaques da Comunidade #{i + 1}
            </p>
          </div>
        ))}

        {/* Controles */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight size={16} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {Array.from({ length: totalBanners }, (_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`rounded-full transition-all ${
                slide === i ? "w-4 h-1.5 bg-orange" : "w-1.5 h-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Seção de avisos */}
      <div>
        <h2 className="text-white font-extrabold text-base mb-3 orange-line">
          Novidades da Temporada
        </h2>

        {avisos.length === 0 ? (
          <div className="glass rounded-xl p-6 text-center text-white/30 text-sm">
            Nenhum aviso no momento
          </div>
        ) : (
          <div className="space-y-3">
            {avisos.map((aviso) => (
              <AvisoCard key={aviso.id} aviso={aviso} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AvisoCard({ aviso }: { aviso: AvisoComunidadeDTO }) {
  const temFoto = !!aviso.urlFoto;

  return (
    <div
      className="glass rounded-xl overflow-hidden card-hover"
      onClick={() => aviso.link && window.open(aviso.link, "_blank")}
      style={{ cursor: aviso.link ? "pointer" : "default" }}
    >
      {temFoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getAvisoFotoUrl(aviso.urlFoto!)}
          alt={aviso.titulo}
          className="w-full h-36 object-cover"
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={`font-bold text-sm ${temFoto ? "text-white" : "text-orange"}`}>
              {aviso.titulo}
            </p>
            <p className="text-white/55 text-xs mt-1 leading-relaxed line-clamp-3">
              {aviso.mensagem}
            </p>
          </div>
          {aviso.link && (
            <ExternalLink size={14} className="text-cyan-400 shrink-0 mt-0.5" />
          )}
        </div>
        {aviso.link && (
          <p className="text-cyan-400 text-xs font-bold mt-2">
            Toque para ver detalhes
          </p>
        )}
      </div>
    </div>
  );
}
