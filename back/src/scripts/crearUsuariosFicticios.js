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
  },
  {
    firstName: "Juan",
    lastName: "Pérez",
    documentType: "DNI",
    documentNumber: "22334455",
    birthDate: new Date("1985-03-15"),
    email: "juan.perez@gmail.com",
    postalCode: "1400",
    address: "Av. Santa Fe",
    addressNumber: "2500",
    apartment: "5B",
    province: "Buenos Aires",
    city: "CABA",
    areaCode: "011",
    phone: "1122334455",
    password: "capacitador123",
    role: "Capacitador",
    status: "available"
  },
  {
    firstName: "María",
    lastName: "González",
    documentType: "DNI",
    documentNumber: "33445566",
    birthDate: new Date("1992-07-20"),
    email: "maria.gonzalez@hotmail.com",
    postalCode: "1600",
    address: "Av. Belgrano",
    addressNumber: "1800",
    apartment: "",
    province: "Buenos Aires",
    city: "CABA",
    areaCode: "011",
    phone: "1133445566",
    password: "gerente123",
    role: "Directivo",
    status: "available"
  },
  {
    firstName: "Pedro",
    lastName: "Rodriguez",
    documentType: "DNI",
    documentNumber: "44556677",
    birthDate: new Date("1995-11-10"),
    email: "pedro.rodriguez@outlook.com",
    postalCode: "1200",
    address: "Av. Rivadavia",
    addressNumber: "3000",
    apartment: "2A",
    province: "Buenos Aires",
    city: "CABA",
    areaCode: "011",
    phone: "1144556677",
    password: "estudiante123",
    role: "Alumno",
    status: "available"
  },
  {
    firstName: "Ana",
    lastName: "Martínez",
    documentType: "DNI",
    documentNumber: "55667788",
    birthDate: new Date("1988-05-25"),
    email: "ana.martinez@yahoo.com",
    postalCode: "1300",
    address: "Av. 9 de Julio",
    addressNumber: "1500",
    apartment: "10C",
    province: "Buenos Aires",
    city: "CABA",
    areaCode: "011",
    phone: "1155667788",
    password: "capacitadora123",
    role: "Capacitador",
    status: "available"
  },
  {
    firstName: "Carlos",
    lastName: "López",
    documentType: "DNI",
    documentNumber: "66778899",
    birthDate: new Date("1993-09-12"),
    email: "carlos.lopez@gmail.com",
    postalCode: "1500",
    address: "Av. Las Heras",
    addressNumber: "2200",
    apartment: "",
    province: "Buenos Aires",
    city: "CABA",
    areaCode: "011",
    phone: "1166778899",
    password: "estudiante456",
    role: "Alumno",
    status: "available"
  },
  {
    firstName: "Laura",
    lastName: "Fernández",
    documentType: "DNI",
    documentNumber: "77889900",
    birthDate: new Date("1991-12-08"),
    email: "laura.fernandez@hotmail.com",
    postalCode: "1700",
    address: "Av. Callao",
    addressNumber: "800",
    apartment: "3B",
    province: "Buenos Aires",
    city: "CABA",
    areaCode: "011",
    phone: "1177889900",
    password: "estudiante789",
    role: "Alumno",
    status: "available"
  },
  {
    firstName: "Roberto",
    lastName: "Silva",
    documentType: "DNI",
    documentNumber: "88990011",
    birthDate: new Date("1987-04-30"),
    email: "roberto.silva@outlook.com",
    postalCode: "1800",
    address: "Av. Pueyrredón",
    addressNumber: "1200",
    apartment: "",
    province: "Buenos Aires",
    city: "CABA",
    areaCode: "011",
    phone: "1188990011",
    password: "gerente456",
    role: "Directivo",
    status: "available"
  },
  {
    firstName: "Sofía",
    lastName: "Torres",
    documentType: "DNI",
    documentNumber: "99001122",
    birthDate: new Date("1994-08-17"),
    email: "sofia.torres@gmail.com",
    postalCode: "1900",
    address: "Av. Córdoba",
    addressNumber: "3500",
    apartment: "8A",
    province: "Buenos Aires",
    city: "CABA",
    areaCode: "011",
    phone: "1199001122",
    password: "estudiante101",
    role: "Alumno",
    status: "available"
  },
  {
    firstName: "Diego",
    lastName: "Morales",
    documentType: "DNI",
    documentNumber: "11223344",
    birthDate: new Date("1989-02-14"),
    email: "diego.morales@yahoo.com",
    postalCode: "2000",
    address: "Av. San Martín",
    addressNumber: "4000",
    apartment: "",
    province: "Buenos Aires",
    city: "CABA",
    areaCode: "011",
    phone: "1111223344",
    password: "capacitador789",
    role: "Capacitador",
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