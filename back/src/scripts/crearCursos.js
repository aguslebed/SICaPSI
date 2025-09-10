import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario.js';
import Course from '../models/Course.js';
import Level from '../models/Level.js';
import PrivateMessage from '../models/PrivateMessage.js';
import Report from '../models/Report.js';
import UserProgress from '../models/UserProgress.js';

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/SICAPSI';
const SALT_ROUNDS = 12;

// Datos de simulación
const sampleUsers = [
  // Administradores
  {
    nombre: "Admin",
    apellidos: "Sistema",
    tipoDocumento: "DNI",
    numeroDocumento: "40123456",
    fechaNacimiento: new Date(1990, 0, 1),
    email: "admin@sicapsi.com",
    codigoPostal: "1000",
    direccion: "Calle Admin",
    numeroDireccion: "123",
    departamento: "A",
    provincia: "buenos_aires",
    localidad: "CABA",
    codArea: "011",
    telefono: "12345678",
    password: "password123",
    tipo: "admin",
    legajo: "ADM001",
    cursosAsignados: []
  },
  // Alumnos
  {
    nombre: "Juan",
    apellidos: "Pérez",
    tipoDocumento: "DNI",
    numeroDocumento: "35123456",
    fechaNacimiento: new Date(1995, 5, 15),
    email: "juan.perez@email.com",
    codigoPostal: "8000",
    direccion: "Calle Principal",
    numeroDireccion: "456",
    provincia: "buenos_aires",
    localidad: "Bahía Blanca",
    codArea: "0291",
    telefono: "154567890",
    password: "alumno123",
    tipo: "alumno",
    legajo: "ALU001",
    cursosAsignados: []
  },
  {
    nombre: "María",
    apellidos: "González",
    tipoDocumento: "DNI",
    numeroDocumento: "36123457",
    fechaNacimiento: new Date(1998, 8, 20),
    email: "maria.gonzalez@email.com",
    codigoPostal: "8000",
    direccion: "Av. Secundaria",
    numeroDireccion: "789",
    provincia: "buenos_aires",
    localidad: "Bahía Blanca",
    codArea: "0291",
    telefono: "155678901",
    password: "alumno123",
    tipo: "alumno",
    legajo: "ALU002",
    cursosAsignados: []
  }
];

const sampleCourses = [
  {
    title: "Desarrollo Web Full Stack",
    subtitle: "Aprende a crear aplicaciones web completas",
    description: "Curso completo de desarrollo web desde frontend hasta backend",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
    isActive: true,
    introduction: {
      title: "Bienvenido al Mundo del Desarrollo Web",
      subtitle: "Tu viaje comienza aquí",
      welcomeMessage: "¡Bienvenido! En este curso aprenderás las habilidades esenciales para convertirte en un desarrollador web full stack."
    },
    levels: [],
    totalLevels: 0
  },
  {
    title: "Machine Learning para Principiantes",
    subtitle: "Introducción a la inteligencia artificial",
    description: "Aprende los fundamentos del machine learning y la IA",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
    isActive: true,
    introduction: {
      title: "Descubre el Poder del Machine Learning",
      subtitle: "Transforma datos en conocimiento",
      welcomeMessage: "Bienvenido al fascinante mundo del machine learning. Aprenderás a crear modelos predictivos y entender los algoritmos de IA."
    },
    levels: [],
    totalLevels: 0
  }
];

const sampleLevels = [
  // Niveles para Desarrollo Web
  {
    levelNumber: 1,
    title: "Introducción a HTML y CSS",
    description: "Fundamentos de la estructura web y estilos",
    bibliography: [
      {
        title: "Guía Completa de HTML5",
        description: "Documentación oficial y mejores prácticas",
        downloadLinks: [
          "https://example.com/html5-guide.pdf",
          "https://example.com/css-cheatsheet.pdf"
        ],
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
        downloadLinks: [
          "https://example.com/javascript-book.pdf"
        ],
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
  }
];

// Función principal
async function initializeDatabase() {
  try {
    // Conectar a MongoDB
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar TODAS las collections para empezar fresco
    console.log('🧹 Limpiando todos los datos...');
    await Promise.all([
      Usuario.deleteMany({}),
      Course.deleteMany({}),
      Level.deleteMany({}),
      PrivateMessage.deleteMany({}),
      Report.deleteMany({}),
      UserProgress.deleteMany({})
    ]);

    // Crear usuarios de simulación
    console.log('👥 Creando usuarios de simulación...');
    const hashedUsers = await Promise.all(
      sampleUsers.map(async user => ({
        ...user,
        password: await bcrypt.hash(user.password, SALT_ROUNDS)
      }))
    );
    
    const createdUsers = await Usuario.insertMany(hashedUsers);
    console.log(`✅ ${createdUsers.length} usuarios creados`);
    const users = createdUsers;

    // Obtener admin y alumnos
    const adminUser = users.find(user => user.tipo === 'admin');
    const alumnos = users.filter(user => user.tipo === 'alumno');

    // Crear cursos
    console.log('📚 Creando cursos...');
    const coursesWithAdmin = sampleCourses.map(course => ({
      ...course,
      createdBy: adminUser._id,
      asignadoA: alumnos.map(alumno => alumno._id)
    }));

    const createdCourses = await Course.insertMany(coursesWithAdmin);
    console.log(`✅ ${createdCourses.length} cursos creados`);

    // Crear niveles
    console.log('🎯 Creando niveles...');
    const levelsData = [];
    
    // Para cada curso crear niveles
    createdCourses.forEach((course, index) => {
      sampleLevels.forEach(level => {
        levelsData.push({
          ...level,
          courseId: course._id,
          title: index === 0 ? level.title : `ML - ${level.title}`
        });
      });
    });

    const createdLevels = await Level.insertMany(levelsData);
    console.log(`✅ ${createdLevels.length} niveles creados`);

    // Actualizar cursos con referencias a niveles
    console.log('🔗 Actualizando cursos con niveles...');
    for (const course of createdCourses) {
      const courseLevels = createdLevels.filter(level => 
        level.courseId.toString() === course._id.toString()
      );
      
      await Course.findByIdAndUpdate(course._id, {
        levels: courseLevels.map(level => level._id),
        totalLevels: courseLevels.length
      });
    }

    // Asignar cursos a los alumnos
    console.log('🎓 Asignando cursos a alumnos...');
    for (const alumno of alumnos) {
      await Usuario.findByIdAndUpdate(
        alumno._id,
        { 
          $set: { 
            cursosAsignados: createdCourses.map(course => course._id) 
          } 
        }
      );
    }

    // Crear algunos mensajes de ejemplo
    console.log('📨 Creando mensajes de ejemplo...');
    const sampleMessages = [
      {
        sender: adminUser._id,
        recipient: alumnos[0]._id,
        subject: "Bienvenido al curso",
        message: "¡Hola! Te damos la bienvenida al curso. Esperamos que tengas una excelente experiencia de aprendizaje.",
        isRead: false,
        folder: 'inbox'
      },
      {
        sender: alumnos[0]._id,
        recipient: adminUser._id,
        subject: "Consulta sobre el primer nivel",
        message: "Hola, tengo una duda sobre el primer nivel del curso.",
        isRead: true,
        folder: 'sent'
      }
    ];

    await PrivateMessage.insertMany(sampleMessages);
    console.log('✅ Mensajes de ejemplo creados');

    // Crear progreso de ejemplo
    console.log('📊 Creando progreso de ejemplo...');
    const sampleProgress = [
      {
        userId: alumnos[0]._id,
        courseId: createdCourses[0]._id,
        completedLevels: [
          {
            levelId: createdLevels[0]._id,
            levelNumber: 1,
            score: 85,
            attempts: 1
          }
        ],
        currentLevel: {
          levelId: createdLevels[1]._id,
          levelNumber: 2
        },
        totalProgress: 50,
        isCompleted: false
      }
    ];

    await UserProgress.insertMany(sampleProgress);
    console.log('✅ Progreso de ejemplo creado');

    // VERIFICACIÓN FINAL
    console.log('🔍 Verificando que todo esté correcto...');
    
    // Verificar usuario con cursos
    const usuarioConCursos = await Usuario.findById(alumnos[0]._id)
      .populate('cursosAsignados', 'title subtitle')
      .exec();
    
    console.log('📋 Cursos asignados a Juan Pérez:');
    usuarioConCursos.cursosAsignados.forEach(curso => {
      console.log(`   - ${curso.title}: ${curso.subtitle}`);
    });

    // Verificar curso con niveles
    const cursoConNiveles = await Course.findById(createdCourses[0]._id)
      .populate('levels', 'levelNumber title')
      .populate('asignadoA', 'nombre email')
      .exec();
    
    console.log('🎯 Niveles del primer curso:');
    cursoConNiveles.levels.forEach(nivel => {
      console.log(`   - Nivel ${nivel.levelNumber}: ${nivel.title}`);
    });

    console.log('👥 Alumnos asignados al curso:');
    cursoConNiveles.asignadoA.forEach(alumno => {
      console.log(`   - ${alumno.nombre} (${alumno.email})`);
    });

    console.log('✅ Base de datos inicializada exitosamente!');
    console.log('\n📊 RESUMEN:');
    console.log(`   Usuarios totales: ${users.length}`);
    console.log(`   - Administradores: ${users.filter(u => u.tipo === 'admin').length}`);
    console.log(`   - Alumnos: ${users.filter(u => u.tipo === 'alumno').length}`);
    console.log(`   Cursos: ${createdCourses.length}`);
    console.log(`   Niveles: ${createdLevels.length}`);
    console.log(`   Mensajes: ${sampleMessages.length}`);
    console.log(`   Progresos: ${sampleProgress.length}`);
    
    console.log('\n🔑 Credenciales de acceso:');
    console.log('   Admin: admin@sicapsi.com / password123');
    console.log('   Alumno 1: juan.perez@email.com / alumno123');
    console.log('   Alumno 2: maria.gonzalez@email.com / alumno123');
    
    console.log('\n🚀 La base de datos SICAPSI está lista para usar!');

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Conexión cerrada');
  }
}

// Ejecutar el script
initializeDatabase();