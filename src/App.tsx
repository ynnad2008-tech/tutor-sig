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
  programa:
    "el Diplomado en Sistemas de Información Geográfica (SIG) + IA — Facultad de Arquitectura",
  materials: [
    {
      title: "Material Fase 3 — Análisis Espacial",
      url: "/materials/Fase3_Analisis_Espacial.docx",
    },
  ],
  quickStarters: [
    { title: "MAGNA-SIRGAS Origen Nacional (9377)", icon: "mappin", prompt: "¿Cómo configuro y transformo mis capas al sistema oficial MAGNA-SIRGAS Origen Nacional (EPSG: 9377) según la Resolución 471 de 2020 del IGAC?" },
    { title: "Diagnóstico de usos del suelo para POT/PBOT", icon: "layers", prompt: "¿Cómo estructurar un diagnóstico de usos del suelo y coberturas para un Plan de Ordenamiento Territorial (POT/PBOT), y qué análisis de superposición debo aplicar para detectar conflictos de uso?" },
    { title: "Accesibilidad y equipamientos urbanos", icon: "compass", prompt: "¿Qué secuencia de geoprocesamiento (Buffer, Spatial Join, análisis de redes) uso para evaluar la accesibilidad y cobertura de equipamientos urbanos en un municipio?" },
    { title: "Índice de Vegetación (NDVI) en Sentinel-2", icon: "calculator", prompt: "Explícame paso a paso cómo calcular el NDVI con imágenes Sentinel-2 en la Calculadora Ráster y cómo interpretar los valores en un estudio territorial y ambiental." },
    { title: "Amenazas y aptitud del suelo para proyectos", icon: "shield", prompt: "¿Cómo integrar pendientes, geología y coberturas en un análisis de amenaza por movimientos en masa y aptitud del suelo para localizar un proyecto arquitectónico o urbanístico?" },
    { title: "Rondas hídricas y servicios públicos (EMPOPASTO)", icon: "sparkles", prompt: "¿Cómo delimitar rondas hídricas y analizar la cobertura de redes de acueducto para identificar sectores urbanos con déficit de servicio, usando herramientas de geoprocesamiento?" },
  ],
  cronograma: true,
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
