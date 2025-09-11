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
    evaluation: [
      {
        idScene: 0,
        videoUrl: ["https://example.com/eval1-scene1.pdf"],
        description: "Escena 1: Pregunta sobre HTML básico",
        createdAt: new Date(),
        opcion: [
          {
            description: "Respuesta A: Etiqueta <div>",
            points: 10,
            next: 1
          },
          {
            description: "Respuesta B: Etiqueta <span>",
            points: 5,
            next: 1
          }
        ]
      },
      {
        idScene: 1,
        videoUrl: ["https://example.com/eval1-scene2.pdf"],
        description: "Escena 2: Pregunta sobre CSS",
        createdAt: new Date(),
        opcion: [
          {
            description: "Respuesta A: color: red;",
            points: 10,
            next: null
          },
          {
            description: "Respuesta B: background: blue;",
            points: 5,
            next: null
          }
        ]
      }
    ],
    evaluation: [
      {
        idScene: 0,
        videoUrl: ["https://example.com/eval2-scene1.pdf"],
        description: "Escena 1: Pregunta sobre variables JS",
        createdAt: new Date(),
        opcion: [
          {
            description: "Respuesta A: let x = 5;",
            points: 10,
            next: 1
          },
          {
            description: "Respuesta B: var x = 5;",
            points: 5,
            next: 1
          }
        ]
      },
      {
        idScene: 1,
        videoUrl: ["https://example.com/eval2-scene2.pdf"],
        description: "Escena 2: Pregunta sobre funciones JS",
        createdAt: new Date(),
        opcion: [
          {
            description: "Respuesta A: function test() {}",
            points: 10,
            next: null
          },
          {
            description: "Respuesta B: const test = () => {}",
            points: 5,
            next: null
          }
        ]
      }
    ],
        createdAt: new Date(),
        opcion: [
          {
            description: "Respuesta A: let x = 5;",
            evaluation: [
              {
                idScene: 1,
                videoUrl: ["https://example.com/eval3-scene1.pdf"],
                description: "Escena 1: Pregunta sobre Node.js",
                createdAt: new Date(),
                opcion: [
                  {
                    description: "Respuesta A: require('fs')",
                    points: 10,
                    next: 2
                  },
                  {
                    description: "Respuesta B: require('http')",
                    points: 5,
                    next: 2
                  }
                ]
              },
              {
                idScene: 2,
                videoUrl: ["https://example.com/eval3-scene2.pdf"],
                description: "Escena 2: Pregunta sobre Express.js",
                createdAt: new Date(),
                opcion: [
                  {
                    description: "Respuesta A: app.get('/ruta')",
                    points: 10,
                    next: null
                  },
                  {
                    description: "Respuesta B: app.post('/ruta')",
                    points: 5,
                    next: null
                  }
                ]
              }
            ],
        title: "Node.js Documentation",
        description: "Documentación oficial de Node.js",
        videoUrl: ["https://example.com/nodejs-docs.pdf"],
        createdAt: new Date()
      },
      {
        title: "Express.js Guide",
        description: "Framework para desarrollo de servidores",
        videoUrl: ["https://example.com/express-guide.pdf"],
        createdAt: new Date()
      },
      {
        title: "RESTful API Design",
        description: "Buenas prácticas en diseño de APIs",
        videoUrl: ["https://example.com/rest-api.pdf"],
        createdAt: new Date()
      }
    ],
    training: {
      videoUrl: "https://www.youtube.com/embed/placeholder3",
      description: "Introducción a servidores con Node.js",
      duration: 70,
      createdAt: new Date()
    },
    evaluation: [
      {
        idScene: 0,
        videoUrl: ["https://example.com/eval3-scene1.pdf"],
        description: "Escena 1: Pregunta sobre Node.js",
        createdAt: new Date(),
        opcion: [
          {
            description: "Respuesta A: require('fs')",
            points: 10,
            next: 1
          },
          {
            description: "Respuesta B: require('http')",
            points: 5,
            next: 1
          }
        ]
      },
      {
        idScene: 1,
        videoUrl: ["https://example.com/eval3-scene2.pdf"],
        description: "Escena 2: Pregunta sobre Express.js",
        createdAt: new Date(),
        opcion: [
          {
            description: "Respuesta A: app.get('/ruta')",
            points: 10,
            next: null
          },
          {
            description: "Respuesta B: app.post('/ruta')",
            points: 5,
            next: null
          }
        ]
      }
    ],
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
    evaluation: [
      {
        idScene: 0,
        videoUrl: ["https://example.com/evalml-scene1.pdf"],
        description: "Escena 1: Pregunta sobre ML básico",
        createdAt: new Date(),
        opcion: [
          {
            description: "Respuesta A: supervised learning",
            points: 10,
            next: 1
          },
          {
            description: "Respuesta B: unsupervised learning",
            points: 5,
            next: 1
          }
        ]
      },
      {
        idScene: 1,
        videoUrl: ["https://example.com/evalml-scene2.pdf"],
        description: "Escena 2: Pregunta sobre aplicaciones ML",
        createdAt: new Date(),
        opcion: [
          {
            description: "Respuesta A: clasificación",
            points: 10,
            next: null
          },
          {
            description: "Respuesta B: regresión",
            points: 5,
            next: null
          }
        ]
      }
    ],
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
    evaluation: [
      {
        idScene: 0,
        videoUrl: ["https://example.com/evalreg-scene1.pdf"],
        description: "Escena 1: Pregunta sobre regresión lineal",
        createdAt: new Date(),
        opcion: [
          {
            description: "Respuesta A: y = mx + b",
            points: 10,
            next: 1
          },
          {
            description: "Respuesta B: y = ax^2 + bx + c",
            points: 5,
            next: 1
          }
        ]
      },
      {
        idScene: 1,
        videoUrl: ["https://example.com/evalreg-scene2.pdf"],
        description: "Escena 2: Pregunta sobre regresión logística",
        createdAt: new Date(),
        opcion: [
          {
            description: "Respuesta A: función sigmoide",
            points: 10,
            next: null
          },
          {
            description: "Respuesta B: función lineal",
            points: 5,
            next: null
          }
        ]
      }
    ],
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
    evaluation: [
      {
        idScene: 0,
        videoUrl: ["https://example.com/evaltree-scene1.pdf"],
        description: "Escena 1: Pregunta sobre árboles de decisión",
        createdAt: new Date(),
        opcion: [
          {
            description: "Respuesta A: nodo raíz",
            points: 10,
            next: 1
          },
          {
            description: "Respuesta B: hoja",
            points: 5,
            next: 1
          }
        ]
      },
      {
        idScene: 1,
        videoUrl: ["https://example.com/evaltree-scene2.pdf"],
        description: "Escena 2: Pregunta sobre algoritmos CART",
        createdAt: new Date(),
        opcion: [
          {
            description: "Respuesta A: clasificación",
            points: 10,
            next: null
          },
          {
            description: "Respuesta B: regresión",
            points: 5,
            next: null
          }
        ]
      }
    ],
    isActive: true
  }

  // 👉 Y así seguiríamos con los 8 cursos restantes (Fundamentos de Programación, SQL, Apps móviles, Ciberseguridad, Python, UI/UX, IA Avanzada y AWS),
  // cada uno con 3 niveles y cada nivel con al menos 3 bibliografías.
];
