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
import { ensureTeacherForTraining } from './cursos_y_niveles/teachers.js';

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SICAPSI';
const SALT_ROUNDS = 12;
// Contraseña por defecto para todos los usuarios creados en el seed
const DEFAULT_SEED_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'secret123';
// Control de logs: si quieres ver logs detallados exporta SEED_VERBOSE=true
const VERBOSE = process.env.SEED_VERBOSE === 'true';
const info = (...args) => { if (VERBOSE) console.log(...args); };
 
// Función principal
async function initializeDatabase() {
  try {
    // Conectar a MongoDB
    info('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    info('✅ Conectado a MongoDB');

    // Limpiar TODAS las collections para empezar fresco
    info('🧹 Limpiando todos los datos...');
    await Promise.all([
      User.deleteMany({}),
      Training.deleteMany({}),
      Level.deleteMany({}),
      PrivateMessage.deleteMany({})
    ]);
    // Crear usuarios de simulación por rol (solo Administrator y Manager)
    info('👥 Creando usuarios iniciales (Administrator y Manager)...');
    const toHash = [
      ...sampleAdministrators,
      ...sampleManagers,
    ];
    // Guardaremos las credenciales en texto plano para mostrar al final
    const credentialsList = [];
    // Usamos la misma contraseña por defecto para todos los usuarios
    const defaultPasswordPlain = DEFAULT_SEED_PASSWORD;
    const defaultPasswordHash = await bcrypt.hash(defaultPasswordPlain, SALT_ROUNDS);

    // Preparamos los usuarios (sobrescribimos sus passwords con la contraseña por defecto)
    const hashedUsers = toHash.map(user => ({
      ...user,
      password: defaultPasswordHash
    }));
    const createdUsers = await User.insertMany(hashedUsers);
  info(`✅ ${createdUsers.length} users created`);

  // Mapas por rol (solo admins y managers fueron creados aquí)
  const admins = createdUsers.filter(u => u.role === 'Administrador');
  const managers = createdUsers.filter(u => u.role === 'Directivo');
  const adminUser = admins[0];
  // Registrar credenciales en texto plano para administradores y managers
  admins.forEach(a => credentialsList.push({ email: a.email, password: defaultPasswordPlain, role: 'Administrador', name: a.firstName || a.email }));
  managers.forEach(m => credentialsList.push({ email: m.email, password: defaultPasswordPlain, role: 'Directivo', name: m.firstName || m.email }));

  // Crear 5 cursos: dos de ellos desactualizados (isActive = false)
  info('📚 Creando 5 cursos (2 inactivos)...');
    const coursesToCreate = sampleCourses.slice(0,5).map((training, idx) => ({
      ...training,
      createdBy: adminUser._id,
      // Marcar dos cursos como inactivos para simular desactualizados
      isActive: idx === 3 || idx === 4 ? false : true
    }));

    const createdTrainings = await Training.insertMany(coursesToCreate);
  info(`✅ ${createdTrainings.length} trainings created`);

  // Crear 3 niveles por curso (usar plantillas de sampleLevels pero adaptadas)
  info('🎯 Creando 3 niveles por curso...');
    const levelsData = [];
    // Nos aseguramos de tener al menos 3 plantillas de nivel
    const baseLevels = sampleLevels.slice(0,3);
    createdTrainings.forEach((training, tIdx) => {
      baseLevels.forEach((lvl, lIdx) => {
        // Personalizar bibliografía y training video por curso
        const bibliography = (lvl.bibliography || []).map(b => ({
          ...b,
          title: `${b.title} - ${training.title}`,
          createdAt: new Date()
        }));
        const trainingObj = {
          ...((lvl.training) || {}),
          url: (lvl.training && lvl.training.url) ? lvl.training.url : `https://www.youtube.com/embed/placeholder-${tIdx}-${lIdx}`,
          description: `${training.title} - Nivel ${lIdx + 1}: ${lvl.title}`,
          duration: (lvl.training && lvl.training.duration) ? lvl.training.duration : 30,
          createdAt: new Date()
        };

        levelsData.push({
          levelNumber: lIdx + 1,
          // Título único por curso y por nivel
          title: `${training.title} - Nivel ${lIdx + 1}: ${lvl.title}`,
          description: lvl.description,
          bibliography,
          training: trainingObj,
          test: lvl.test || [], // pruebas idénticas según tus instrucciones
          createdAt: new Date(),
          isActive: typeof lvl.isActive === 'boolean' ? lvl.isActive : true,
          trainingId: training._id
        });
      });
    });

    const createdLevels = await Level.insertMany(levelsData);
  info(`✅ ${createdLevels.length} levels created`);

  // Actualizar cursos con referencias a niveles
  info('🔗 Actualizando cursos con niveles...');
    for (const training of createdTrainings) {
      const trainingLevels = createdLevels.filter(level => 
        level.trainingId.toString() === training._id.toString()
      );
      await Training.findByIdAndUpdate(training._id, {
        levels: trainingLevels.map(level => level._id),
        totalLevels: trainingLevels.length
      });
    }

  // Eliminar usuarios específicos que no queremos (Juan / María) y usuarios con rol "Alumno" obsoleto
  await User.deleteMany({ 
    $or: [
      { email: { $in: ['juan.perez@email.com', 'maria.gonzalez@email.com'] } },
      { role: 'Alumno' } // Eliminar usuarios con rol "Alumno" obsoleto
    ]
  });

  // Crear exactamente 3 alumnos globales y asignarlos a todos los trainings
  info('🎓 Creando exactamente 3 guardias y asignándolos a todos los cursos...');
  // obtener guardias existentes (si alguno otro existe)
  let existingStudents = await User.find({ role: 'Guardia' }).exec();
    // Si hay más de 0 guardias (por la inserción anterior) los usamos; si no, los creamos
    const studentsToEnsure = [];
    if (existingStudents.length < 3) {
      for (let i = 1; i <= 3; i++) {
        studentsToEnsure.push({
          firstName: `Guardia${i}`,
          lastName: `Demo`,
          documentType: 'DNI',
          documentNumber: `${Math.floor(20000000 + Math.random() * 80000000)}`,
          birthDate: new Date(2000, 0, 1),
          email: `guardia${i}@sicapsi.com`,
          postalCode: '8000',
          address: 'Calle Demo',
          addressNumber: `${100 + i}`,
          province: 'buenos_aires',
          city: 'Bahía Blanca',
          areaCode: '0291',
          phone: `1540000${i}`,
          password: defaultPasswordPlain,
          role: 'Guardia',
          status: 'available',
          profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
          assignedTraining: []
        });
      }
      // Hash ya disponible en defaultPasswordHash
      const preparedStudents = studentsToEnsure.map(s => ({ ...s, password: defaultPasswordHash }));
      const createdNewStudents = await User.insertMany(preparedStudents);
  info(`✅ ${createdNewStudents.length} guardias creados`);
      // registrar credenciales
      studentsToEnsure.forEach(s => credentialsList.push({ email: s.email, password: defaultPasswordPlain, role: 'Guardia', name: s.firstName }));
      existingStudents = createdNewStudents;
    } else {
      info('✅ Ya existen guardias en la BD; usándolos');
    }

    // Asignar cada estudiante a todos los trainings
    for (const student of existingStudents) {
      for (const training of createdTrainings) {
        await User.findByIdAndUpdate(student._id, { $addToSet: { assignedTraining: training._id } });
      }
    }

  // Crear / asegurar un docente por curso y generar mensajes personalizados
  info('👩‍🏫 Creando/asegurando docentes por curso y generando mensajes personalizados...');
    const teacherByTraining = new Map();
    const messagesToInsert = [];
    for (let idx = 0; idx < createdTrainings.length; idx++) {
      const training = createdTrainings[idx];
      // Pasamos el hash de la contraseña por defecto para que el helper lo use
      const teacher = await ensureTeacherForTraining({ training, saltRounds: SALT_ROUNDS, index: idx, defaultPasswordHash });
      teacherByTraining.set(training._id.toString(), teacher);

  // Registrar credenciales del docente (por defecto docente123)
  credentialsList.push({ email: teacher.email, password: defaultPasswordPlain, role: 'Capacitador', name: teacher.firstName || `Profesor ${training.title}` });

      // Obtener guardias asignados al curso (al menos 3 garantizados arriba)
      const studentsInCourse = await User.find({ role: 'Guardia', assignedTraining: training._id }).select('_id firstName email').lean();
      const studentIds = studentsInCourse.map(s => s._id);

  // Mensajes de bienvenida personalizados (teacher -> each student)
      for (const sid of studentIds) {
        const subject = `Bienvenida a ${training.title}`;
        const body = `¡Hola! Soy ${teacher.firstName || 'Tu Profesor'}, bienvenido/a al curso ${training.title}. Te doy la bienvenida personalmente.`;
        messagesToInsert.push({
          sender: teacher._id,
          recipient: sid,
          subject,
          message: body,
          isRead: false,
          folder: 'inbox',
          status: 'received',
          trainingId: training._id,
        });
        messagesToInsert.push({
          sender: teacher._id,
          recipient: sid,
          subject,
          message: body,
          isRead: true,
          folder: 'sent',
          status: 'sent',
          trainingId: training._id,
        });
      }

      // Mensaje de consulta de un guardia distinto por curso hacia el profe (si existe al menos uno)
      if (studentIds.length) {
        const sid = studentIds[0];
        const inquiry = {
          sender: sid,
          recipient: teacher._id,
          subject: `Consulta en ${training.title}`,
          message: 'Profe, tengo una duda sobre el primer nivel.',
          isRead: true,
          folder: 'sent',
          status: 'sent',
          trainingId: training._id,
        };
        const inquiryInbox = { ...inquiry, isRead: false, folder: 'inbox', sender: sid, recipient: teacher._id };
        messagesToInsert.push(inquiry);
        messagesToInsert.push(inquiryInbox);
      }
    }

    if (messagesToInsert.length) {
      await PrivateMessage.insertMany(messagesToInsert);
      info(`✅ Mensajes de ejemplo creados: ${messagesToInsert.length}`);
    }

      
  // VERIFICACIÓN FINAL
    // (checks are run only in verbose mode)
    info('🔍 Verificando que todo esté correcto...');
    // Verificar un guardia y sus trainings (solo si verbose)
    const oneStudent = await User.findOne({ role: 'Guardia' }).populate('assignedTraining', 'title subtitle').exec();
    if (VERBOSE && oneStudent) {
      console.log(`📋 Trainings assigned to ${oneStudent.firstName} ${oneStudent.lastName}:`);
      (oneStudent.assignedTraining || []).forEach(training => {
        console.log(`   - ${training.title}: ${training.subtitle}`);
      });
    }

    // Verificar curso con niveles (solo si verbose)
    const trainingWithLevels = await Training.findById(createdTrainings[0]._id)
      .populate('levels', 'levelNumber title')
      .exec();
    if (VERBOSE && trainingWithLevels) {
      console.log('🎯 Levels of the first training:');
      trainingWithLevels.levels.forEach(level => {
        console.log(`   - Level ${level.levelNumber}: ${level.title}`);
      });
    }

  // Resumen usando conteos reales
  const totalUsers = await User.countDocuments();
  const totalAdmins = await User.countDocuments({ role: 'Administrador' });
  const totalManagers = await User.countDocuments({ role: 'Directivo' });
  const totalTrainers = await User.countDocuments({ role: 'Capacitador' });
  const totalStudents = await User.countDocuments({ role: 'Guardia' });
  info('✅ Base de datos inicializada exitosamente!');
  info('\n📊 RESUMEN:');
  info(`   Usuarios totales: ${totalUsers}`);
  info(`   - Administradores: ${totalAdmins}`);
  info(`   - Managers: ${totalManagers}`);
  info(`   - Trainers: ${totalTrainers}`);
  info(`   - Guardias: ${totalStudents}`);
  info(`   Trainings: ${createdTrainings.length}`);
  info(`   Niveles: ${createdLevels.length}`);
  info(`   Mensajes: ${(await PrivateMessage.countDocuments())}`);
    
  console.log('\n🔑 Credenciales de acceso (email / password):');
    // Agrupar por rol para una mejor lectura
    const byRole = credentialsList.reduce((acc, c) => {
      acc[c.role] = acc[c.role] || [];
      acc[c.role].push(c);
      return acc;
    }, {});
    Object.keys(byRole).forEach(role => {
      console.log(`\n   --- ${role} ---`);
      byRole[role].forEach(c => {
        console.log(`     ${c.email}  /  ${c.password}`);
      });
    });
    
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