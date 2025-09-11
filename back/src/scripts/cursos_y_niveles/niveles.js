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
        downloadLinks: ["https://example.com/html5-guide.pdf"],
        createdAt: new Date()
      },
      {
        title: "CSS Tricks Handbook",
        description: "Técnicas modernas de diseño web",
        downloadLinks: ["https://example.com/css-tricks.pdf"],
        createdAt: new Date()
      },
      {
        title: "HTML & CSS W3Schools",
        description: "Referencias prácticas y ejemplos",
        downloadLinks: ["https://example.com/html-css-w3.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      videoUrl: "https://www.youtube.com/embed/placeholder1",
      description: "Video introductorio a HTML y CSS",
      duration: 45,
      createdAt: new Date()
    },
    evaluation: {
      videoUrl: "https://www.youtube.com/embed/evaluation1",
      description: "Evaluación de conceptos básicos",
      passingScore: 70,
      maxAttempts: 3,
      createdAt: new Date()
    },
    isActive: true
  },
  {
    levelNumber: 2,
    title: "JavaScript Básico",
    description: "Programación fundamental con JavaScript",
    bibliography: [
      {
        title: "JavaScript Elocuente",
        description: "Libro esencial para aprender JavaScript",
        downloadLinks: ["https://example.com/javascript-book.pdf"],
        createdAt: new Date()
      },
      {
        title: "MDN JavaScript Docs",
        description: "Referencia oficial de Mozilla",
        downloadLinks: ["https://example.com/mdn-js.pdf"],
        createdAt: new Date()
      },
      {
        title: "You Don’t Know JS",
        description: "Serie avanzada sobre JS",
        downloadLinks: ["https://example.com/ydkjs.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      videoUrl: "https://www.youtube.com/embed/placeholder2",
      description: "Fundamentos de programación con JS",
      duration: 60,
      createdAt: new Date()
    },
    evaluation: {
      videoUrl: "https://www.youtube.com/embed/evaluation2",
      description: "Evaluación de JavaScript básico",
      passingScore: 75,
      maxAttempts: 3,
      createdAt: new Date()
    },
    isActive: true
  },
  {
    levelNumber: 3,
    title: "Back-End con Node.js",
    description: "Primeros pasos con servidores y APIs",
    bibliography: [
      {
        title: "Node.js Documentation",
        description: "Documentación oficial de Node.js",
        downloadLinks: ["https://example.com/nodejs-docs.pdf"],
        createdAt: new Date()
      },
      {
        title: "Express.js Guide",
        description: "Framework para desarrollo de servidores",
        downloadLinks: ["https://example.com/express-guide.pdf"],
        createdAt: new Date()
      },
      {
        title: "RESTful API Design",
        description: "Buenas prácticas en diseño de APIs",
        downloadLinks: ["https://example.com/rest-api.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      videoUrl: "https://www.youtube.com/embed/placeholder3",
      description: "Introducción a servidores con Node.js",
      duration: 70,
      createdAt: new Date()
    },
    evaluation: {
      videoUrl: "https://www.youtube.com/embed/evaluation3",
      description: "Evaluación de fundamentos en Node.js",
      passingScore: 80,
      maxAttempts: 3,
      createdAt: new Date()
    },
    isActive: true
  },

  // Niveles para Machine Learning para Principiantes
  {
    levelNumber: 1,
    title: "Conceptos Básicos de ML",
    description: "Definiciones y aplicaciones del machine learning",
    bibliography: [
      {
        title: "Machine Learning Yearning",
        description: "Guía introductoria de Andrew Ng",
        downloadLinks: ["https://example.com/ml-intro.pdf"],
        createdAt: new Date()
      },
      {
        title: "Hands-On ML",
        description: "Libro práctico con ejemplos en Python",
        downloadLinks: ["https://example.com/hands-on-ml.pdf"],
        createdAt: new Date()
      },
      {
        title: "Scikit-Learn Docs",
        description: "Documentación de librería en Python",
        downloadLinks: ["https://example.com/sklearn-docs.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      videoUrl: "https://www.youtube.com/embed/ml1",
      description: "Introducción al aprendizaje automático",
      duration: 40,
      createdAt: new Date()
    },
    evaluation: {
      videoUrl: "https://www.youtube.com/embed/mleval1",
      description: "Evaluación de conceptos básicos de ML",
      passingScore: 70,
      maxAttempts: 3,
      createdAt: new Date()
    },
    isActive: true
  },
  {
    levelNumber: 2,
    title: "Regresión Lineal y Logística",
    description: "Modelos estadísticos básicos",
    bibliography: [
      {
        title: "Introducción a la Regresión",
        description: "Fundamentos matemáticos",
        downloadLinks: ["https://example.com/regresion.pdf"],
        createdAt: new Date()
      },
      {
        title: "Estadística Aplicada",
        description: "Conceptos de probabilidad y regresión",
        downloadLinks: ["https://example.com/estadistica.pdf"],
        createdAt: new Date()
      },
      {
        title: "Python for Data Science",
        description: "Ejemplos prácticos de regresión",
        downloadLinks: ["https://example.com/python-ds.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      videoUrl: "https://www.youtube.com/embed/ml2",
      description: "Aplicación práctica de regresión",
      duration: 55,
      createdAt: new Date()
    },
    evaluation: {
      videoUrl: "https://www.youtube.com/embed/mleval2",
      description: "Evaluación de regresión lineal/logística",
      passingScore: 75,
      maxAttempts: 3,
      createdAt: new Date()
    },
    isActive: true
  },
  {
    levelNumber: 3,
    title: "Árboles de Decisión",
    description: "Primeros algoritmos supervisados",
    bibliography: [
      {
        title: "Decision Trees Explained",
        description: "Guía sencilla sobre árboles",
        downloadLinks: ["https://example.com/decision-trees.pdf"],
        createdAt: new Date()
      },
      {
        title: "CART Algorithm",
        description: "Introducción a algoritmos de clasificación",
        downloadLinks: ["https://example.com/cart.pdf"],
        createdAt: new Date()
      },
      {
        title: "Practical ML Trees",
        description: "Ejemplos prácticos de árboles",
        downloadLinks: ["https://example.com/practical-ml.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      videoUrl: "https://www.youtube.com/embed/ml3",
      description: "Cómo funcionan los árboles de decisión",
      duration: 65,
      createdAt: new Date()
    },
    evaluation: {
      videoUrl: "https://www.youtube.com/embed/mleval3",
      description: "Evaluación sobre árboles de decisión",
      passingScore: 80,
      maxAttempts: 3,
      createdAt: new Date()
    },
    isActive: true
  }

  // 👉 Y así seguiríamos con los 8 cursos restantes (Fundamentos de Programación, SQL, Apps móviles, Ciberseguridad, Python, UI/UX, IA Avanzada y AWS),
  // cada uno con 3 niveles y cada nivel con al menos 3 bibliografías.
];
