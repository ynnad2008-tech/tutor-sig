import React, { useState } from "react";
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  Copy,
  Check,
  Compass,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { GEODETIC_ORIGINS } from "../data/sigData";

export const GeodeticSystemChecker: React.FC = () => {
  const [coordX, setCoordX] = useState<string>("4850000");
  const [coordY, setCoordY] = useState<string>("2050000");
  const [selectedSoftware, setSelectedSoftware] = useState<"arcgis" | "qgis">("arcgis");
  const [copiedEpsg, setCopiedEpsg] = useState<string | null>(null);

  // Analyze coordinates entered
  const checkCoordinates = () => {
    const x = parseFloat(coordX);
    const y = parseFloat(coordY);

    if (isNaN(x) || isNaN(y)) {
      return {
        status: "invalid",
        message: "Por favor ingresa valores numéricos válidos para Este (X) y Norte (Y).",
        badgeColor: "bg-rose-100 text-rose-700",
      };
    }

    // Check if in Origen Nacional range (X around 5.000.000, Y around 2.000.000)
    if (x >= 4000000 && x <= 6000000 && y >= 1000000 && y <= 3000000) {
      return {
        status: "valid_9377",
        message: "✅ ¡Coordenadas compatibles con MAGNA-SIRGAS Origen Nacional (EPSG: 9377)! Valores de Falso Este cercano a 5.000.000m y Falso Norte cercano a 2.000.000m.",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
        details: "Vigente bajo la Resolución 471/2020 y 529/2020 del IGAC.",
      };
    }

    // Check if in old Gauss-Krüger origins (around 1.000.000, 1.000.000)
    if (x >= 800000 && x <= 1200000 && y >= 800000 && y <= 1200000) {
      return {
        status: "old_origin",
        message: "⚠️ Advertencia: Estos valores corresponden a los antiguos orígenes Gauss-Krüger (ej. Origen Bogotá EPSG 3116 u Origen Oeste EPSG 3115).",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
        details: "Debes aplicar la herramienta 'Project' (Proyectar) en ArcGIS Pro/QGIS para migrarlas a EPSG: 9377 Origen Nacional.",
      };
    }

    // Check if in geographic coordinates (-180 to 180, -90 to 90)
    if (x >= -180 && x <= 180 && y >= -90 && y <= 90) {
      return {
        status: "geographic",
        message: "🌐 Advertencia: Estos valores son Coordenadas Geográficas (Angulares - Latitud/Longitud en grados decimales, ej. WGS84 EPSG: 4326).",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
        details: "No debes calcular áreas métricas (ha/m²) ni buffers en este sistema sin proyectar previamente a EPSG: 9377.",
      };
    }

    return {
      status: "unknown",
      message: "ℹ️ Valores fuera de los rangos comunes colombianos. Verifica si corresponden a coordenadas UTM (Falso Este 500.000m) o si los ejes X/Y están invertidos.",
      badgeColor: "bg-slate-100 text-slate-700",
      details: "Recuerda que en SIG el Este (X) y el Norte (Y) no deben confundirse.",
    };
  };

  const checkResult = checkCoordinates();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedEpsg(code);
    setTimeout(() => setCopiedEpsg(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm border-l-4 border-l-[#C8102E]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#003057] text-white flex items-center justify-center shadow-sm flex-shrink-0">
              <MapPin className="w-6 h-6 text-[#F3B229]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#003057] flex items-center gap-2">
                Verificador Geodésico & MAGNA-SIRGAS Origen Nacional
                <span className="text-[10px] bg-[#C8102E] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  EPSG: 9377
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Validación de sistemas de referencia espacial en Colombia (Resolución 471 de 2020 del IGAC), parámetros de proyección y prevención de deformaciones métricas.
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-900 font-bold flex items-center gap-2 self-start md:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Marco Oficial IGAC Obligatorio</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coordinate Range Validator Widget */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-[#003057] uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#C8102E]" />
                Verificador de Coordenadas Métricas
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Inspección Rápida</span>
            </div>

            <p className="text-xs text-slate-600">
              Ingresa una coordenada de tu proyecto o levantamiento GNSS para verificar si pertenece al Origen Nacional (EPSG: 9377) o a un origen antiguo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Coordenada Este / X (m):
                </label>
                <input
                  type="text"
                  value={coordX}
                  onChange={(e) => setCoordX(e.target.value)}
                  placeholder="Ej. 4850000"
                  className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#003057] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Coordenada Norte / Y (m):
                </label>
                <input
                  type="text"
                  value={coordY}
                  onChange={(e) => setCoordY(e.target.value)}
                  placeholder="Ej. 2050000"
                  className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#003057] focus:outline-none"
                />
              </div>
            </div>

            {/* Check Result Card */}
            <div className={`p-4 rounded-xl border ${checkResult.badgeColor} space-y-1.5 transition`}>
              <p className="text-xs font-bold leading-snug">{checkResult.message}</p>
              {checkResult.details && (
                <p className="text-[11px] opacity-90">{checkResult.details}</p>
              )}
            </div>

            {/* Step-by-step Setup Guides */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  ¿Cómo configurar EPSG: 9377 en tu software?
                </span>
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setSelectedSoftware("arcgis")}
                    className={`px-2.5 py-0.5 rounded-md transition ${
                      selectedSoftware === "arcgis" ? "bg-[#003057] text-white shadow-xs" : "text-slate-600"
                    }`}
                  >
                    ArcGIS Pro
                  </button>
                  <button
                    onClick={() => setSelectedSoftware("qgis")}
                    className={`px-2.5 py-0.5 rounded-md transition ${
                      selectedSoftware === "qgis" ? "bg-[#003057] text-white shadow-xs" : "text-slate-600"
                    }`}
                  >
                    QGIS
                  </button>
                </div>
              </div>

              {selectedSoftware === "arcgis" ? (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
                  <strong className="text-[#003057] block font-bold">Pasos en ArcGIS Pro:</strong>
                  <ol className="list-decimal list-inside space-y-1 text-[11px]">
                    <li>En el panel <em>Contents</em>, haz clic derecho sobre el elemento <strong>Map</strong> y selecciona <strong>Properties</strong>.</li>
                    <li>Ve a la pestaña <strong>Coordinate Systems</strong>.</li>
                    <li>En la barra de búsqueda escribe <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono font-bold text-[#C8102E]">9377</code> o <code className="bg-white px-1.5 py-0.5 rounded border font-mono">MAGNA-SIRGAS / Origen-Nacional</code>.</li>
                    <li>Selecciona <em>Projected Coordinate System &gt; National Grids &gt; Colombia</em> y pulsa <strong>OK</strong>.</li>
                    <li>Para transformar capas antiguas, usa la herramienta <strong>Project (Data Management Tools)</strong>.</li>
                  </ol>
                </div>
              ) : (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
                  <strong className="text-[#003057] block font-bold">Pasos en QGIS:</strong>
                  <ol className="list-decimal list-inside space-y-1 text-[11px]">
                    <li>Haz clic en el icono de SRC en la esquina inferior derecha (o pulsa <kbd className="bg-white px-1 rounded border">Ctrl + Shift + P</kbd>).</li>
                    <li>En el campo <em>Filtro</em> escribe <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono font-bold text-[#C8102E]">9377</code>.</li>
                    <li>Selecciona <strong>MAGNA-SIRGAS / Origen-Nacional (EPSG: 9377)</strong> en la lista.</li>
                    <li>Pulsa <strong>Aplicar</strong> y <strong>Aceptar</strong>.</li>
                    <li>Para guardar una capa en este sistema, haz clic derecho en la capa &gt; <em>Exportar &gt; Guardar objetos como...</em> y define el SRC en EPSG: 9377.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Origins Comparison Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#003057] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Layers className="w-4 h-4 text-[#C8102E]" />
              Matriz Comparativa de Sistemas y Orígenes en Colombia
            </h3>

            <div className="space-y-3">
              {GEODETIC_ORIGINS.map((origin, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition ${
                    origin.epsg === 9377
                      ? "border-emerald-300 bg-emerald-50/30 shadow-xs"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#003057]">
                        {origin.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          origin.status.includes("Oficial")
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : origin.status.includes("Histórico")
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        }`}
                      >
                        {origin.status}
                      </span>
                    </div>

                    <button
                      onClick={() => copyCode(origin.epsg.toString())}
                      className="text-[11px] font-mono font-bold text-slate-600 hover:text-[#003057] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>EPSG: {origin.epsg}</span>
                      {copiedEpsg === origin.epsg.toString() ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 mb-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Meridiano Central:</span>
                      <strong className="text-slate-800">{origin.centralMeridian}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Latitud Central:</span>
                      <strong className="text-slate-800">{origin.centralLatitude}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Falso Este:</span>
                      <strong className="text-slate-800">{origin.falseEasting}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Falso Norte:</span>
                      <strong className="text-slate-800">{origin.falseNorthing}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {origin.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
