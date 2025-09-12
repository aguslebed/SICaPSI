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


export function makeUserController() {
  return {

    async create(req, res, next) {
      try {
        const user = await userService.create(req.body);
        res.status(201).json(UserResponseFormatter.toPublic(user));
      } catch (err) { next(err); }
    },

    async list(req, res, next) {
      try {
        const users = await userService.list(req.query);
        res.json(UserResponseFormatter.toPublicList(users));
      } catch (err) { next(err); }
    },

    async getById(req, res, next) {
      try {
        let userId = req.params.id;
        if (!userId) throw new AppError('ID de usuario requerido', 400);
        const user = await userService.getById(userId);
        if (!user) throw new AppError('Usuario no encontrado', 404);
        res.json(UserResponseFormatter.toPublic(user));
      } catch (err) { next(err); }
    },

    async update(req, res, next) {
      try {
        const user = await userService.update(req.params.id, req.body);
        res.json(UserResponseFormatter.toPublic(user));
      } catch (err) { next(err); }
    },

    async getUserCompleteData(req, res, next) {
      try {
        const userId = req.params.id || req.user?.userId;
        if (!userId) throw new AppError('ID de usuario requerido', 400);
        const user = await userService.getById(userId);
        if (!user) throw new AppError('Usuario no encontrado', 404);
        const training = await trainingService.getCoursesForUser(userId);
        const mensajes = await messageService.getMessagesForUser(userId);
        const userFormatted = UserResponseFormatter.toPublic(user);
        const trainingFormatted = training.map(TrainingResponseFormatter.format);
        const messageFormatted = mensajes.map(MessageResponseFormatter.format);
        const unreadMessages = messageFormatted.filter(m => !m.isRead && m.recipient && m.recipient._id === userId).length;
        console.log(training);
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
      } catch (err) { next(err); }
    }
  };
}

export default makeUserController;
