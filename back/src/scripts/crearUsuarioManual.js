import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";

/**
 * Script de creación manual de usuario
 * Responsabilidades:
 * 1. Establecer conexión temporal a BD
 * 2. Crear usuario con datos hasheados
 * 3. Cerrar conexión y reportar resultado
 * 
 * Cumple SRP: Solo crea usuario de prueba
 * Cumple OCP: Extensible para diferentes tipos de usuarios
 */

/**
 * Creador de usuarios para testing/seeding
 */
class UserSeeder {
  /**
   * Responsabilidad 1: Conectar a base de datos temporalmente
   */
  async connect() {
    await mongoose.connect("mongodb://localhost:27017/SICAPSI");
    console.log("✅ Conectado para seeding");
  }

  /**
   * Responsabilidad 2: Crear usuario con datos seguros
   */
  async createTestUser() {
    const userData = {
      password: "gero123",
      legajo: "1221",
      tipo: "admin",
      nombre_completo: "Geronimo Barzola",
      mail: "barzolageronimo@gmail.com",
      fecha_nacimiento: new Date("1990-01-01"),
      direccion: "Calle Falsa 123",
      telefono: "123456789",
      dni: "11111"
    };

    // Hash seguro de contraseña
    const contrasenaHasheada = await bcrypt.hash(userData.password, 10);

    // Crear usuario
    const usuario = new Usuario({
      _id: new mongoose.Types.ObjectId(),
      ultimo_ingreso: new Date(),
      ...userData,
      contrasena: contrasenaHasheada
    });

    await usuario.save();
    return usuario;
  }

  /**
   * Responsabilidad 3: Limpiar conexión y reportar
   */
  async cleanup() {
    await mongoose.disconnect();
    console.log("✅ Desconectado del seeding");
  }

  /**
   * Ejecuta el proceso completo de seeding
   */
  async run() {
    try {
      await this.connect();
      const usuario = await this.createTestUser();
      console.log("✅ Usuario creado:", usuario.mail);
      await this.cleanup();
    } catch (error) {
      console.error("❌ Error en seeding:", error);
      await this.cleanup();
      process.exit(1);
    }
  }
}

// Ejecutar seeding
const seeder = new UserSeeder();
seeder.run();