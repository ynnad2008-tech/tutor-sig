/**
 * Identidad institucional y plantillas de prompts de Tutor-SIG.
 *
 * La identidad es configurable por variables de entorno (TUTOR_SIG_NAME,
 * TUTOR_SIG_INSTITUTION, TUTOR_SIG_AUTHOR) para preparar despliegues
 * multi-institución (p. ej. Tutor-SIG CESMAG) sin modificar código.
 */
import type { TutorIdentity } from "./ai/types";

export function readTutorIdentity(env: NodeJS.ProcessEnv): TutorIdentity {
  return {
    tutorName: env.TUTOR_SIG_NAME?.trim() || "Tutor-SIG",
    institution:
      env.TUTOR_SIG_INSTITUTION?.trim() || "Universidad Mariana",
    author:
      env.TUTOR_SIG_AUTHOR?.trim() || "Geógr. Dany Benavides Bolaños",
  };
}

export function buildSystemInstruction(identity: TutorIdentity): string {
  return `Eres ${identity.tutorName}, el copiloto de Inteligencia Artificial y asistente pedagógico especializado en Sistemas de Información Geográfica (SIG), Teledetección, Cartografía e IA Geoespacial de la ${identity.institution}.
Autor intelectual: ${identity.author}.
Institución: ${identity.institution} (Facultad de Ingeniería / Maestría en Gestión Ambiental / Ingeniería Ambiental).

ROL Y PERSONALIDAD:
- Eres un tutor experto, claro, didáctico y motivador. Tu objetivo es guiar a los estudiantes paso a paso para que comprendan los conceptos, dominen las herramientas (ArcGIS Pro, QGIS, Google Earth Engine, Google Earth Pro, Python / GeoPandas) y apliquen correctamente la metodología geoespacial en proyectos ambientales.
- Responde de forma directa, estructurada y conversacional en español. No añadas encabezados artificiales ni códigos rígidos a menos que sean pertinentes a la duda planteada.

PRINCIPIO DE INTEGRIDAD ACADÉMICA:
- No entregues mapas terminados ni tareas completamente resueltas llave en mano.
- Explica los pasos lógicos, la secuencia de herramientas, los parámetros recomendados, las fórmulas y cómo interpretar los resultados para que el estudiante construya su propio aprendizaje y desarrolle autonomía técnica.

RIGOR TÉCNICO Y NORMATIVA COLOMBIANA:
- Sistema de referencia oficial: Recuerda siempre el marco oficial en Colombia: MAGNA-SIRGAS Origen Nacional (EPSG: 9377 / CTM12, Resolución 471 de 2020 del IGAC). Advierte cuando se usen coordenadas geográficas angulares en análisis de distancia o buffer métrico.
- Teledetección: Explica con precisión las bandas y resoluciones de sensores (Sentinel-2, Landsat 8/9, DEM ALOS PALSAR / SRTM), fórmulas de índices espectrales (NDVI, NDWI, NBR, SAVI) y firmas espectrales.
- Geoprocesamiento y Topología: Explica la diferencia entre herramientas de superposición (Clip vs Intersect), proximidad (Buffer, Cost Distance) y reglas topológicas para evitar solapamientos o vacíos.

REVISIÓN MULTIMODAL DE MAPAS Y CAPTURAS:
- Si el usuario adjunta una imagen o captura de pantalla de un mapa o software:
  1. Identifica qué elementos están presentes (escala gráfica, grilla de coordenadas, norte, leyenda, rotulado, jerarquía visual).
  2. Señala fortalezas y errores puntuales (técnicos, geodésicos o estéticos).
  3. Brinda sugerencias prácticas para mejorar la composición cartográfica o resolver el error en el software.

FUENTES OFICIALES:
- Recomienda datos abiertos y geoportales oficiales (Geoportal IGAC, SIAC, IDEAM, Copernicus Open Access Hub, USGS EarthExplorer).`;
}

export interface EvaluatePromptInput {
  title?: string;
  description?: string;
  software?: string;
  scale?: string;
  datum?: string;
}

export function buildEvaluatePrompt(input: EvaluatePromptInput): string {
  return `Por favor realiza una evaluación y retroalimentación pedagógica exhaustiva de este avance/entregable bajo el MODO RETROALIMENTADOR de Tutor-SIG.
Título/Tema: ${input.title || "Entregable cartográfico / SIG"}
Descripción del estudiante: ${input.description || "Sin descripción adicional"}
Software utilizado: ${input.software || "ArcGIS Pro / QGIS"}
Sistema de Referencia Espacial: ${input.datum || "No especificado (Revisar si aplica MAGNA-SIRGAS Origen Nacional EPSG 9377)"}
Escala de trabajo: ${input.scale || "No especificada"}

Estructura tu evaluación OBLIGATORIAMENTE en los siguientes 5 puntos:
1. **Fortalezas**: Aspectos técnicos, metodológicos y analíticos bien ejecutados.
2. **Errores Conceptuales**: Conceptos geodésicos, de escala, datos o teledetección mal aplicados.
3. **Errores Cartográficos**: Fallas en jerarquía visual, rotulado, simbología, grillas, escala gráfica, norte o leyenda.
4. **Aspectos por Mejorar**: Recomendaciones puntuales para optimizar el producto o modelo de datos.
5. **Calificación Sugerida**: Estimación según criterios de rúbrica formativa (Básico, Intermedio, Alto).`;
}

export interface TeacherToolPromptInput {
  toolType: string;
  topic: string;
  unit?: string;
  software?: string;
  studyArea?: string;
  targetAudience?: string;
}

export function buildTeacherToolPrompt(input: TeacherToolPromptInput): string {
  const { toolType, topic } = input;
  const unit = input.unit || "Gestión Ambiental UNIMAR";
  const software = input.software || "ArcGIS Pro";
  const studyArea = input.studyArea || "Departamento de Nariño / Cuenca del Río Pasto / Colombia";
  const targetAudience =
    input.targetAudience || "Maestría en Gestión Ambiental / Ingeniería Ambiental";

  if (toolType === "lab_guide") {
    return `Actuando en MODO DOCENTE de Tutor-SIG, genera una Guía de Laboratorio Práctico estructurada y pedagógica para:
Tema: ${topic}
Unidad Curricular: ${unit}
Software: ${software}
Zona de Estudio Contextualizada: ${studyArea}
Público Objetivo: ${targetAudience}

Estructura de la guía requerida:
1. **Identificación de la Práctica** (Título, Unidad, Software, Duración estimada).
2. **Resultados de Aprendizaje / Competencias**.
3. **Fundamento Teórico y Geodésico** (SRC, Datum MAGNA-SIRGAS Origen Nacional EPSG: 9377).
4. **Insumos y Fuentes de Datos** (Capas requeridas, fuentes oficiales IGAC/SIAC/Copernicus).
5. **Procedimiento Paso a Paso** (Instrucciones metodológicas claras para el software).
6. **Preguntas de Análisis y Reflexión Crítica**.
7. **Criterios de Entrega y Evaluación**.
8. **Referencias Bibliográficas (APA 7.ª edición)**.`;
  }

  if (toolType === "rubric") {
    return `Actuando en MODO DOCENTE de Tutor-SIG, elabora una Rúbrica Analítica de Evaluación para:
Tema: ${topic}
Unidad Curricular: ${unit}
Competencia/RAC a evaluar: ${studyArea}

Estructura de la rúbrica requerida en formato tabla Markdown:
- Criterios: (1) Rigor Geodésico y Topológico, (2) Metodología de Geoprocesamiento, (3) Calidad y Composición Cartográfica, (4) Análisis Ambiental y Conclusiones.
- Niveles de Desempeño: Superior (4.6 - 5.0), Alto (4.0 - 4.5), Básico (3.0 - 3.9), Bajo (0.0 - 2.9) con descriptores cualitativos claros y ponderación porcentual.`;
  }

  return `Actuando en MODO DOCENTE de Tutor-SIG, formula un Estudio de Caso Aplicado y Real para:
Tema: ${topic}
Zona de Estudio: ${studyArea || "Nariño / Cuenca del Río Guáitara / Laguna de la Cocha"}
Software sugerido: ${software || "ArcGIS Pro / QGIS / GEE"}

Incluye: Planteamiento del problema ambiental real, objetivos espaciales, modelo conceptual de capas, flujo metodológico de geoprocesamiento propuesto y productos esperados.`;
}

export interface GeoprocessFlowPromptInput {
  problemDescription: string;
  software?: string;
}

export function buildGeoprocessFlowPrompt(input: GeoprocessFlowPromptInput): string {
  return `Como Tutor-SIG, diseña un flujo metodológico lógico de Geoprocesamiento / ModelBuilder para resolver el siguiente problema ambiental:
"${input.problemDescription}"
Software: ${input.software || "ArcGIS Pro / QGIS"}

Estructura:
1. **Unidad Curricular**: (Unidad V: Geoprocesamiento).
2. **Sistema de Coordenadas Obligatorio**: (MAGNA-SIRGAS Origen Nacional EPSG: 9377).
3. **Capas de Entrada (Insumos)** con atributos y tipo geométrico/ráster.
4. **Secuencia Lógica de Herramientas de Geoprocesamiento** (Paso a paso con herramienta, parámetros clave y capa intermedia).
5. **Esquema de Flujo Conceptual (Diagrama de pasos en texto)**.
6. **Errores Frecuentes y Validaciones Topológicas**.
7. **Producto Final Esperado**.`;
}
