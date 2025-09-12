// Nuevo controlador desacoplado para usuario y datos completos
import UserResponseFormatter from '../formatters/UserResponseFormatter.js';
import TrainingResponseFormatter from '../formatters/TrainingResponseFormatter.js'; 
import MessageResponseFormatter from '../formatters/MessageResponseFormatter.js'; 
import AppError from '../middlewares/AppError.js';

// Importar modelos
import User from '../models/User.js';
import Training from '../models/Training.js';
import Level from '../models/Level.js'; 
import PrivateMessage from '../models/PrivateMessage.js'; 

// Importar servicios
import UserService from '../services/UserService.js';
import TrainingService from '../services/TrainingService.js'; 
import MessageService from '../services/MessageService.js'; 

// Instanciar servicios pasando los modelos
const userService = new UserService({ UserModel: User });
const trainingService = new TrainingService({ UserModel: User, LevelModel: Level, TrainingModel: Training }); 
const messageService = new MessageService({ PrivateMessageModel: PrivateMessage, UserModel: User, TrainingModel: Training }); 

export const makeUserController = () => ({
  async getUserCompleteData(req, res, next) {
    try {
      const userId = req.params.id || req.user?.userId;
      if (!userId) throw new AppError('ID de usuario requerido', 400);

      // Obtener datos de cada servicio
      const user = await userService.getUserById(userId);
      if (!user) throw new AppError('Usuario no encontrado', 404);
      const training = await trainingService.getCoursesForUser(userId); 
      const mensajes = await messageService.getMessagesForUser(userId); 

      // Formatear datos
      const userFormatted = UserResponseFormatter.toPublic(user);
      const trainingFormatted = training.map(TrainingResponseFormatter.format); 
      const messageFormatted = mensajes.map(MessageResponseFormatter.format); 

      // Estadísticas 
      const unreadMessages = messageFormatted.filter(m => !m.isRead && m.recipient && m.recipient._id === userId).length;
      console.log("datos del curso: ", trainingFormatted)
      // Respuesta final
      res.json({
        user: userFormatted,
        training: trainingFormatted, 
        messages: { 
          total: messageFormatted.length, 
          unread: unreadMessages, 
          items: messageFormatted 
        }, 
        metadata: {
          ultimaActualizacion: new Date(),
          version: '1.0.0'
        }
      });
    } catch (err) {
      next(err);
    }
  }
});

export default makeUserController;
