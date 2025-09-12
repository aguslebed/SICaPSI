export const sampleTest = [
  // Niveles para Desarrollo Web Full Stack
  {
test: [
            {
                idScene: 0,
                videoUrl: "/src/Assets/videos/v1.mp4",
                description: "Una persona vestida de oficial de policia toca la puerta.",
                createdAt: new Date(),
                lastOne: false,
                bonus: 0,
                options: [
                {
                    description: "Acercarse y abrir la puerta",
                    points: 5,
                    next: 1
                },
                {
                    description: "Acercarse sin abrir la puerta",
                    points: 0,
                    next: 2
                }
                ]
      },
            {
                idScene: 1,
                videoUrl: "/src/Assets/videos/v2.mp4",
                description: "Establecen comunicacion",
                createdAt: new Date(),
                lastOne: false,
                bonus: 0,
                options: [
                {
                    description: "Pedir identificacion",
                    points: 5,
                    next: 3
                },
                {
                    description: "Dejar pasar",
                    points: -5,
                    next: 4
                }
                ]
        },
    {
    idScene: 2,
    videoUrl: "/src/Assets/videos/v6.mp4",
    description: "Escena 3: ",
    createdAt: new Date(),
    lastOne: false,
    bonus: 0,
    options: [
                {
                    description: "Informar por radio la situacion",
                    points: 5,
                    next: 5
                },
                {
                    description: "Pedirle que se retire",
                    points: -5,
                    next: 6
                }
                ]
        },
    {
    idScene: 3,
    videoUrl: "/src/Assets/videos/v3.mp4",
    description: "Notas que la identificacion es falsa.",
    createdAt: new Date(),
    lastOne: false,
    bonus: 0,
    options: [
                {
                    description: "Dejar entrar igualmente",
                    points: 0,
                    next: 7
                },
                {
                    description: "Denegar acceso",
                    points: 10,
                    next: 8
                }
                ]
      },
            {
                idScene: 4,
                videoUrl: "/src/Assets/videos/v7.mp4",
                description: "Escena 5: Pregunta sobre DOM",
                createdAt: new Date(),
                lastOne: false,
                bonus: 0,
                options: [
                {
                    description: "Anotar ingreso",
                    points: 5,
                    next: 9
                },
                {
                    description: "No anotar y volver al puesto",
                    points: -5,
                    next: 10
                }
                ]
      },
            {
                idScene: 5,
                videoUrl: "/src/Assets/videos/v10.mp4",
                description: "Informan que nadie espera a un oficial de policia",
                createdAt: new Date(),
                lastOne: false,
                bonus: 0,
                options: [
                {
                    description: "Denegar acceso",
                    points: 5,
                    next: 11
                },
                {
                    description: "Permitir acceso igualmente",
                    points: 0,
                    next: 12
                }
                ]
      },
            {
                idScene: 6,
                videoUrl: "/src/Assets/videos/v13.mp4",
                description: "La persona se pone erratica e insiste en su ingreso",
                createdAt: new Date(),
                lastOne: false,
                bonus: 0,
                options: [
                {
                    description: "Llamar a la policia",
                    points: 5,
                    next: 13
                },
                {
                    description: "Ignorarlo",
                    points: -10,
                    next: 14
                }
                ]
      },
            {
                idScene: 7,
                videoUrl: "/src/Assets/videos/v4.mp4",
                description: "Final XXX",
                createdAt: new Date(),
                lastOne: true,
                bonus: 10,
                options: [
                {
                    description: "Final",
                    points: 0,
                    next: 0
                },
                {
                    description: "Final",
                    points: 0,
                    next: 0
                }
                ]
      },
            {
                idScene: 8,
                videoUrl: "/src/Assets/videos/v5.mp4",
                description: "Final XXX",
                createdAt: new Date(),
                lastOne: true,
                bonus: 0,
                options: [
                {
                    description: "Final",
                    points: 0,
                    next: 0
                },
                {
                    description: "Final",
                    points: 0,
                    next: 0
                }
                ]
      },
            {
                idScene: 9,
                videoUrl: "/src/Assets/videos/v8.mp4",
                description: "Final XXX",
                createdAt: new Date(),
                lastOne: true,
                bonus: 5,
                options: [
                {
                    description: "Final",
                    points: 0,
                    next: 0
                },
                {
                    description: "Final",
                    points: 0,
                    next: 0
                }
                ]
      },
            {
                idScene: 10,
                videoUrl: "/src/Assets/videos/v9.mp4",
                description: "Final XXX",
                createdAt: new Date(),
                lastOne: true,
                bonus: -5,
                options: [
                {
                    description: "Final",
                    points: 0,
                    next: 0
                },
                {
                    description: "Final",
                    points: 0,
                    next: 0
                }
                ]
      },
            {
                idScene: 11,
                videoUrl: "/src/Assets/videos/v11.mp4",
                description: "Final XXX",
                createdAt: new Date(),
                lastOne: true,
                bonus: 5,
                options: [
                {
                    description: "Final",
                    points: 0,
                    next: 0
                },
                {
                    description: "Final",
                    points: 0,
                    next: 0
                }
                ]
      },
            {
                idScene: 12,
                videoUrl: "/src/Assets/videos/v12.mp4",
                description: "Final XXX",
                createdAt: new Date(),
                lastOne: true,
                bonus: 0,
                options: [
                {
                    description: "Final",
                    points: 0,
                    next: 0
                },
                {
                    description: "Final",
                    points: 0,
                    next: 0
                }
                ]
      },
            {
                idScene: 13,
                videoUrl: "/src/Assets/videos/v14.mp4",
                description: "Final XXX",
                createdAt: new Date(),
                lastOne: true,
                bonus: 8,
                options: [
                {
                    description: "Final",
                    points: 0,
                    next: 0
                },
                {
                    description: "Final",
                    points: 0,
                    next: 0
                }
                ]
      },
            {
                idScene: 14,
                videoUrl: "/src/Assets/videos/v15.mp4",
                description: "Final XXX",
                createdAt: new Date(),
                lastOne: true,
                bonus: 10,
                options: [
                {
                    description: "Final",
                    points: 0,
                    next: 0
                },
                {
                    description: "Final",
                    points: 0,
                    next: 0
                }
                ]
      },
    ],
    isActive: true
  }
];
