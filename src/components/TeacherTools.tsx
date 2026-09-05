import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  GraduationCap,
  FileText,
  Table,
  Map,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Layers,
} from "lucide-react";
import { CASE_STUDIES, CURRICULAR_UNITS } from "../data/sigData";
import { CurricularUnit, SoftwareTool } from "../types";
import { generateTeacherTool } from "../services/aiService";

interface TeacherToolsProps {
  selectedUnit: CurricularUnit;
  selectedSoftware: SoftwareTool;
}

export const TeacherTools: React.FC<TeacherToolsProps> = ({
  selectedUnit,
  selectedSoftware,
}) => {
  const [toolType, setToolType] = useState<"lab_guide" | "rubric" | "case_study">("lab_guide");
  const [topic, setTopic] = useState("Cálculo de Índices Espectrales (NDVI/NDWI) y Clasificación de Coberturas");
  const [unit, setUnit] = useState<string>(selectedUnit);
  const [software, setSoftware] = useState<string>(selectedSoftware);
  const [studyArea, setStudyArea] = useState("Cuenca del Río Pasto / Departamento de Nariño");
  const [targetAudience, setTargetAudience] = useState("Diplomado en SIG + IA (Universidad CESMAG)");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (presetTopic?: string) => {
    const topicToUse = presetTopic || topic;
    if (!topicToUse.trim()) {
      alert("Por favor ingresa un tema de estudio.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const generated = await generateTeacherTool({
        toolType,
        topic: topicToUse,
        unit,
        software,
        studyArea,
        targetAudience,
      });

      setResult(generated);
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
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
              <GraduationCap className="w-6 h-6 text-[#F3B229]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#003057] flex items-center gap-2">
                Espacio Docente & Generador Curricular
                <span className="text-[10px] bg-[#003057] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  Modo Docente
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Herramienta para el profesorado: diseño de guías de laboratorio paso a paso, rúbricas analíticas con RAC y formulación de estudios de caso ambientales.
              </p>
            </div>
          </div>

          {/* Academic Integrity Note for Teachers */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2 text-xs text-amber-900 font-bold flex items-center gap-2 self-start md:self-auto max-w-sm">
            <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span className="font-medium text-[11px]">
              Material didáctico orientado a propiciar la construcción autónoma del aprendizaje.
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tools Switcher */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1.5 overflow-x-auto">
        <button
          onClick={() => setToolType("lab_guide")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            toolType === "lab_guide"
              ? "bg-[#003057] text-white shadow-sm"
              : "text-slate-700 hover:bg-slate-200"
          }`}
        >
          <FileText className="w-4 h-4 text-[#F3B229]" />
          <span>Guía de Laboratorio Práctico</span>
        </button>

        <button
          onClick={() => setToolType("rubric")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            toolType === "rubric"
              ? "bg-[#003057] text-white shadow-sm"
              : "text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Table className="w-4 h-4 text-[#F3B229]" />
          <span>Rúbrica Analítica de Evaluación</span>
        </button>

        <button
          onClick={() => setToolType("case_study")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            toolType === "case_study"
              ? "bg-[#003057] text-white shadow-sm"
              : "text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Map className="w-4 h-4 text-[#F3B229]" />
          <span>Banco de Estudios de Caso Regionales</span>
        </button>
      </div>

      {/* Regional Cases Quick Selector (if in case study mode or guide) */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        <span className="text-xs font-bold text-[#003057] uppercase tracking-wider block">
          Estudios de Caso Contextualizados en Nariño / Colombia:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CASE_STUDIES.map((c) => (
            <div
              key={c.id}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-[#C8102E] transition flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-[#C8102E] bg-rose-50 px-2 py-0.5 rounded mb-1.5 inline-block">
                  {c.location}
                </span>
                <h4 className="text-xs font-bold text-slate-800 mb-1">{c.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">{c.problem}</p>
              </div>

              <button
                onClick={() => {
                  setTopic(c.title);
                  setStudyArea(c.location);
                  handleGenerate(c.title);
                }}
                className="text-[11px] font-bold text-[#003057] hover:text-[#C8102E] mt-3 flex items-center gap-1 transition self-start"
              >
                Cargar en el generador <ArrowRight className="w-3 h-3 text-[#C8102E]" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Generator Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#003057] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C8102E]" />
              Parámetros de la Actividad Académica
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tema / Práctica de Aprendizaje:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej. Delimitación de Cuencas con DEM ALOS PALSAR y ModelBuilder"
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-[#003057] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Unidad Temática:
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-none font-medium"
                >
                  {CURRICULAR_UNITS.map((u) => (
                    <option key={u.id} value={u.title}>{u.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Software:
                </label>
                <select
                  value={software}
                  onChange={(e) => setSoftware(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-none font-medium"
                >
                  <option value="ArcGIS Pro">ArcGIS Pro</option>
                  <option value="QGIS">QGIS</option>
                  <option value="Google Earth Engine (GEE)">Google Earth Engine (GEE)</option>
                  <option value="Google Earth Pro">Google Earth Pro</option>
                  <option value="Python / GeoPandas">Python / GeoPandas</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Zona de Estudio / Territorio:
              </label>
              <input
                type="text"
                value={studyArea}
                onChange={(e) => setStudyArea(e.target.value)}
                placeholder="Ej. Cuenca del Río Pasto, Laguna de la Cocha, Volcán Galeras"
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Público Objetivo / Nivel:
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Ej. Maestría en Gestión Ambiental / Ingeniería Ambiental UNIMAR"
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:outline-none font-medium"
              />
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !topic.trim()}
              className="w-full py-2.5 rounded-xl bg-[#003057] hover:bg-[#C8102E] text-white font-bold text-xs tracking-wide transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Elaborando material docente con Tutor-SIG...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#F3B229]" />
                  <span>
                    Generar {toolType === "lab_guide" ? "Guía de Laboratorio" : toolType === "rubric" ? "Rúbrica Analítica" : "Estudio de Caso"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C8102E]" />
                <h3 className="text-xs font-bold text-[#003057] uppercase tracking-wider">
                  Documento Académico Generado
                </h3>
              </div>

              {result && (
                <button
                  onClick={copyResult}
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
                      <span>Copiar Documento</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center animate-pulse border border-[#C8102E]/20">
                  <GraduationCap className="w-7 h-7 text-[#C8102E]" />
                </div>
                <div className="max-w-md space-y-2">
                  <h4 className="text-sm font-bold text-[#003057]">
                    Estructurando instrumento pedagógico...
                  </h4>
                  <p className="text-xs text-slate-500">
                    Alineando resultados de aprendizaje (RAC), rigor geodésico en MAGNA-SIRGAS 9377 y referencias en normas APA 7.ª edición.
                  </p>
                </div>
              </div>
            ) : result ? (
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
                  {result}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
                <GraduationCap className="w-10 h-10 text-slate-300" />
                <h4 className="text-sm font-bold text-slate-700">
                  Espacio listo para crear material docente
                </h4>
                <p className="text-xs text-slate-400 max-w-md">
                  Configura los parámetros a la izquierda o selecciona uno de los casos regionales para generar guías de laboratorio o rúbricas analíticas listas para usar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
