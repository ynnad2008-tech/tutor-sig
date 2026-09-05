export type CurricularUnit =
  | "Módulo 1: Conceptos Generales de SIG"
  | "Módulo 2: Modelo de Datos y Bases de Datos Espaciales"
  | "Módulo 3: Análisis Espacial e IA"
  | "Módulo 4: Proyecto de Implementación de un SIG"
  | "Todos los Módulos";

export type SoftwareTool =
  | "ArcGIS Pro"
  | "QGIS"
  | "Google Earth Engine (GEE)"
  | "Google Earth Pro"
  | "ArcGIS Online"
  | "Python / GeoPandas";

export type DisciplineFocus =
  | "Arquitectura y Ordenamiento Territorial (CESMAG)"
  | "Gestión Ambiental y Cuencas Hidrológicas"
  | "Planificación Urbana y Territorial"
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
