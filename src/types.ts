export type CurricularUnit =
  | "Unidad I: Fundamentos Cartográficos"
  | "Unidad II: Introducción a los SIG"
  | "Unidad III: Introducción al Manejo de ArcGIS Pro"
  | "Unidad IV: Sistemas de Navegación por Satélite (GNSS)"
  | "Unidad V: Geoprocesamiento y Teledetección"
  | "Todas las Unidades";

export type SoftwareTool =
  | "ArcGIS Pro"
  | "QGIS"
  | "Google Earth Engine (GEE)"
  | "Google Earth Pro"
  | "ArcGIS Online"
  | "Python / GeoPandas";

export type DisciplineFocus =
  | "Ingeniería / Gestión Ambiental (UNIMAR)"
  | "Gestión Integral de Cuencas Hidrológicas"
  | "Ordenamiento Territorial y Planificación Ambiental"
  | "Evaluación de Impacto y Riesgo de Desastres";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  curricularUnit?: string;
  software?: string;
  imageBase64?: string;
  imageMime?: string;
}

export interface SpectralIndex {
  id: string;
  name: string;
  acronym: string;
  category: "Vegetación" | "Agua / Humedad" | "Suelo / Geología" | "Fuego / Severidad";
  formula: string;
  sentinel2Formula: string;
  landsat8Formula: string;
  description: string;
  environmentalApplication: string;
  interpretationRanges: { range: string; meaning: string; color: string }[];
  rasterCalculatorArcGIS: string;
  geeCodeSnippet: string;
}

export interface GeodeticOrigin {
  name: string;
  epsg: number | string;
  datum: string;
  projection: string;
  centralMeridian: string;
  centralLatitude: string;
  falseEasting: string;
  falseNorthing: string;
  validity: string;
  status: "Oficial Vigente (Resolución 471/2020 IGAC)" | "Histórico / Reemplazado" | "Global";
  notes: string;
}

export interface PredefinedPrompt {
  title: string;
  unit: CurricularUnit;
  prompt: string;
  category: string;
  software: SoftwareTool;
}
