import React from "react";
import { ExternalLink, RotateCcw, Monitor } from "lucide-react";
import { SoftwareTool } from "../types";

interface HeaderProps {
  selectedSoftware: SoftwareTool | "General";
  setSelectedSoftware: (software: any) => void;
  onResetChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedSoftware,
  setSelectedSoftware,
  onResetChat,
}) => {
  return (
    <header className="bg-[#003057] text-white sticky top-0 z-40 border-b-4 border-[#C8102E] shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Left: Branding */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100">
              <span className="text-[#003057] font-extrabold text-lg sm:text-xl leading-none">C</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 sm:gap-2">
                  Tutor-SIG
                  <span className="text-[9px] sm:text-[10px] bg-[#C8102E] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Copiloto IA
                  </span>
                </h1>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium">
                Universidad CESMAG • <span className="text-slate-400">Autor: geógr. Dany Benavides Bolaños</span>
              </p>
            </div>
          </div>

          {/* Mobile Reset Button (min 44px touch target) */}
          <button
            id="mobile-reset-chat-btn"
            onClick={onResetChat}
            title="Iniciar nueva consulta"
            aria-label="Iniciar nueva consulta"
            className="sm:hidden text-slate-200 hover:text-white p-2.5 rounded-lg bg-white/10 active:bg-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Controls (Software filter & reset) */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Software Focus Selector */}
          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5 border border-white/15 text-xs flex-1 sm:flex-initial">
            <Monitor className="w-3.5 h-3.5 text-[#F3B229] hidden sm:inline flex-shrink-0" />
            <span className="text-[11px] text-slate-300 font-medium hidden md:inline">Software:</span>
            <select
              id="software-focus-select"
              aria-label="Seleccionar Software de interés"
              value={selectedSoftware}
              onChange={(e) => setSelectedSoftware(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1 w-full sm:w-auto"
            >
              <option value="General" className="bg-[#003057] text-white">
                General / Todos los SIG
              </option>
              <option value="ArcGIS Pro" className="bg-[#003057] text-white">
                ArcGIS Pro
              </option>
              <option value="QGIS" className="bg-[#003057] text-white">
                QGIS
              </option>
              <option value="Google Earth Engine (GEE)" className="bg-[#003057] text-white">
                Google Earth Engine (GEE)
              </option>
              <option value="Google Earth Pro" className="bg-[#003057] text-white">
                Google Earth Pro
              </option>
              <option value="Python / GeoPandas" className="bg-[#003057] text-white">
                Python / GeoPandas
              </option>
            </select>
          </div>

          {/* Desktop Reset Chat Button */}
          <button
            id="desktop-reset-chat-btn"
            onClick={onResetChat}
            className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-semibold transition border border-white/15 cursor-pointer"
            title="Iniciar una nueva sesión de consulta"
            aria-label="Iniciar nueva consulta"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nueva Consulta</span>
          </button>

          {/* Link to CESMAG */}
          <a
            id="cesmag-portal-link"
            href="https://www.unicesmag.edu.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#F3B229] font-bold transition border border-white/15"
            title="Portal oficial de la Universidad CESMAG"
            aria-label="Ir al portal oficial de la Universidad CESMAG"
          >
            <span className="hidden md:inline">CESMAG</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
};
