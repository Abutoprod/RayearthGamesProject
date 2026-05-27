"use client";

import { useEffect, useState, useCallback } from "react";
import { avisosApi, type AvisoComunidadeDTO, getAvisoFotoUrl } from "@/lib/api";
import { Plus, Upload, X, Bell, Image as ImageIcon, ExternalLink, LayoutGrid } from "lucide-react";

export default function AdminAvisosPage() {
  const [avisos, setAvisos] = useState<AvisoComunidadeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"avisos" | "carrossel">("avisos");

  // Modal aviso
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    titulo: "", mensagem: "", link: "",
    dataExpiracao: "", urlFoto: "",
  });

  // Carrossel
  const [carrosselFiles, setCarrosselFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean[]>([false, false, false, false]);

  const fetchAvisos = useCallback(async () => {
    setLoading(true);
    try { const r = await avisosApi.listar(); setAvisos(r.data); }
    catch { setAvisos([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAvisos(); }, [fetchAvisos]);

  const salvarAviso = async () => {
    setSaving(true);
    try {
      let urlFoto = form.urlFoto;
      if (imageFile) {
        const res = await avisosApi.uploadFoto(imageFile);
        urlFoto = typeof res.data === "string" ? res.data : imageFile.name;
      }
      await avisosApi.criar({
        ...form,
        urlFoto: urlFoto || undefined,
        dataExpiracao: form.dataExpiracao ? `${form.dataExpiracao}T23:59:59` : form.dataExpiracao,
      });
      setShowModal(false);
      setImageFile(null);
      setForm({ titulo: "", mensagem: "", link: "", dataExpiracao: "", urlFoto: "" });
      fetchAvisos();
    } catch { alert("Erro ao salvar aviso."); }
    setSaving(false);
  };

  const uploadCarrossel = async (idx: number) => {
    const file = carrosselFiles[idx];
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const nome = `carrossel_${idx + 1}.jpg`;
      await avisosApi.uploadCarrossel(file, nome);
      setUploadSuccess((prev) => { const n = [...prev]; n[idx] = true; return n; });
      setTimeout(() => setUploadSuccess((prev) => { const n = [...prev]; n[idx] = false; return n; }), 3000);
    } catch { alert(`Erro ao enviar banner ${idx + 1}.`); }
    setUploadingIdx(null);
  };

  // Default expiry = 30 days
  const defaultExpiry = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white orange-line">Avisos & Carrossel</h1>
          <p className="text-white/40 text-sm mt-3">Gerencie os banners e avisos da comunidade</p>
        </div>
        {tab === "avisos" && (
          <button onClick={() => { setForm({...form, dataExpiracao: defaultExpiry()}); setShowModal(true); }}
            className="btn-orange px-5 py-2.5 flex items-center gap-2 text-sm">
            <Plus size={16} /> Novo Aviso
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-bg-input p-1 w-fit">
        {(["avisos", "carrossel"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${
              tab === t ? "bg-orange text-white" : "text-white/40 hover:text-white"
            }`}>
            {t === "avisos" ? "Avisos" : "Carrossel"}
          </button>
        ))}
      </div>

      {tab === "avisos" ? (
        <div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="glass rounded-xl h-28 animate-pulse" />)}</div>
          ) : avisos.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Bell size={36} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/40 font-semibold">Nenhum aviso cadastrado</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {avisos.map((a) => (
                <div key={a.id} className="glass rounded-xl overflow-hidden">
                  {a.urlFoto && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getAvisoFotoUrl(a.urlFoto)} alt={a.titulo}
                      className="w-full h-32 object-cover"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white font-bold text-sm">{a.titulo}</p>
                      {a.link && <ExternalLink size={13} className="text-cyan-400 shrink-0" />}
                    </div>
                    <p className="text-white/50 text-xs mt-1 line-clamp-2">{a.mensagem}</p>
                    <p className="text-white/20 text-xs mt-2">Expira: {a.dataExpiracao?.split("T")[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-white/40 text-sm">
            Envie os 4 banners que aparecem no carrossel do app dos usuários.
            Cada banner deve ser salvo como <code className="text-orange/70 bg-orange/5 px-1 rounded">carrossel_N.jpg</code>.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[0,1,2,3].map((idx) => (
              <div key={idx} className="glass rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={16} className="text-orange" />
                  <span className="text-white font-bold text-sm">Banner {idx + 1}</span>
                  {uploadSuccess[idx] && (
                    <span className="text-green-400 text-xs font-bold ml-auto">✓ Enviado!</span>
                  )}
                </div>

                <label className="flex items-center gap-2 input-dark px-3 py-2 cursor-pointer hover:border-orange/30 transition-colors rounded-xl">
                  <ImageIcon size={14} className="text-white/30" />
                  <span className="text-white/40 text-xs truncate">
                    {carrosselFiles[idx] ? carrosselFiles[idx]!.name : "Selecionar imagem"}
                  </span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setCarrosselFiles((prev) => { const n = [...prev]; n[idx] = f; return n; });
                    }} />
                </label>

                <button
                  onClick={() => uploadCarrossel(idx)}
                  disabled={!carrosselFiles[idx] || uploadingIdx === idx}
                  className="btn-orange w-full py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {uploadingIdx === idx ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Upload size={14} /> Enviar Banner {idx + 1}</>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal novo aviso */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 glass rounded-2xl w-full max-w-lg p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold">Novo Aviso</h3>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Título</label>
                <input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  className="input-dark w-full px-3 py-2.5 text-sm" placeholder="Ex: Torneio de Pokémon!" />
              </div>
              <div>
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Mensagem</label>
                <textarea value={form.mensagem} onChange={(e) => setForm((f) => ({ ...f, mensagem: e.target.value }))}
                  rows={3} className="input-dark w-full px-3 py-2.5 text-sm resize-none"
                  placeholder="Detalhes do aviso..." />
              </div>
              <div>
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Link (opcional)</label>
                <input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  type="url" className="input-dark w-full px-3 py-2.5 text-sm"
                  placeholder="https://..." />
              </div>
              <div>
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Data de Expiração</label>
                <input value={form.dataExpiracao} onChange={(e) => setForm((f) => ({ ...f, dataExpiracao: e.target.value }))}
                  type="date" className="input-dark w-full px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-white/40 text-xs font-semibold uppercase mb-1.5 block">Imagem (opcional)</label>
                <label className="flex items-center gap-2 input-dark px-3 py-2.5 cursor-pointer rounded-xl hover:border-orange/30 transition-colors">
                  <ImageIcon size={14} className="text-white/30" />
                  <span className="text-white/40 text-sm">{imageFile ? imageFile.name : "Selecionar imagem"}</span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <button onClick={salvarAviso} disabled={saving || !form.titulo || !form.mensagem}
                className="btn-orange w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Publicar Aviso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
