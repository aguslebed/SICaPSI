import mongoose from "mongoose";

/**
 * Configurador de base de datos
 * Responsabilidades:
 * 1. Establecer conexión a MongoDB
 * 2. Manejar errores de conexión
 * 3. Configurar opciones de conexión
 * 
 * Cumple SRP: Solo maneja conexión a base de datos
 * Cumple OCP: Puede extenderse para múltiples tipos de BD
 */

/**
 * Establece conexión a MongoDB
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  
  try {
    // Responsabilidad 1: Configurar y establecer conexión
    await mongoose.connect(uri, {
      // Opciones de conexión para mejor rendimiento
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    
    // Responsabilidad 2: Confirmar conexión exitosa
    console.log("✅ Conectado a MongoDB");
    
  } catch (err) {
    // Responsabilidad 3: Manejar errores de conexión
    console.error("❌ Error al conectar a MongoDB:", err);
    process.exit(1);
  }
};

/**
 * Cierra conexión a MongoDB (para testing y cleanup)
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("✅ Desconectado de MongoDB");
  } catch (err) {
    console.error("❌ Error al desconectar de MongoDB:", err);
  }
};
