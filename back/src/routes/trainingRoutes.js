
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

//Controller
import  {makeTrainingController}  from "../controllers/trainingController.js";

//service
import {TrainingService} from "../services/TrainingService.js"

//Validator
import { TrainingValidator } from "../validators/trainingValidator.js";

//Models
import UserModel from "../models/User.js";
import TrainingModel from "../models/Training.js";
import LevelModel from "../models/Level.js";

// Multer storage for training files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname, "..", "..", "uploads"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `training-${base}-${unique}${ext}`);
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.mp4', '.pdf', '.ppt', '.pptx', '.jpg', '.jpeg', '.png'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'), false);
        }
    }
});



const router = Router();
const trainingService = new TrainingService({
  UserModel: UserModel,
  LevelModel: LevelModel,
  TrainingModel: TrainingModel
});

const controller = makeTrainingController({ 
    trainingService,
    trainingValidator: new TrainingValidator()
 });


router.post("/createTraining", controller.createTraining)
router.get("/getAllActiveTrainings", controller.getAllActiveTrainings)
router.get("/getAllTrainings", controller.getAllTrainings)

// Delete file endpoint (debe ir antes de las rutas con parámetros)
router.delete("/delete-file", (req, res) => {
    try {
        const { filePath } = req.body;
        
        if (!filePath) {
            return res.status(400).json({ message: 'No se proporcionó ruta de archivo' });
        }
        
        // Verificar que es un archivo de uploads
        if (!filePath.startsWith('/uploads/')) {
            return res.status(400).json({ message: 'Ruta de archivo inválida' });
        }
        
        // Construir ruta absoluta
        const absolutePath = path.resolve(__dirname, "..", "..", filePath.replace('/uploads/', 'uploads/'));
        
        // Verificar si el archivo existe
        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        }
        
        // Eliminar archivo
        fs.unlinkSync(absolutePath);
        
        res.status(200).json({ 
            message: 'Archivo eliminado exitosamente',
            filePath: filePath
        });
    } catch (error) {
        console.error('❌ Error eliminando archivo:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.get("/:id", controller.getTrainingById)
router.patch("/:id", controller.updateTraining)
router.delete("/:id", controller.deleteTraining)

// Upload endpoints
router.post("/upload-image", upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se proporcionó archivo' });
        }
        
        const filePath = `/uploads/${req.file.filename}`;
        res.status(200).json({ 
            message: 'Imagen subida exitosamente',
            filePath: filePath,
            originalName: req.file.originalname
        });
    } catch (error) {
        console.error('Error subiendo imagen:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.post("/upload-file", upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se proporcionó archivo' });
        }
        
        const filePath = `/uploads/${req.file.filename}`;
        
        const response = {
            message: 'Archivo subido exitosamente',
            filePath: filePath,
            originalName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
        };
        
        res.status(200).json(response);
    } catch (error) {
        console.error('❌ Error subiendo archivo:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

export default router;