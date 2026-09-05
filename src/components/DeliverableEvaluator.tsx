import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FileCheck2,
  UploadCloud,
  CheckCircle,
  AlertOctagon,
  Sparkles,
  MapPin,
  Maximize2,
  Layers,
  Copy,
  Check,
  RefreshCw,
  Info,
} from "lucide-react";
import { SoftwareTool } from "../types";
import { evaluateDeliverable } from "../services/aiService";

interface DeliverableEvaluatorProps {
  selectedSoftware: SoftwareTool;
}

export const DeliverableEvaluator: React.FC<DeliverableEvaluatorProps> = ({
  selectedSoftware,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scale, setScale] = useState("1:25.000");
  const [datum, setDatum] = useState("MAGNA-SIRGAS Origen Nacional (EPSG: 9377)");
  const [software, setSoftware] = useState<string>(selectedSoftware);
  const [image, setImage] = useState<{ base64: string; mime: string; name: string } | null>(null);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo de imagen no debe superar los 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage({
        base64: reader.result as string,
        mime: file.type || "image/png",
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !image) {
      alert("Por favor describe el entregable o sube una imagen/mapa para evaluar.");
      return;
    }

    setIsLoading(true);
    setEvaluation(null);

    try {
      const evaluationText = await evaluateDeliverable({
        title: title || "Entregable Cartográfico / SIG",
        description,
        scale,
        datum,
        software,
        imageBase64: image?.base64,
        imageMime: image?.mime,
      });

      setEvaluation(evaluationText);
    } catch (err: any) {
      console.error(err);
      alert(`Error en la evaluación: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyEvaluation = () => {
    if (evaluation) {
      navigator.clipboard.writeText(evaluation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Guidance Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm border-l-4 border-l-[#C8102E]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#003057] text-white flex items-center justify-center shadow-sm flex-shrink-0">
              <FileCheck2 className="w-6 h-6 text-[#F3B229]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#003057] flex items-center gap-2">
                Taller de Evaluación Pedagógica de Entregables
                <span className="text-[10px] bg-[#C8102E] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  Rúbrica de 5 Criterios
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Sube tu salida cartográfica (Layout en imagen) o describe tu metodología y modelo de datos. Tutor-SIG emitirá un dictamen pedagógico estructurado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-700">
            <Info className="w-4 h-4 text-[#C8102E] flex-shrink-0" />
            <span>
              Estructura obligatoria: <strong>Fortalezas, Errores Conceptuales, Errores Cartográficos, Aspectos por Mejorar</strong> y <strong>Calificación Sugerida</strong>.
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Submission Panel */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleEvaluate} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#003057] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C8102E]" />
              Ficha Técnica del Entregable
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Título del Mapa o Proyecto:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Mapa de Cobertura Vegetal y Rondas Hídricas en la Cuenca Alta"
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#003057] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Software Empleado:
                </label>
                <select
                  value={software}
                  onChange={(e) => setSoftware(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-2 text-slate-800 focus:outline-none font-medium"
                >
                  <option value="ArcGIS Pro">ArcGIS Pro</option>
                  <option value="QGIS">QGIS</option>
                  <option value="Google Earth Engine (GEE)">Google Earth Engine (GEE)</option>
                  <option value="Google Earth Pro">Google Earth Pro</option>
                  <option value="ArcGIS Online">ArcGIS Online</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Escala de Trabajo:
                </label>
                <input
                  type="text"
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  placeholder="Ej. 1:25.000, 1:10.000"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Sistema de Coordenadas & Datum (SRC):</span>
                <span className="text-[10px] text-[#C8102E] font-bold">Obligatorio</span>
              </label>
              <select
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-2 text-slate-800 focus:outline-none font-medium"
              >
                <option value="MAGNA-SIRGAS Origen Nacional (EPSG: 9377)">
                  MAGNA-SIRGAS Origen Nacional (EPSG: 9377) - Oficial Res. 471/2020
                </option>
                <option value="MAGNA-SIRGAS Origen Bogotá (EPSG: 3116) - Histórico">
                  MAGNA-SIRGAS Origen Bogotá (EPSG: 3116) - Histórico
                </option>
                <option value="MAGNA-SIRGAS Origen Oeste (EPSG: 3115) - Histórico Nariño">
                  MAGNA-SIRGAS Origen Oeste (EPSG: 3115) - Histórico Nariño
                </option>
                <option value="WGS84 UTM Zona 18 Norte (EPSG: 32618)">
                  WGS84 UTM Zona 18 Norte (EPSG: 32618)
                </option>
                <option value="WGS84 Geográficas (EPSG: 4326)">
                  WGS84 Geográficas (EPSG: 4326 - Grados)
                </option>
              </select>
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Composición de Mapa o Captura del Layout:
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                  image
                    ? "border-emerald-400 bg-emerald-50/40"
                    : "border-slate-300 hover:border-[#C8102E] hover:bg-slate-50"
                }`}
              >
                {image ? (
                  <div className="space-y-2">
                    <img
                      src={image.base64}
                      alt="Vista previa"
                      className="max-h-36 mx-auto rounded border border-slate-300 object-contain"
                    />
                    <p className="text-xs font-semibold text-emerald-700 truncate">{image.name}</p>
                    <span className="text-[11px] text-slate-500 underline block">
                      Haz clic para cambiar de imagen
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-2">
                    <UploadCloud className="w-8 h-8 text-[#003057] mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      Sube tu mapa (PNG, JPG, WebP)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Se evaluará jerarquía visual, grillas, norte, escala gráfica, membrete y simbología.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Descripción Metodológica y Datos:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe: Capas utilizadas, fuentes de datos (IGAC, SIAC, Sentinel), geoprocesamientos realizados (Buffer, Clip, Intersect, Raster Calculator) y dudas puntuales."
                className="w-full text-xs rounded-lg border border-slate-300 p-3 text-slate-800 focus:ring-2 focus:ring-[#003057] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || (!description.trim() && !image)}
              className="w-full py-2.5 rounded-xl bg-[#003057] hover:bg-[#C8102E] text-white font-bold text-xs tracking-wide transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluando entregable con Tutor-SIG...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#F3B229]" />
                  <span>Emitir Evaluación Pedagógica (5 Puntos)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#C8102E]" />
                <h3 className="text-xs font-bold text-[#003057] uppercase tracking-wider">
                  Informe de Retroalimentación y Rúbrica
                </h3>
              </div>

              {evaluation && (
                <button
                  onClick={copyEvaluation}
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
                      <span>Copiar Informe</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center animate-pulse border border-[#C8102E]/20">
                  <FileCheck2 className="w-7 h-7 text-[#C8102E]" />
                </div>
                <div className="max-w-md space-y-2">
                  <h4 className="text-sm font-bold text-[#003057]">
                    Analizando rigor geodésico y cartográfico...
                  </h4>
                  <p className="text-xs text-slate-500">
                    Tutor-SIG está revisando el cumplimiento de los 5 criterios: Fortalezas, Errores Conceptuales, Errores Cartográficos, Aspectos por Mejorar y Estimación de Calificación.
                  </p>
                </div>
              </div>
            ) : evaluation ? (
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
                  {evaluation}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
                <FileCheck2 className="w-10 h-10 text-slate-300" />
                <h4 className="text-sm font-bold text-slate-700">
                  No hay evaluación generada aún
                </h4>
                <p className="text-xs text-slate-400 max-w-md">
                  Ingresa los datos de tu entregable o sube una imagen de tu mapa a la izquierda y presiona <strong>"Emitir Evaluación Pedagógica"</strong> para recibir la retroalimentación formativa.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
