import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Training from '../models/Training.js';
import Level from '../models/Level.js';
import PrivateMessage from '../models/PrivateMessage.js'; 
import { sampleLevels } from './cursos_y_niveles/levels.js';
import { sampleCourses } from './cursos_y_niveles/training.js';
import { sampleUsers } from './cursos_y_niveles/users.js';

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SICAPSI';
const SALT_ROUNDS = 12;
 
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
      User.deleteMany({}),
      Training.deleteMany({}),
      Level.deleteMany({}),
      PrivateMessage.deleteMany({})
    ]);

    // Crear usuarios de simulación
    console.log('👥 Creando usuarios de simulación...');
    const hashedUsers = await Promise.all(
      sampleUsers.map(async user => ({
        ...user,
        password: await bcrypt.hash(user.password, SALT_ROUNDS)
      }))
    );
    
  const createdUsers = await User.insertMany(hashedUsers);
  console.log(`✅ ${createdUsers.length} users created`);
  const users = createdUsers;

    // Obtener admin y alumnos
  const adminUser = users.find(user => user.role === 'Administrator');
  const students = users.filter(user => user.role === 'Student');

    // Crear cursos
    console.log('📚 Creando cursos...');
    const trainingsWithAdmin = sampleCourses.map(training => ({
      ...training,
      createdBy: adminUser._id
    }));

    const createdTrainings = await Training.insertMany(trainingsWithAdmin);
    console.log(`✅ ${createdTrainings.length} trainings created`);

    // Crear niveles
    console.log('🎯 Creando niveles...');
    const levelsData = [];
    
    // Para cada curso crear niveles
    createdTrainings.forEach((training, index) => {
      sampleLevels.forEach(level => {
        levelsData.push({
          ...level,
          trainingId: training._id,
          title: index === 0 ? level.title : `ML - ${level.title}`
        });
      });
    });

  const createdLevels = await Level.insertMany(levelsData);
  console.log(`✅ ${createdLevels.length} levels created`);

    // Actualizar cursos con referencias a niveles
    console.log('🔗 Actualizando cursos con niveles...');
    for (const training of createdTrainings) {
      const trainingLevels = createdLevels.filter(level => 
        level.trainingId.toString() === training._id.toString()
      );
      await Training.findByIdAndUpdate(training._id, {
        levels: trainingLevels.map(level => level._id),
        totalLevels: trainingLevels.length
      });
    }

    // Asignar cursos a los alumnos
    console.log('🎓 Asignando cursos a alumnos...');
    for (const student of students) {
      await User.findByIdAndUpdate(
        student._id,
        { 
          $set: { 
            assignedTraining: createdTrainings.map(training => training._id) 
          } 
        }
      );
    }


    // Crear algunos mensajes de ejemplo
    console.log('📨 Creando mensajes de ejemplo...');
    const sampleMessages = [
      {
        sender: adminUser._id,
        recipient: students[0]._id,
        subject: "Bienvenido al curso",
        message: "¡Hola! Te damos la bienvenida al curso. Esperamos que tengas una excelente experiencia de aprendizaje.",
        isRead: false,
        folder: 'inbox'
      },
      {
        sender: students[0]._id,
        recipient: adminUser._id,
        subject: "Consulta sobre el primer nivel",
        message: "Hola, tengo una duda sobre el primer nivel del curso.",
        isRead: true,
        folder: 'sent'
      }
    ];

    await PrivateMessage.insertMany(sampleMessages);
    console.log('✅ Sample messages created');

      
    // VERIFICACIÓN FINAL
    console.log('🔍 Verificando que todo esté correcto...');
    
    // Verificar usuario con cursos
    const userWithTrainings = await User.findById(students[0]._id)
      .populate('assignedTraining', 'title subtitle')
      .exec();
    
    console.log('📋 Trainings assigned to Juan Pérez:');
    userWithTrainings.assignedTraining.forEach(training => {
      console.log(`   - ${training.title}: ${training.subtitle}`);
    });

    // Verificar curso con niveles
    const trainingWithLevels = await Training.findById(createdTrainings[0]._id)
      .populate('levels', 'levelNumber title')
      .exec();
    
    console.log('🎯 Levels of the first training:');
    trainingWithLevels.levels.forEach(level => {
      console.log(`   - Level ${level.levelNumber}: ${level.title}`);
    });

    console.log('✅ Base de datos inicializada exitosamente!');
    console.log('\n📊 RESUMEN:');
    console.log(`   Usuarios totales: ${users.length}`);
  console.log(`   - Administradores: ${users.filter(u => u.role === 'Administrator').length}`);
  console.log(`   - Alumnos: ${users.filter(u => u.role === 'Student').length}`);
    console.log(`   Trainings: ${createdTrainings.length}`);
    console.log(`   Niveles: ${createdLevels.length}`);
    console.log(`   Mensajes: ${sampleMessages.length}`); 
    
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