import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Training from '../models/Training.js';
import Level from '../models/Level.js';
import PrivateMessage from '../models/PrivateMessage.js'; 
import UserLevelProgress from '../models/UserLevelProgress.js'; 
import { sampleAdministrators } from './cursos_y_niveles/administrators.js';
import { sampleManagers } from './cursos_y_niveles/managers.js';

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
      PrivateMessage.deleteMany({}),
      UserLevelProgress.deleteMany({})
    ]);

    // Crear usuarios de simulación por rol (Administrator y Manager)
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

    // Registrar credenciales en texto plano para administradores y managers
    createdUsers.forEach(user => {
      credentialsList.push({ 
        email: user.email, 
        password: defaultPasswordPlain, 
        role: user.role, 
        name: user.firstName || user.email 
      });
    });

    // Crear 3 alumnos
    info('🎓 Creando 3 alumnos...');
    const studentsToCreate = [];
    for (let i = 1; i <= 3; i++) {
      studentsToCreate.push({
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
        password: defaultPasswordHash,
        role: 'Alumno',
        status: 'available',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        assignedTraining: []
      });
    }

    const createdStudents = await User.insertMany(studentsToCreate);
    info(`✅ ${createdStudents.length} alumnos creados`);
    
    // Registrar credenciales de alumnos
    createdStudents.forEach(student => {
      credentialsList.push({ 
        email: student.email, 
        password: defaultPasswordPlain, 
        role: 'Alumno', 
        name: student.firstName 
      });
    });

    // Crear 3 capacitadores
    info('👩‍🏫 Creando 3 capacitadores...');
    const teachersToCreate = [];
    for (let i = 1; i <= 3; i++) {
      teachersToCreate.push({
        firstName: `Profesor${i}`,
        lastName: `Demo`,
        documentType: 'DNI',
        documentNumber: `${Math.floor(20000000 + Math.random() * 80000000)}`,
        birthDate: new Date(1980, 0, 1),
        email: `profesor${i}@sicapsi.com`,
        postalCode: '8000',
        address: 'Calle Demo',
        addressNumber: `${200 + i}`,
        province: 'buenos_aires',
        city: 'Bahía Blanca',
        areaCode: '0291',
        phone: `1550000${i}`,
        password: defaultPasswordHash,
        role: 'Capacitador',
        status: 'available',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'
      });
    }

    const createdTeachers = await User.insertMany(teachersToCreate);
    info(`✅ ${createdTeachers.length} capacitadores creados`);

    // Registrar credenciales de capacitadores
    createdTeachers.forEach(teacher => {
      credentialsList.push({ 
        email: teacher.email, 
        password: defaultPasswordPlain, 
        role: 'Capacitador', 
        name: teacher.firstName 
      });
    });

    // Resumen usando conteos reales
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'Administrador' });
    const totalManagers = await User.countDocuments({ role: 'Directivo' });
    const totalTrainers = await User.countDocuments({ role: 'Capacitador' });
    const totalStudents = await User.countDocuments({ role: 'Alumno' });
    
    info('✅ Base de datos inicializada exitosamente!');
    info('\n📊 RESUMEN:');
    info(`   Usuarios totales: ${totalUsers}`);
    info(`   - Administradores: ${totalAdmins}`);
    info(`   - Managers: ${totalManagers}`);
    info(`   - Capacitadores: ${totalTrainers}`);
    info(`   - Alumnos: ${totalStudents}`);
    info(`   Trainings: 0`);
    info(`   Niveles: 0`);
    info(`   Mensajes: 0`);
    info(`   Progresos: 0`);
    
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