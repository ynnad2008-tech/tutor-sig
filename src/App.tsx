import React, { useState, useRef, useEffect } from "react";
import { Header } from "./components/Header";
import { ChatTutor } from "./components/ChatTutor";
import { SoftwareTool } from "./types";
import { getAppConfig, AppConfig } from "./services/aiService";
import { ShieldCheck, ExternalLink } from "lucide-react";

/**
 * Identidad por defecto (CESMAG). Al cargar, la app consulta /api/config y
 * adopta la marca que defina el servidor con sus variables de entorno
 * (p. ej. Universidad Mariana en AI Studio).
 */
const DEFAULT_CONFIG: AppConfig = {
  tutorName: "Tutor-SIG",
  institution: "Universidad CESMAG",
  author: "geógr. Dany Benavides Bolaños",
  portalUrl: "https://www.unicesmag.edu.co/",
};

/** Nombre corto de la institución (última palabra) para logo y enlaces. */
function nombreCorto(institution: string): string {
  return institution.split(" ").filter(Boolean).pop() || institution;
}

/** Letra del logo: inicial del nombre corto (Mariana → M, CESMAG → C). */
function logoLetra(institution: string): string {
  return nombreCorto(institution).charAt(0).toUpperCase();
}

export default function App() {
  const [selectedSoftware, setSelectedSoftware] = useState<SoftwareTool | "General">("General");
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const resetChatRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let activo = true;
    getAppConfig()
      .then((c) => {
        if (!activo) return;
        setConfig(c);
        document.title = `${c.tutorName} | Copiloto Docente e IA Pedagógica (${c.institution})`;
      })
      .catch(() => {
        // Sin conexión con /api/config se mantiene la identidad por defecto.
      });
    return () => {
      activo = false;
    };
  }, []);

  const handleResetChat = () => {
    if (resetChatRef.current) {
      resetChatRef.current();
    }
  };

  const portalHost = config.portalUrl
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-[#C8102E] selection:text-white">
      {/* Clean Institutional Header */}
      <Header
        selectedSoftware={selectedSoftware}
        setSelectedSoftware={setSelectedSoftware}
        onResetChat={handleResetChat}
        config={config}
        logoLetra={logoLetra(config.institution)}
        nombreCorto={nombreCorto(config.institution)}
      />

      {/* Main Agent Chat Workspace */}
      <main className="flex-1 w-full flex flex-col min-h-0">
        <ChatTutor
          selectedSoftware={selectedSoftware}
          onResetRef={resetChatRef}
          config={config}
        />
      </main>

      {/* Minimal Institutional Footer */}
      <footer className="bg-[#003057] text-slate-300 text-xs border-t-2 border-[#C8102E] py-2.5 flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#003057] font-extrabold text-[10px]">
                {logoLetra(config.institution)}
              </span>
            </div>
            <span className="text-slate-300 text-[11px]">
              <strong className="text-white font-semibold">{config.tutorName}</strong> •{" "}
              {config.institution} | Autor:{" "}
              <strong className="text-slate-200">{config.author}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Orientación Pedagógica Formativa
            </span>
            <span>•</span>
            <a
              href={config.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F3B229] hover:underline flex items-center gap-0.5 font-semibold"
            >
              <span>{portalHost}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
