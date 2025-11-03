export const sampleTest = {
    title: "Simulación: Control de Acceso en Garita",
    description: "Resuelve correctamente cada situación aplicando protocolo de control de acceso.",
    imageUrl: "/api/uploads/5.jpeg", 
    createdAt: new Date(),
    isActive: true,
    scenes: [
        {
            idScene: 0,
            url: "/src/Assets/videos/v1.mp4",
            description: "Una persona vestida de policía toca la puerta de ingreso.",
            createdAt: new Date(),
            lastOne: false,
            bonus: 0,
            options: [
                { description: "Acercarse y abrir la puerta", points: 5, next: 1 },
                { description: "Acercarse sin abrir la puerta", points: 0, next: 2 }
            ]
        },
        {
            idScene: 1,
            url: "/src/Assets/videos/v2.mp4",
            description: "Se establece comunicación con el visitante.",
            createdAt: new Date(),
            lastOne: false,
            bonus: 0,
            options: [
                { description: "Pedir identificación", points: 5, next: 3 },
                { description: "Dejar pasar", points: -5, next: 4 }
            ]
        },
        {
            idScene: 2,
            url: "/src/Assets/videos/v6.mp4",
            description: "Se evalúa la situación desde el puesto.",
            createdAt: new Date(),
            lastOne: false,
            bonus: 0,
            options: [
                { description: "Informar por radio la situación", points: 5, next: 5 },
                { description: "Pedirle que se retire", points: -5, next: 6 }
            ]
        },
        {
            idScene: 3,
            url: "/src/Assets/videos/v3.mp4",
            description: "Detectas que la identificación es falsa.",
            createdAt: new Date(),
            lastOne: false,
            bonus: 0,
            options: [
                { description: "Dejar entrar igualmente", points: 0, next: 7 },
                { description: "Denegar acceso", points: 10, next: 8 }
            ]
        },
        {
            idScene: 4,
            url: "/src/Assets/videos/v7.mp4",
            description: "Se solicita registro del ingreso.",
            createdAt: new Date(),
            lastOne: false,
            bonus: 0,
            options: [
                { description: "Anotar ingreso", points: 5, next: 9 },
                { description: "No anotar y volver al puesto", points: -5, next: 10 }
            ]
        },
        {
            idScene: 5,
            url: "/src/Assets/videos/v10.mp4",
            description: "Informan que nadie espera a un oficial.",
            createdAt: new Date(),
            lastOne: false,
            bonus: 0,
            options: [
                { description: "Denegar acceso", points: 5, next: 11 },
                { description: "Permitir acceso igualmente", points: 0, next: 12 }
            ]
        },
        {
            idScene: 6,
            url: "/src/Assets/videos/v13.mp4",
            description: "La persona se torna errática e insiste en ingresar.",
            createdAt: new Date(),
            lastOne: false,
            bonus: 0,
            options: [
                { description: "Llamar a la policía", points: 5, next: 13 },
                { description: "Ignorarlo", points: -10, next: 14 }
            ]
        },
        {
            idScene: 7,
            url: "/src/Assets/videos/v4.mp4",
            description: "Cierre de caso: derivación interna.",
            createdAt: new Date(),
            lastOne: true,
            bonus: 10,
            options: [
                { description: "Finalizar", points: 0, next: 0 },
                { description: "Finalizar", points: 0, next: 0 }
            ]
        },
        {
            idScene: 8,
            url: "/src/Assets/videos/v5.mp4",
            description: "Cierre de caso: acceso denegado.",
            createdAt: new Date(),
            lastOne: true,
            bonus: 0,
            options: [
                { description: "Finalizar", points: 0, next: 0 },
                { description: "Finalizar", points: 0, next: 0 }
            ]
        },
        {
            idScene: 9,
            url: "/src/Assets/videos/v8.mp4",
            description: "Cierre de caso: registro completo.",
            createdAt: new Date(),
            lastOne: true,
            bonus: 5,
            options: [
                { description: "Finalizar", points: 0, next: 0 },
                { description: "Finalizar", points: 0, next: 0 }
            ]
        },
        {
            idScene: 10,
            url: "/src/Assets/videos/v9.mp4",
            description: "Cierre de caso: error de procedimiento.",
            createdAt: new Date(),
            lastOne: true,
            bonus: -5,
            options: [
                { description: "Finalizar", points: 0, next: 0 },
                { description: "Finalizar", points: 0, next: 0 }
            ]
        },
        {
            idScene: 11,
            url: "/src/Assets/videos/v11.mp4",
            description: "Cierre de caso: coordinación con fuerzas de seguridad.",
            createdAt: new Date(),
            lastOne: true,
            bonus: 5,
            options: [
                { description: "Finalizar", points: 0, next: 0 },
                { description: "Finalizar", points: 0, next: 0 }
            ]
        },
        {
            idScene: 12,
            url: "/src/Assets/videos/v12.mp4",
            description: "Cierre de caso: reentrenamiento recomendado.",
            createdAt: new Date(),
            lastOne: true,
            bonus: 0,
            options: [
                { description: "Finalizar", points: 0, next: 0 },
                { description: "Finalizar", points: 0, next: 0 }
            ]
        },
        {
            idScene: 13,
            url: "/src/Assets/videos/v14.mp4",
            description: "Cierre de caso: intervención policial.",
            createdAt: new Date(),
            lastOne: true,
            bonus: 8,
            options: [
                { description: "Finalizar", points: 0, next: 0 },
                { description: "Finalizar", points: 0, next: 0 }
            ]
        },
        {
            idScene: 14,
            url: "/src/Assets/videos/v15.mp4",
            description: "Cierre de caso: protocolo ejemplar.",
            createdAt: new Date(),
            lastOne: true,
            bonus: 10,
            options: [
                { description: "Finalizar", points: 0, next: 0 },
                { description: "Finalizar", points: 0, next: 0 }
            ]
        }
    ]
};
