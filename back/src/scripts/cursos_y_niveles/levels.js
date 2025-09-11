import { sampleTest } from "./test.js";

export const sampleLevels = [
  // Niveles para Desarrollo Web Full Stack
  {
    levelNumber: 1,
    title: "Introducción a HTML y CSS",
    description: "Fundamentos de la estructura web y estilos",
    bibliography: [
      {
        title: "Guía Completa de HTML5",
        description: "Documentación oficial y mejores prácticas",
        videoUrl: ["https://example.com/html5-guide.pdf"],
        createdAt: new Date()
      },
      {
        title: "CSS Tricks Handbook",
        description: "Técnicas modernas de diseño web",
        videoUrl: ["https://example.com/css-tricks.pdf"],
        createdAt: new Date()
      },
      {
        title: "HTML & CSS W3Schools",
        description: "Referencias prácticas y ejemplos",
        videoUrl: ["https://example.com/html-css-w3.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      videoUrl: "https://www.youtube.com/embed/placeholder1",
      description: "Video introductorio a HTML y CSS",
      duration: 45,
      createdAt: new Date()
    },
    test: sampleTest.flatMap(t => t.test),
    createdAt: new Date(),
    isActive: true
  },

  // Niveles para Machine Learning para Principiantes
  {
    levelNumber: 2,
    title: "Conceptos Básicos de ML",
    description: "Definiciones y aplicaciones del machine learning",
    bibliography: [
      {
        title: "Machine Learning Yearning",
        description: "Guía introductoria de Andrew Ng",
        videoUrl: ["https://example.com/ml-intro.pdf"],
        createdAt: new Date()
      },
      {
        title: "Hands-On ML",
        description: "Libro práctico con ejemplos en Python",
        videoUrl: ["https://example.com/hands-on-ml.pdf"],
        createdAt: new Date()
      },
      {
        title: "Scikit-Learn Docs",
        description: "Documentación de librería en Python",
        videoUrl: ["https://example.com/sklearn-docs.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      videoUrl: "https://www.youtube.com/embed/ml1",
      description: "Introducción al aprendizaje automático",
      duration: 40,
      createdAt: new Date()
    },
    test: sampleTest.flatMap(t => t.test),
    isActive: true
  },
  {
    levelNumber: 3,
    title: "Regresión Lineal y Logística",
    description: "Modelos estadísticos básicos",
    bibliography: [
      {
        title: "Introducción a la Regresión",
        description: "Fundamentos matemáticos",
        videoUrl: ["https://example.com/regresion.pdf"],
        createdAt: new Date()
      },
      {
        title: "Estadística Aplicada",
        description: "Conceptos de probabilidad y regresión",
        videoUrl: ["https://example.com/estadistica.pdf"],
        createdAt: new Date()
      },
      {
        title: "Python for Data Science",
        description: "Ejemplos prácticos de regresión",
        videoUrl: ["https://example.com/python-ds.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      videoUrl: "https://www.youtube.com/embed/ml2",
      description: "Aplicación práctica de regresión",
      duration: 55,
      createdAt: new Date()
    },
    test: sampleTest.flatMap(t => t.test),
    isActive: true
  },
  {
    levelNumber: 4,
    title: "Árboles de Decisión",
    description: "Primeros algoritmos supervisados",
    bibliography: [
      {
        title: "Decision Trees Explained",
        description: "Guía sencilla sobre árboles",
        videoUrl: ["https://example.com/decision-trees.pdf"],
        createdAt: new Date()
      },
      {
        title: "CART Algorithm",
        description: "Introducción a algoritmos de clasificación",
        videoUrl: ["https://example.com/cart.pdf"],
        createdAt: new Date()
      },
      {
        title: "Practical ML Trees",
        description: "Ejemplos prácticos de árboles",
        videoUrl: ["https://example.com/practical-ml.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      videoUrl: "https://www.youtube.com/embed/ml3",
      description: "Cómo funcionan los árboles de decisión",
      duration: 65,
      createdAt: new Date()
    },
    test: sampleTest.flatMap(t => t.test),
    isActive: true
  }
];
