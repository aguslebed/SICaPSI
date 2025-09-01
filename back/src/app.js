import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

/**
 * Configurador principal de la aplicación
 * Responsabilidades:
 * 1. Configurar servidor Express y middlewares
 * 2. Establecer conexión a base de datos
 * 3. Inicializar servidor y rutas
 * 
 * Cumple SRP: Solo orquesta la configuración inicial
 * Cumple OCP: Extensible agregando nuevos módulos sin modificar core
 */

/**
 * Configuración del servidor
 */
class AppConfig {
  constructor() {
    this.app = express();
    this.PORT = process.env.PORT || 4000;
  }

  /**
   * Responsabilidad 1: Configurar middlewares base
   */
  configureMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  /**
   * Responsabilidad 2: Configurar rutas
   */
  configureRoutes() {
    this.app.use("/", usuarioRoutes);
    // Futuras rutas pueden agregarse aquí
    // this.app.use("/api/products", productRoutes);
  }

  /**
   * Responsabilidad 3: Configurar manejo de errores
   */
  configureErrorHandling() {
    this.app.use(errorHandler);
  }

  /**
   * Inicia el servidor
   */
  async start() {
    try {
      // Conectar base de datos
      await connectDB();
      
      // Configurar aplicación
      this.configureMiddlewares();
      this.configureRoutes();
      this.configureErrorHandling();

      // Iniciar servidor
      this.app.listen(this.PORT, "0.0.0.0", () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${this.PORT}`);
      });
    } catch (error) {
      console.error("❌ Error al iniciar servidor:", error);
      process.exit(1);
    }
  }
}

// Inicializar aplicación
const appConfig = new AppConfig();
appConfig.start();
