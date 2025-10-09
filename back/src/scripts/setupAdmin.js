import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

// Cargar variables de entorno
dotenv.config();

/**
 * Script para limpiar la base de datos y asegurar que solo existe el administrador
 */
async function limpiarYCrearAdmin() {
  try {
    console.log('🚀 Conectando a la base de datos...');
    await connectDB();
    
    console.log('🔍 Verificando usuarios existentes...');
    const usuariosExistentes = await User.countDocuments();
    console.log(`📊 Usuarios actuales en la BD: ${usuariosExistentes}`);
    
    // Mostrar todos los usuarios antes de limpiar
    if (usuariosExistentes > 0) {
      const todosLosUsuarios = await User.find({}, 'firstName lastName email role status');
      console.log('\n👥 Usuarios actuales:');
      todosLosUsuarios.forEach(user => {
        console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - Rol: ${user.role} - Estado: ${user.status}`);
      });
    }
    
    console.log('\n🧹 Eliminando TODOS los usuarios...');
    await User.deleteMany({});
    console.log('✅ Todos los usuarios eliminados');
    
    console.log('\n👨‍💼 Creando administrador principal...');
    
    // Crear el administrador principal
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
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
      password: hashedPassword,
      role: "Administrador",
      status: "available" // El admin siempre debe estar disponible
    });
    
    await admin.save();
    console.log('✅ Administrador creado exitosamente');
    
    // Verificar el resultado final
    const usuariosFinales = await User.countDocuments();
    const adminCreado = await User.findOne({ email: "admin@sicapsi.com" });
    
    console.log(`📈 Total de usuarios en la BD: ${usuariosFinales}`);
    console.log(`👤 Administrador: ${adminCreado.firstName} ${adminCreado.lastName} (${adminCreado.role}) - Estado: ${adminCreado.status}`);
    
    console.log('\n🎉 ¡Base de datos configurada exitosamente!');
    console.log('\n📝 Credenciales del administrador:');
    console.log('   Email: admin@sicapsi.com');
    console.log('   Password: admin123');
    console.log('\n🔒 El administrador está protegido contra modificaciones y eliminación');
    console.log('📋 Los nuevos usuarios se registrarán automáticamente como "Alumno" con estado "pendiente"');
    console.log('✅ El administrador podrá aprobar o rechazar usuarios desde el panel de administración');
    
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
limpiarYCrearAdmin();