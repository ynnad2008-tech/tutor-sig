import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Layers,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Workflow,
  ArrowRight,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { SoftwareTool } from "../types";
import { generateGeoprocessFlow } from "../services/aiService";

interface GeoprocessFlowBuilderProps {
  selectedSoftware: SoftwareTool;
}

export const GeoprocessFlowBuilder: React.FC<GeoprocessFlowBuilderProps> = ({
  selectedSoftware,
}) => {
  const [problemDescription, setProblemDescription] = useState("");
  const [software, setSoftware] = useState<string>(selectedSoftware);
  const [flowResult, setFlowResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const presetTemplates = [
    {
      title: "Delimitación de Rondas Hídricas (Decreto 2245 / 1076)",
      problem: "Delimitación de la ronda de protección hídrica de 30 metros mínimos y componente geomorfológico en una subcuenca, cruzando con la capa de coberturas para identificar áreas con pérdida de vegetación de ribera.",
      tag: "Cuencas & Rondas",
    },
    {
      title: "Zonificación de Amenaza por Movimientos en Masa (AHP / Mora-Vahrson)",
      problem: "Integración multicriterio de variables de pendiente (DEM), geología/litología, geomorfología y cobertura vegetal mediante superposición ponderada para zonificar la susceptibilidad por deslizamientos en una cuenca de ladera.",
      tag: "Gestión del Riesgo",
    },
    {
      title: "Detección de Deforestación y Pérdida de Bosque con Sentinel-2",
      problem: "Monitoreo multitemporal de cambio de cobertura boscosa mediante álgebra de mapas y diferencia normalizada de NDVI (dNDVI = NDVI_t1 - NDVI_t2) con reclasificación de umbrales de degradación.",
      tag: "Teledetección",
    },
    {
      title: "Modelación de Erosión Hídrica Potencial (Ecuación USLE)",
      problem: "Cálculo de la pérdida de suelo anual en toneladas/ha/año mediante la ecuación USLE (A = R * K * LS * C * P) integrando mapas de erosividad, erodabilidad, longitud/inclinación de pendiente (DEM) y factor de cobertura.",
      tag: "Suelos & Erosión",
    },
  ];

  const handleGenerateFlow = async (textToUse?: string) => {
    const query = textToUse || problemDescription;
    if (!query.trim()) {
      alert("Por favor describe el objetivo o problema ambiental a modelar.");
      return;
    }

    setIsLoading(true);
    setFlowResult(null);

    try {
      const flowText = await generateGeoprocessFlow({
        problemDescription: query,
        software,
      });

      setFlowResult(flowText);
    } catch (err: any) {
      console.error(err);
      alert(`Error al generar flujo: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyFlow = () => {
    if (flowResult) {
      navigator.clipboard.writeText(flowResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm border-l-4 border-l-[#C8102E]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#003057] text-white flex items-center justify-center shadow-sm flex-shrink-0">
              <Workflow className="w-6 h-6 text-[#F3B229]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#003057] flex items-center gap-2">
                Diseñador de Flujos Metodológicos & ModelBuilder
                <span className="text-[10px] bg-[#C8102E] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  Geoprocesamiento Ambiental
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Estructura la secuencia lógica de geoprocesamientos (Buffer, Clip, Intersect, Dissolve, Spatial Join, Raster Calculator) para estudios ambientales en Colombia.
              </p>
            </div>
          </div>

          <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold flex items-center gap-2 self-start md:self-auto">
            <ShieldCheck className="w-4 h-4 text-[#C8102E] flex-shrink-0" />
            <span>Alineado con Módulo 3: Análisis Espacial e IA</span>
          </div>
        </div>
      </div>

      {/* Preset Problem Cards */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#003057] uppercase tracking-wider block">
          Flujos Metodológicos Tipo para Gestión Ambiental:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presetTemplates.map((template, idx) => (
            <button
              key={idx}
              onClick={() => {
                setProblemDescription(template.problem);
                handleGenerateFlow(template.problem);
              }}
              className="text-left p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#C8102E] hover:shadow-sm transition flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-[#C8102E] bg-rose-50 px-2 py-0.5 rounded-md mb-2 inline-block">
                  {template.tag}
                </span>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#003057] line-clamp-2">
                  {template.title}
                </h4>
              </div>
              <span className="text-[11px] text-[#003057] font-bold mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Generar diagrama <ArrowRight className="w-3.5 h-3.5 text-[#C8102E]" />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#003057] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#C8102E]" />
              Configuración del Modelo Espacial
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Software de Geoprocesamiento:
              </label>
              <select
                value={software}
                onChange={(e) => setSoftware(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-[#003057] focus:outline-none"
              >
                <option value="ArcGIS Pro (ModelBuilder / Herramientas)">ArcGIS Pro (ModelBuilder / Herramientas)</option>
                <option value="QGIS (Modelador Gráfico / Processing)">QGIS (Modelador Gráfico / Processing)</option>
                <option value="Google Earth Engine (GEE - JavaScript)">Google Earth Engine (GEE - JavaScript)</option>
                <option value="Python (ArcPy / GeoPandas / Rasterio)">Python (ArcPy / GeoPandas / Rasterio)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Descripción del Problema o Necesidad Analítica:
              </label>
              <textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                rows={6}
                placeholder="Describe tu objetivo espacial: Ej. Necesito cruzar una capa de áreas protegidas con zonas de concesión minera y calcular el porcentaje de solape topológico por municipio..."
                className="w-full text-xs rounded-lg border border-slate-300 p-3 text-slate-800 focus:ring-2 focus:ring-[#003057] focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleGenerateFlow()}
              disabled={isLoading || !problemDescription.trim()}
              className="w-full py-2.5 rounded-xl bg-[#003057] hover:bg-[#C8102E] text-white font-bold text-xs tracking-wide transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Diseñando secuencia de geoprocesamiento...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#F3B229]" />
                  <span>Construir Flujo & ModelBuilder</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-[#C8102E]" />
                <h3 className="text-xs font-bold text-[#003057] uppercase tracking-wider">
                  Secuencia Metodológica & Arquitectura de Datos
                </h3>
              </div>

              {flowResult && (
                <button
                  onClick={copyFlow}
                  className="text-xs px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Flujo</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center animate-pulse border border-[#C8102E]/20">
                  <Workflow className="w-7 h-7 text-[#C8102E]" />
                </div>
                <div className="max-w-md space-y-2">
                  <h4 className="text-sm font-bold text-[#003057]">
                    Validando geocadenas y parámetros espaciales...
                  </h4>
                  <p className="text-xs text-slate-500">
                    Estructurando insumos, herramientas intermedias, reglas topológicas y productos de salida en MAGNA-SIRGAS Origen Nacional.
                  </p>
                </div>
              </div>
            ) : flowResult ? (
              <div className="flex-1 overflow-y-auto prose prose-sm max-w-none text-slate-800">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-3">
                        <table className="min-w-full text-xs divide-y divide-slate-200 border border-slate-200 rounded-lg" {...props} />
                      </div>
                    ),
                    th: ({ node, ...props }) => (
                      <th className="bg-slate-100 px-3 py-2 text-left font-bold text-slate-700" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="px-3 py-2 border-t border-slate-200" {...props} />
                    ),
                  }}
                >
                  {flowResult}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
                <Workflow className="w-10 h-10 text-slate-300" />
                <h4 className="text-sm font-bold text-slate-700">
                  No hay flujo generado aún
                </h4>
                <p className="text-xs text-slate-400 max-w-md">
                  Selecciona una de las plantillas predefinidas o escribe el objetivo de tu análisis espacial para que Tutor-SIG estructure el modelo lógico paso a paso.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
