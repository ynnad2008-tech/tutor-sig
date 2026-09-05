import React from "react";
import { CalendarDays, Clock, Megaphone, Users, X } from "lucide-react";
import { CRONOGRAMA_DIPLOMADO } from "../data/cronograma";

interface CronogramaDiplomadoProps {
  open: boolean;
  onClose: () => void;
}

/** Panel modal con el cronograma oficial del Diplomado en SIG (CESMAG 2026). */
export const CronogramaDiplomado: React.FC<CronogramaDiplomadoProps> = ({
  open,
  onClose,
}) => {
  if (!open) return null;
  const crono = CRONOGRAMA_DIPLOMADO;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between p-5 pb-4 bg-[#003057] text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-[#F3B229] flex-shrink-0" />
            <div>
              <h3 className="text-base font-bold">Cronograma Diplomado SIG 2026</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {crono.periodoClases}
              </p>
              <p className="text-[11px] text-slate-400">{crono.horario}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar cronograma"
            title="Cerrar cronograma"
            className="p-2 rounded-lg bg-white/10 hover:bg-red-600 transition flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto p-5 space-y-4">
          {/* Fase de difusión */}
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <Megaphone className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            {crono.faseDifusion}
          </div>

          {crono.modulos.map((mod) => (
            <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#003057] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                    {mod.numero}
                  </span>
                  <h4 className="text-xs font-bold text-[#003057]">{mod.titulo}</h4>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#C8102E]" />
                    {mod.encargado}
                  </span>
                  <span className="flex items-center gap-1 font-mono font-bold">
                    <Clock className="w-3 h-3 text-[#C8102E]" />
                    {mod.totalHoras} h
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-slate-100">
                {mod.temas.map((tema, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 px-4 py-2 text-[11px] text-slate-700"
                  >
                    <span>{tema.tema}</span>
                    <span className="flex items-center gap-2 flex-shrink-0">
                      {tema.docente && (
                        <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                          {tema.docente}
                        </span>
                      )}
                      <span className="font-mono font-bold text-[#003057]">{tema.horas} h</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Cierre */}
          <div className="border border-[#C8102E]/30 bg-rose-50/40 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#003057]">
              <Megaphone className="w-4 h-4 text-[#C8102E] flex-shrink-0" />
              <span>
                {crono.cierre.titulo} — {crono.cierre.detalle}{" "}
                <span className="text-[#C8102E] font-bold">({crono.cierre.modalidad})</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-600">
              <span className="font-medium">{crono.cierre.docente}</span>
              <span className="font-mono font-bold text-[#003057]">{crono.cierre.horas} h</span>
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="px-4 pb-4 pt-0 text-center text-[10px] text-slate-400">
          Versión del cronograma: {crono.version} · Total: {crono.totalHoras} horas ·
          Universidad CESMAG
        </div>
      </div>
    </div>
  );
};
