import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

// Cargar variables de entorno
dotenv.config();

/**
 * Script para crear usuarios ficticios en la base de datos
 * Incluye un administrador y varios usuarios de diferentes roles
 */

const usuariosFicticios = [
  {
    firstName: "Admin",
    lastName: "Principal",
    documentType: "DNI",
    documentNumber: "12345678",
    birthDate: new Date("1990-01-01"),
    email: "admin@sicapsi.com",
    postalCode: "1000",
    address: "Av. Corrientes",
    addressNumber: "1234",
    apartment: "",
    province: "Buenos Aires",
    city: "CABA",
    areaCode: "011",
    phone: "1234567890",
    password: "admin123",
    role: "Administrador",
    status: "available"
  }
];

/**
 * Función principal para crear usuarios ficticios
 */
async function crearUsuariosFicticios() {
  try {
    console.log('🚀 Conectando a la base de datos...');
    await connectDB();
    
    console.log('🔍 Verificando usuarios existentes...');
    // Verificar si ya existen usuarios
    const usuariosExistentes = await User.countDocuments();
    console.log(`📊 Usuarios actuales en la BD: ${usuariosExistentes}`);
    
    console.log('🧹 Limpiando usuarios existentes (opcional)...');
    // Opcional: limpiar usuarios existentes (comentar estas líneas si no quieres eliminar)
    // await User.deleteMany({});
    // console.log('✅ Usuarios existentes eliminados');
    
    console.log('👥 Creando usuarios ficticios...');
    
    for (const usuarioData of usuariosFicticios) {
      try {
        // Verificar si el usuario ya existe
        const usuarioExistente = await User.findOne({ 
          $or: [
            { email: usuarioData.email },
            { documentNumber: usuarioData.documentNumber }
          ]
        });
        
        if (usuarioExistente) {
          console.log(`⚠️  Usuario ${usuarioData.email} ya existe, saltando...`);
          continue;
        }
        
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(usuarioData.password, 10);
        
        // Crear el usuario
        const nuevoUsuario = new User({
          ...usuarioData,
          password: hashedPassword
        });
        
        await nuevoUsuario.save();
        console.log(`✅ Usuario creado: ${usuarioData.firstName} ${usuarioData.lastName} (${usuarioData.role}) - ${usuarioData.email}`);
        
      } catch (error) {
        console.error(`❌ Error creando usuario ${usuarioData.email}:`, error.message);
      }
    }
    
    // Mostrar resumen final
    const totalUsuarios = await User.countDocuments();
    console.log(`📈 Total de usuarios en la BD: ${totalUsuarios}`);
    
    // Mostrar usuarios por rol
    const roles = ['Administrador', 'Capacitador', 'Directivo', 'Alumno'];
    for (const role of roles) {
      const count = await User.countDocuments({ role });
      console.log(`📋 ${role}s: ${count}`);
    }
    
    console.log('\n🎉 ¡Script completado exitosamente!');
    console.log('\n📝 Credenciales del administrador:');
    console.log('   Email: admin@sicapsi.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('💥 Error ejecutando el script:', error);
  } finally {
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión a la base de datos cerrada');
    process.exit(0);
  }
}

// Ejecutar el script
crearUsuariosFicticios();