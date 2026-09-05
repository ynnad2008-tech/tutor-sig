import React, { useState } from "react";
import {
  Calculator,
  Layers,
  Sparkles,
  Copy,
  Check,
  Flame,
  Droplets,
  Trees,
  Mountain,
  Code,
  Info,
  Sliders,
} from "lucide-react";
import { SPECTRAL_INDICES } from "../data/sigData";
import { SpectralIndex } from "../types";

export const SpectralIndicesCalculator: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [activeTab, setActiveTab] = useState<"catalog" | "simulator">("catalog");
  const [selectedSensor, setSelectedSensor] = useState<"sentinel" | "landsat">("sentinel");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Simulator state
  const [simIndex, setSimIndex] = useState<string>("ndvi");
  const [simNIR, setSimNIR] = useState<number>(0.55);
  const [simRed, setSimRed] = useState<number>(0.12);
  const [simGreen, setSimGreen] = useState<number>(0.18);
  const [simSWIR, setSimSWIR] = useState<number>(0.22);
  const [simBlue, setSimBlue] = useState<number>(0.08);

  const categories = ["Todos", "Vegetación", "Agua / Humedad", "Fuego / Severidad", "Suelo / Geología"];

  const filteredIndices = selectedCategory === "Todos"
    ? SPECTRAL_INDICES
    : SPECTRAL_INDICES.filter((idx) => idx.category === selectedCategory);

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate live value for simulator
  const calculateSimulatedValue = () => {
    switch (simIndex) {
      case "ndvi":
        return (simNIR - simRed) / (simNIR + simRed || 0.0001);
      case "ndwi":
        return (simGreen - simNIR) / (simGreen + simNIR || 0.0001);
      case "nbr":
        return (simNIR - simSWIR) / (simNIR + simSWIR || 0.0001);
      case "savi":
        return ((simNIR - simRed) / (simNIR + simRed + 0.5)) * 1.5;
      case "bsi":
        return ((simSWIR + simRed) - (simNIR + simBlue)) / ((simSWIR + simRed) + (simNIR + simBlue) || 0.0001);
      default:
        return 0;
    }
  };

  const simValue = calculateSimulatedValue();

  const getSimulatedInterpretation = () => {
    const active = SPECTRAL_INDICES.find((i) => i.id === simIndex);
    if (!active) return { label: "N/A", color: "#64748B" };

    if (simIndex === "ndvi") {
      if (simValue < 0) return { label: "Cuerpo de agua o nube densa", color: "#3B82F6" };
      if (simValue < 0.2) return { label: "Suelo desnudo, roca o área urbana", color: "#D97706" };
      if (simValue < 0.4) return { label: "Vegetación dispersa / pastizal ralo", color: "#EAB308" };
      if (simValue < 0.7) return { label: "Vegetación moderada (cultivos / arbustos)", color: "#84CC16" };
      return { label: "Vegetación densa y vigorosa (Bosque húmedo)", color: "#15803D" };
    }

    if (simIndex === "ndwi") {
      if (simValue > 0.2) return { label: "Lámina de agua abierta / río / laguna", color: "#1D4ED8" };
      if (simValue > 0.0) return { label: "Zona húmeda / vegetación saturada", color: "#06B6D4" };
      if (simValue > -0.3) return { label: "Vegetación con humedad moderada", color: "#10B981" };
      return { label: "Suelo seco / superficie no acuática", color: "#F59E0B" };
    }

    if (simIndex === "nbr") {
      if (simValue < 0.1) return { label: "Suelo quemado / ceniza / baja biomasa", color: "#DC2626" };
      if (simValue < 0.3) return { label: "Vegetación moderada", color: "#F97316" };
      return { label: "Vegetación sana y vigorosa sin quemar", color: "#22C55E" };
    }

    return { label: "Índice calculado", color: "#003057" };
  };

  const interpretation = getSimulatedInterpretation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm border-l-4 border-l-[#C8102E]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#003057] text-white flex items-center justify-center shadow-sm flex-shrink-0">
              <Calculator className="w-6 h-6 text-[#F3B229]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#003057] flex items-center gap-2">
                Catálogo & Calculadora de Índices Espectrales
                <span className="text-[10px] bg-[#C8102E] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  Sentinel-2 & Landsat 8/9
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Fórmulas normalizadas, correspondencia de bandas satelitales, rangos de interpretación ambiental y scripts para Raster Calculator y Google Earth Engine (GEE).
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === "catalog"
                  ? "bg-white text-[#003057] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Catálogo de Índices
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === "simulator"
                  ? "bg-[#C8102E] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#F3B229]" />
              Simulador Interactivo
            </button>
          </div>
        </div>
      </div>

      {activeTab === "catalog" ? (
        <>
          {/* Filters and Sensor Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 mr-2">Categoría:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    selectedCategory === cat
                      ? "bg-[#003057] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Sensor Satelital:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setSelectedSensor("sentinel")}
                  className={`px-2.5 py-1 rounded-md transition ${
                    selectedSensor === "sentinel"
                      ? "bg-[#003057] text-white shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  Sentinel-2 MSI (10m/20m)
                </button>
                <button
                  onClick={() => setSelectedSensor("landsat")}
                  className={`px-2.5 py-1 rounded-md transition ${
                    selectedSensor === "landsat"
                      ? "bg-[#003057] text-white shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  Landsat 8/9 OLI (30m)
                </button>
              </div>
            </div>
          </div>

          {/* Indices Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredIndices.map((idx) => {
              const activeFormula = selectedSensor === "sentinel" ? idx.sentinel2Formula : idx.landsat8Formula;
              return (
                <div
                  key={idx.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg font-extrabold text-[#003057] bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 font-mono">
                          {idx.acronym}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">{idx.name}</h3>
                          <span className="text-[11px] font-bold text-[#C8102E]">
                            {idx.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {idx.description}
                    </p>

                    {/* Formula Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Fórmula Teórica:</span>
                        <code className="font-mono font-bold text-slate-800">{idx.formula}</code>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/80">
                        <span className="text-[#003057] font-bold">
                          Bandas {selectedSensor === "sentinel" ? "Sentinel-2" : "Landsat 8/9"}:
                        </span>
                        <code className="font-mono font-bold text-[#C8102E] bg-white px-2 py-0.5 rounded border border-slate-200">
                          {activeFormula}
                        </code>
                      </div>
                    </div>

                    {/* Environmental Application */}
                    <div className="text-xs text-slate-700 bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-2.5 mb-3">
                      <strong className="text-emerald-900 block mb-0.5">
                        🌱 Aplicación en Gestión Ambiental:
                      </strong>
                      {idx.environmentalApplication}
                    </div>

                    {/* Interpretation Ranges */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider">
                        Rangos de Interpretación:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {idx.interpretationRanges.map((range, rIdx) => (
                          <div
                            key={rIdx}
                            className="flex items-center gap-2 text-[11px] bg-slate-50 border border-slate-200 px-2 py-1 rounded-md"
                          >
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: range.color }}
                            />
                            <span className="font-mono font-bold text-slate-700">{range.range}:</span>
                            <span className="text-slate-600 truncate">{range.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Code Snippets */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#003057] flex items-center gap-1">
                        <Code className="w-3.5 h-3.5 text-[#C8102E]" /> Sintaxis Raster Calculator (ArcGIS Pro):
                      </span>
                      <button
                        onClick={() => copySnippet(idx.rasterCalculatorArcGIS, idx.id + "-arcgis")}
                        className="text-[11px] text-slate-500 hover:text-[#003057] flex items-center gap-1 font-semibold"
                      >
                        {copiedId === idx.id + "-arcgis" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto">
                      {idx.rasterCalculatorArcGIS}
                    </pre>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-[#003057] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#F3B229]" /> Google Earth Engine (GEE):
                      </span>
                      <button
                        onClick={() => copySnippet(idx.geeCodeSnippet, idx.id + "-gee")}
                        className="text-[11px] text-slate-500 hover:text-[#003057] flex items-center gap-1 font-semibold"
                      >
                        {copiedId === idx.id + "-gee" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto">
                      {idx.geeCodeSnippet}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Interactive Simulator */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-[#003057] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#C8102E]" />
              Simulador de Comportamiento Espectral & Visualizador de Umbrales
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Ajusta los valores de reflectancia de las bandas espectrales para observar cómo reacciona el índice y qué cobertura ambiental representa.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sliders Area */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selecciona el Índice a Simular:
                </label>
                <select
                  value={simIndex}
                  onChange={(e) => setSimIndex(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 font-bold focus:ring-2 focus:ring-[#003057] focus:outline-none"
                >
                  <option value="ndvi">NDVI - Índice de Vegetación (NIR y Rojo)</option>
                  <option value="ndwi">NDWI - Índice de Cuerpos de Agua (Verde y NIR)</option>
                  <option value="nbr">NBR - Índice de Severidad de Fuego (NIR y SWIR2)</option>
                  <option value="savi">SAVI - Vegetación Ajustado al Suelo</option>
                  <option value="bsi">BSI - Índice de Suelo Desnudo y Erosión</option>
                </select>
              </div>

              {/* NIR Slider */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
                    Reflectancia Infrarrojo Cercano (NIR - Banda 8 / 5):
                  </span>
                  <span className="font-mono font-bold text-[#003057]">{simNIR.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={simNIR}
                  onChange={(e) => setSimNIR(parseFloat(e.target.value))}
                  className="w-full accent-[#003057] cursor-pointer"
                />
              </div>

              {/* Red Slider */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                    Reflectancia Rojo (Red - Banda 4):
                  </span>
                  <span className="font-mono font-bold text-[#003057]">{simRed.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={simRed}
                  onChange={(e) => setSimRed(parseFloat(e.target.value))}
                  className="w-full accent-[#C8102E] cursor-pointer"
                />
              </div>

              {/* Green Slider */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                    Reflectancia Verde (Green - Banda 3):
                  </span>
                  <span className="font-mono font-bold text-[#003057]">{simGreen.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={simGreen}
                  onChange={(e) => setSimGreen(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* SWIR Slider */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-600 inline-block"></span>
                    Reflectancia Infrarrojo de Onda Corta (SWIR - Banda 11/12 ó 6/7):
                  </span>
                  <span className="font-mono font-bold text-[#003057]">{simSWIR.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={simSWIR}
                  onChange={(e) => setSimSWIR(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Simulated Output Meter */}
            <div className="lg:col-span-6 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-[#003057] text-white p-6 rounded-2xl shadow-sm space-y-5">
              <div>
                <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">
                  Resultado del Cálculo Espectral:
                </span>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-5xl font-black font-mono tracking-tight text-[#F3B229]">
                    {simValue.toFixed(3)}
                  </span>
                  <span className="text-sm font-bold text-slate-300">
                    ({simIndex.toUpperCase()})
                  </span>
                </div>
              </div>

              {/* Interpretation Pill */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-2">
                <span className="text-xs text-slate-300 font-bold block">
                  Diagnóstico e Interpretación Ambiental:
                </span>
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: interpretation.color }}
                  />
                  <span className="text-base font-bold text-white">
                    {interpretation.label}
                  </span>
                </div>
              </div>

              {/* Progress Bar Range */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-300 font-semibold">
                  <span>Mínimo (-1.00)</span>
                  <span>Neutro (0.00)</span>
                  <span>Máximo (+1.00)</span>
                </div>
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(0, Math.min(100, ((simValue + 1) / 2) * 100))}%`,
                      backgroundColor: interpretation.color,
                    }}
                  />
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-lg border border-white/10 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#F3B229] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Tip de Geoprocesamiento:</strong> En ArcGIS Pro recuerda convertir las bandas enteras (DN) a tipo <code className="text-[#F3B229] font-mono">Float()</code> en Raster Calculator para evitar truncamientos a valores enteros (0 o 1).
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
