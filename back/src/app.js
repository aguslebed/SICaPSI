import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import authMiddleware from "./middlewares/authMiddleware.js";
import { makeUserController } from "./controllers/userController.js";
const userController = makeUserController();
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
    this.app.use(cors({
      origin: 'http://localhost:5173',
      credentials: true
    }));
    this.app.use(express.json());
    this.app.use(cookieParser());
  }

  /**
   * Responsabilidad 2: Configurar rutas
   */
  configureRoutes() {
    this.app.use("/auth", authRoutes); 
    this.app.get("/user/me", authMiddleware, userController.getUserCompleteData);

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
