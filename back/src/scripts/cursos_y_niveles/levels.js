import { sampleTest } from "./test.js";

export const sampleLevels = [
  // Nivel 1: Patrullaje y control de accesos
  {
    levelNumber: 1,
    title: "Patrullaje y Control de Accesos",
    description: "Buenas prácticas de patrullaje, rutas, puntos críticos y control de accesos en instalaciones residenciales y corporativas.",
    bibliography: [
      {
        title: "Manual de Patrullaje",
        description: "Procedimientos estándar para patrullaje efectivo",
        url: ["https://example.com/manual-patrullaje.pdf"],
        createdAt: new Date()
      },
      {
        title: "Control de Accesos 101",
        description: "Guía práctica sobre identificaciones, registros y verificaciones",
        url: ["https://example.com/control-accesos.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      title: "Patrullaje y Control de Accesos (Training)",
      url: "https://www.youtube.com/embed/security-patrol-example",
      description: "Video demostrativo sobre rutinas de patrullaje y gestión de accesos.",
      duration: 40,
      createdAt: new Date()
    },
    test: sampleTest,
    createdAt: new Date(),
    isActive: true
  },

  // Nivel 2: Reportes e incidencia
  {
    levelNumber: 2,
    title: "Detección y Reporte de Incidentes",
    description: "Cómo identificar incidentes, recopilar evidencia y redactar partes y reportes claros y completos.",
    bibliography: [
      {
        title: "Guía de Redacción de Informes",
        description: "Plantillas y ejemplos de partes de incidente",
        url: ["https://example.com/reportes-guia.pdf"],
        createdAt: new Date()
      },
      {
        title: "Toma de Evidencia Básica",
        description: "Buenas prácticas para fotografiar y documentar una escena",
        url: ["https://example.com/evidencia.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      title: "Detección y Reporte de Incidentes (Training)",
      url: "https://www.youtube.com/embed/security-reporting-example",
      description: "Tutorial sobre cómo detectar, documentar y reportar incidentes correctamente.",
      duration: 35,
      createdAt: new Date()
    },
    test: sampleTest,
    isActive: true
  },

  // Nivel 3: Primeros auxilios y respuesta a emergencias
  {
    levelNumber: 3,
    title: "Primeros Auxilios y Respuesta a Emergencias",
    description: "Procedimientos básicos de primeros auxilios, RCP, control de hemorragias y coordinación con servicios de emergencia.",
    bibliography: [
      {
        title: "RCP y Primeros Auxilios",
        description: "Guía práctica sobre RCP y manejo de heridas",
        url: ["https://example.com/rcp-guia.pdf"],
        createdAt: new Date()
      },
      {
        title: "Coordinación con Emergencias",
        description: "Protocolos para notificar y asistir a bomberos/ambulancias",
        url: ["https://example.com/emergencias.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      title: "Primeros Auxilios y Respuesta a Emergencias (Training)",
      url: "https://www.youtube.com/embed/security-first-aid-example",
      description: "Demostraciones prácticas de RCP y atención inicial a víctimas.",
      duration: 60,
      createdAt: new Date()
    },
    test: sampleTest,
    isActive: true
  },

  // Nivel 4: Control de garitas y gestión de visitas
  {
    levelNumber: 4,
    title: "Control de Garitas y Gestión de Visitas",
    description: "Operativa de garitas: registro de visitas, verificación de identidades, y comunicación con central.",
    bibliography: [
      {
        title: "Procedimientos de Garita",
        description: "Protocolos para el puesto de control",
        url: ["https://example.com/garita.pdf"],
        createdAt: new Date()
      },
      {
        title: "Sistemas de Control de Acceso",
        description: "Uso de software y hardware para control de accesos",
        url: ["https://example.com/sistemas-acceso.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      title: "Control de Garitas y Gestión de Visitas (Training)",
      url: "https://www.youtube.com/embed/security-guardhouse-example",
      description: "Videos y prácticas sobre gestión de garitas y sistemas de acceso.",
      duration: 45,
      createdAt: new Date()
    },
    test: sampleTest,
    isActive: true
  }
];