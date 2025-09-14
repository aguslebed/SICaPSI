import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Training from '../models/Training.js';
import Level from '../models/Level.js';
import PrivateMessage from '../models/PrivateMessage.js'; 
import { sampleLevels } from './cursos_y_niveles/levels.js';
import { sampleCourses } from './cursos_y_niveles/training.js';
import { sampleAdministrators } from './cursos_y_niveles/administrators.js';
import { sampleManagers } from './cursos_y_niveles/managers.js';
import { sampleTrainers } from './cursos_y_niveles/trainers.js';
import { sampleStudents } from './cursos_y_niveles/students.js';
import { ensureTeacherForTraining } from './cursos_y_niveles/teachers.js';
import { buildWelcomeMessageDocs, buildStudentInquiryDocs } from './cursos_y_niveles/messages.js';

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

    // Crear usuarios de simulación por rol (escalable)
    console.log('👥 Creando usuarios (Administrators, Managers, Trainers, Students)...');
    const toHash = [
      ...sampleAdministrators,
      ...sampleManagers,
      ...sampleTrainers,
      ...sampleStudents,
    ];
    const hashedUsers = await Promise.all(toHash.map(async user => ({
      ...user,
      password: await bcrypt.hash(user.password, SALT_ROUNDS)
    })));
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ ${createdUsers.length} users created`);

    // Mapas por rol
    const admins = createdUsers.filter(u => u.role === 'Administrator');
    const managers = createdUsers.filter(u => u.role === 'Manager');
    const trainers = createdUsers.filter(u => u.role === 'Trainer');
    const students = createdUsers.filter(u => u.role === 'Student');
    const adminUser = admins[0];

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

    // Crear / asegurar un docente por curso (escalable y reutilizable) y mensajes por curso
    console.log('👩‍🏫 Creando/asegurando docentes por curso y mensajes de ejemplo por curso...');
    const teacherByTraining = new Map();
    for (const training of createdTrainings) {
      const teacher = await ensureTeacherForTraining({ training, saltRounds: SALT_ROUNDS });
      teacherByTraining.set(training._id.toString(), teacher);
    }

    // Mensajes: por cada curso, el profesor envía bienvenida a todos sus alumnos; y un alumno consulta a su profe
    const messagesToInsert = [];
    for (const training of createdTrainings) {
      const tId = training._id;
      const teacher = teacherByTraining.get(tId.toString());
      const studentsInCourse = await User.find({ role: 'Student', assignedTraining: tId }).select('_id').lean();
      const studentIds = studentsInCourse.map(s => s._id);
      messagesToInsert.push(
        ...buildWelcomeMessageDocs({ training, teacherId: teacher._id, studentIds })
      );
      if (studentIds.length) {
        messagesToInsert.push(
          ...buildStudentInquiryDocs({ training, teacherId: teacher._id, studentId: studentIds[0] })
        );
      }
    }

    if (messagesToInsert.length) {
      await PrivateMessage.insertMany(messagesToInsert);
      console.log(`✅ Mensajes de ejemplo creados: ${messagesToInsert.length}`);
    }

      
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
    console.log(`   Usuarios totales: ${createdUsers.length}`);
    console.log(`   - Administradores: ${admins.length}`);
    console.log(`   - Managers: ${managers.length}`);
    console.log(`   - Trainers: ${trainers.length}`);
    console.log(`   - Alumnos: ${students.length}`);
    console.log(`   Trainings: ${createdTrainings.length}`);
    console.log(`   Niveles: ${createdLevels.length}`);
  console.log(`   Mensajes: ${(await PrivateMessage.countDocuments())}`); 
    
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