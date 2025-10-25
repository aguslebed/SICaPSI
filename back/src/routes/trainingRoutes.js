
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

//Controller
import  {makeTrainingController}  from "../controllers/trainingController.js";

//service
import {TrainingService} from "../services/TrainingService.js"
import { JwtTokenService } from "../services/JwtTokenService.js";
import makeAuthMiddleware from "../middlewares/authMiddleware.js";

//Validator
import { TrainingValidator } from "../validators/trainingValidator.js";

//Models
import UserModel from "../models/User.js";
import TrainingModel from "../models/Training.js";
import LevelModel from "../models/Level.js";

// Multer storage for training files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurar que exista la carpeta base de uploads
const baseUploadsDir = path.resolve(__dirname, "..", "..", "uploads");
if (!fs.existsSync(baseUploadsDir)) {
    fs.mkdirSync(baseUploadsDir, { recursive: true });
    console.log('✅ Carpeta uploads creada:', baseUploadsDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            // Siempre guardar en carpeta temporal al subir
            const uploadDir = path.resolve(__dirname, "..", "..", "uploads", "temp");
            
            // Crear directorio si no existe
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
                console.log('✅ Carpeta temporal creada:', uploadDir);
            }
            
            cb(null, uploadDir);
        } catch (error) {
            console.error('❌ Error creando directorio:', error);
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${base}-${unique}${ext}`);
    }
});
const upload = multer({ 
    storage,
    limits: { 
        fileSize: 100 * 1024 * 1024, // 100MB limit para archivos
        fieldSize: 25 * 1024 * 1024  // 25MB limit para campos de texto (HTML con formato puede ser extenso)
    },
    fileFilter: (req, file, cb) => {
        // Lista ampliada de tipos de archivo permitidos
        const allowedTypes = [
            // Videos
            '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.m4v', '.mpeg', '.mpg', '.3gp',
            // Documentos
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.odt', '.ods', '.odp',
            // Imágenes
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico', '.tiff', '.tif',
            // Audio
            '.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.wma', '.aiff', '.ape',
            // Comprimidos
            '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
            // Otros
            '.json', '.xml', '.csv', '.html', '.css', '.js', '.epub', '.mobi'
        ];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Tipo de archivo no permitido: ${ext}. Contacte al administrador si necesita subir este tipo de archivo.`), false);
        }
    }
});



const router = Router();
const trainingService = new TrainingService({
  UserModel: UserModel,
  LevelModel: LevelModel,
  TrainingModel: TrainingModel
});

const resolvedSecret = (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
    ? process.env.JWT_SECRET
    : (process.env.NODE_ENV === 'production' ? null : 'dev_secret_please_override_0123456789abcdef');
const jwtTokenService = new JwtTokenService({ secret: resolvedSecret });
const authMiddleware = makeAuthMiddleware({ tokenService: jwtTokenService });

const adminMiddleware = (req, res, next) => {
    if (!req.user || !['Administrador', 'Directivo'].includes(req.user.role)) {
        return res.status(403).json({
            message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
    }
    next();
};

const controller = makeTrainingController({ 
    trainingService,
    trainingValidator: new TrainingValidator()
 });


router.post("/createTraining", authMiddleware, adminMiddleware, controller.createTraining)
router.get("/getAllActiveTrainings", authMiddleware, controller.getAllActiveTrainings)
router.get("/getAllTrainings", authMiddleware, adminMiddleware, controller.getAllTrainings)

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
            console.warn('⚠️ Archivo no encontrado, continuando:', filePath);
            return res.status(200).json({ 
                message: 'Archivo no encontrado (ya eliminado)',
                filePath: filePath
            });
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

// Replace file endpoint - Reemplazar archivo antiguo con uno nuevo
router.post("/replace-file", upload.single('file'), (req, res) => {
    try {
        const { oldFilePath, trainingId } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'No se proporcionó archivo nuevo' });
        }
        
        if (!trainingId) {
            return res.status(400).json({ message: 'Se requiere trainingId' });
        }
        
        // Si hay archivo antiguo, eliminarlo
        if (oldFilePath && oldFilePath !== '__PENDING_UPLOAD__' && oldFilePath.startsWith('/uploads/')) {
            const oldAbsolutePath = path.resolve(__dirname, "..", "..", oldFilePath.replace('/uploads/', 'uploads/'));
            
            if (fs.existsSync(oldAbsolutePath)) {
                fs.unlinkSync(oldAbsolutePath);
            }
        }
        
        // Mover el nuevo archivo de temp a la carpeta del training
        const tempPath = req.file.path;
        const finalFolder = path.resolve(__dirname, "..", "..", "uploads", "trainings", trainingId);
        
        if (!fs.existsSync(finalFolder)) {
            fs.mkdirSync(finalFolder, { recursive: true });
        }
        
        const finalPath = path.join(finalFolder, req.file.filename);
        fs.renameSync(tempPath, finalPath);
        
        const newFilePath = `/uploads/trainings/${trainingId}/${req.file.filename}`;
        
        res.status(200).json({
            message: 'Archivo reemplazado exitosamente',
            filePath: newFilePath,
            originalName: req.file.originalname,
            fileSize: req.file.size
        });
    } catch (error) {
        console.error('❌ Error reemplazando archivo:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

router.get("/revisions/pending", authMiddleware, adminMiddleware, controller.listRevisions);
router.get("/:id", authMiddleware, controller.getTrainingById);
router.get("/:id/trainer", authMiddleware, controller.getTrainerByTrainingId);
router.patch("/:id", authMiddleware, adminMiddleware, controller.updateTraining);
router.patch("/:id/revision/:revisionId/approve", authMiddleware, adminMiddleware, controller.approveRevision);
router.patch("/:id/revision/:revisionId/reject", authMiddleware, adminMiddleware, controller.rejectRevision);
router.delete("/:id", authMiddleware, adminMiddleware, controller.deleteTraining);

// Upload endpoints
router.post("/upload-image", upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se proporcionó archivo' });
        }
        
        // Guardar en temp, devolver ruta temporal
        const tempPath = `/uploads/temp/${req.file.filename}`;
        console.log('✅ Imagen subida a temporal:', tempPath);
        res.status(200).json({ 
            message: 'Imagen subida exitosamente',
            filePath: tempPath,
            originalName: req.file.originalname
        });
    } catch (error) {
        console.error('Error subiendo imagen:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Mover archivos de carpeta temporal a carpeta definitiva con trainingId
router.post("/move-temp-files", (req, res) => {
    try {
        const { trainingId, tempFiles } = req.body;
        
        if (!trainingId || !Array.isArray(tempFiles) || tempFiles.length === 0) {
            return res.status(400).json({ message: 'Se requiere trainingId y tempFiles (array)' });
        }
        
        const tempFolder = path.resolve(__dirname, "..", "..", "uploads", "temp");
        const finalFolder = path.resolve(__dirname, "..", "..", "uploads", "trainings", trainingId);
        
        // Crear carpeta final si no existe
        if (!fs.existsSync(finalFolder)) {
            fs.mkdirSync(finalFolder, { recursive: true });
            console.log('✅ Carpeta de training creada:', finalFolder);
        }
        
        const movedFiles = [];
        
        // Mover cada archivo especificado
        for (const tempPath of tempFiles) {
            // Extraer nombre del archivo de la ruta /uploads/temp/filename
            const filename = path.basename(tempPath);
            const sourcePath = path.join(tempFolder, filename);
            const destPath = path.join(finalFolder, filename);
            
            if (!fs.existsSync(sourcePath)) {
                console.warn(`⚠️ Archivo temporal no encontrado: ${sourcePath}`);
                continue;
            }
            
            // Mover archivo
            fs.renameSync(sourcePath, destPath);
            
            movedFiles.push({
                oldPath: tempPath,
                newPath: `/uploads/trainings/${trainingId}/${filename}`
            });
        }
        
        console.log(`✅ Movidos ${movedFiles.length} archivos a training ${trainingId}`);
        
        res.status(200).json({
            message: 'Archivos movidos exitosamente',
            movedFiles: movedFiles
        });
    } catch (error) {
        console.error('❌ Error moviendo archivos:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

router.post("/upload-file", upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se proporcionó archivo' });
        }
        
        // Guardar en temp, devolver ruta temporal
        const tempPath = `/uploads/temp/${req.file.filename}`;
        
        console.log('✅ Archivo subido a temporal:', { tempPath, size: req.file.size });
        
        const response = {
            message: 'Archivo subido exitosamente',
            filePath: tempPath,
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