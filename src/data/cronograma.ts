/**
 * Cronograma del Diplomado en SIG — Universidad CESMAG (2026).
 * Fuente: "Cronograma DIPLOMADO SIG - Cronograma DIPLOMADO (dia) MOD 11-08-2026".
 */

export interface CronogramaTema {
  tema: string;
  horas: number;
  docente?: string;
}

export interface CronogramaModulo {
  id: string;
  numero: number;
  titulo: string;
  encargado: string;
  totalHoras: number;
  temas: CronogramaTema[];
}

export interface CronogramaDiplomadoData {
  version: string;
  periodoClases: string;
  horario: string;
  faseDifusion: string;
  totalHoras: number;
  modulos: CronogramaModulo[];
  cierre: {
    titulo: string;
    detalle: string;
    modalidad: string;
    docente: string;
    horas: number;
  };
}

export const CRONOGRAMA_DIPLOMADO: CronogramaDiplomadoData = {
  version: "MOD 11-08-2026",
  periodoClases: "18 de agosto – 7 de noviembre de 2026",
  horario: "Martes y jueves 6:30 – 9:30 PM · Sábado 9:00 AM – 12:00 PM",
  faseDifusion: "Difusión: junio – julio de 2026",
  totalHoras: 107,
  modulos: [
    {
      id: "crono-m1",
      numero: 1,
      titulo: "Conceptos Generales de Sistemas de Información Geográfica",
      encargado: "María J. Pazos",
      totalHoras: 30,
      temas: [
        { tema: "Introducción a los SIG: componentes, funciones y aplicaciones", horas: 6 },
        { tema: "Conceptos básicos en Sistemas de Información Geográfica", horas: 9 },
        { tema: "Sistemas de coordenadas y proyecciones cartográficas", horas: 3 },
        { tema: "SIG ráster y SIG vectorial. Flujo de trabajo y aplicaciones GIS", horas: 9 },
        { tema: "Acompañamiento práctico", horas: 3 },
      ],
    },
    {
      id: "crono-m2",
      numero: 2,
      titulo: "Modelo de Datos y Bases de Datos Espaciales",
      encargado: "Mabel Pérez",
      totalHoras: 30,
      temas: [
        { tema: "Modelos de datos espaciales y conceptuales en SIG", horas: 6 },
        { tema: "Creación de geodatabases", horas: 9 },
        { tema: "Conceptos topológicos y validación de datos", horas: 6 },
        { tema: "Formulación del proyecto SIG: problema, objetivos, alcance y requerimientos de datos", horas: 6 },
        { tema: "Acompañamiento práctico", horas: 3 },
      ],
    },
    {
      id: "crono-m3",
      numero: 3,
      titulo: "Análisis Espacial",
      encargado: "Dany Benavides",
      totalHoras: 27,
      temas: [
        { tema: "Herramientas de análisis vectorial: buffer, clip, dissolve, merge, intersect, union, erase", horas: 6, docente: "Dany Benavides" },
        { tema: "Análisis ráster aplicado", horas: 6, docente: "Dany Benavides" },
        { tema: "Consultas sobre datos atributivos y espaciales. Cartografía temática e indicadores espaciales", horas: 6, docente: "Dany Benavides" },
        { tema: "Analítica en IA sobre datos geoespaciales (Análisis de datos)", horas: 6, docente: "Andrés Insuasty" },
        { tema: "Acompañamiento práctico", horas: 3, docente: "Dany Benavides" },
      ],
    },
    {
      id: "crono-m4",
      numero: 4,
      titulo: "Proyecto de Implementación de un SIG",
      encargado: "Mabel Pérez y María J. Pazos",
      totalHoras: 18,
      temas: [
        { tema: "Desarrollo e implementación del proyecto SIG", horas: 6, docente: "Mabel Pérez" },
        { tema: "Publicación de proyectos SIG en plataformas (ArcGIS Online u otras)", horas: 6, docente: "María J. Pazos" },
        { tema: "Socialización y evaluación del proyecto final", horas: 6, docente: "Dany Benavides y Mabel Pérez" },
      ],
    },
  ],
  cierre: {
    titulo: "Publicación en redes y difusión empresarial",
    detalle: "Socialización del diplomado",
    modalidad: "Clase virtual",
    docente: "María J. Pazos",
    horas: 2,
  },
};
