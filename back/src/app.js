import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import trainingRoutes from "./routes/trainingRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import levelRoutes from "./routes/levelRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";


// __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    // Ensure uploads directory exists and serve it statically
    const uploadsDir = path.resolve(__dirname, "..", "uploads");
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch (e) {
      console.error("No se pudo crear el directorio de uploads:", e);
    }
    this.app.use("/uploads", express.static(uploadsDir));
  }

  /**
   * Responsabilidad 2: Configurar rutas
   */ 
  configureRoutes() {
    this.app.use("/users", userRoutes);
    this.app.use("/auth", authRoutes);
    this.app.use("/messages", messageRoutes);
    this.app.use("/training", trainingRoutes);
    this.app.use("/enrollment", enrollmentRoutes);
    this.app.use("/level", levelRoutes);
    this.app.use("/progress", progressRoutes);
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
