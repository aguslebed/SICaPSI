// Controlador desacoplado que orquesta servicios y formatters
import AppError from '../middlewares/AppError.js';

export function makeUserController({ userService, trainingService, messageService, userFormatter, trainingFormatter, messageFormatter }) {
  return {

    async create(req, res, next) {
      try {
        const user = await userService.create(req.body);
        res.status(201).json(userFormatter.toPublic(user));
      } catch (err) { next(err); }
    },

    async list(req, res, next) {
      try {
        const users = await userService.list(req.query);
        res.json(userFormatter.toPublicList(users));
      } catch (err) { next(err); }
    },

    async getById(req, res, next) {
      try {
        let userId = req.params.id;
        if (!userId) throw new AppError('ID de usuario requerido', 400);
        const user = await userService.getById(userId);
        if (!user) throw new AppError('Usuario no encontrado', 404);
        res.json(userFormatter.toPublic(user));
      } catch (err) { next(err); }
    },

    async update(req, res, next) {
      try {
        const user = await userService.update(req.params.id, req.body);
        res.json(userFormatter.toPublic(user));
      } catch (err) { next(err); }
    },

    async getUserCompleteData(req, res, next) {
      try {
        const userId = req.params.id || req.user?.userId;
        if (!userId) throw new AppError('ID de usuario requerido', 400);
        const [user, training, mensajes] = await Promise.all([
          userService.getById(userId),
          trainingService.getCoursesForUser(userId),
          messageService.getMessagesForUser(userId)
        ]);
        if (!user) throw new AppError('Usuario no encontrado', 404);
        const userFormatted = userFormatter.toPublic(user);
        const trainingFormatted = training.map(t => trainingFormatter.format(t));
        const messageFormatted = mensajes.map(m => messageFormatter.format(m));
        const uidStr = userId.toString();
        const unreadMessages = messageFormatted.filter(m => {
          const recipientId = m?.recipient?._id?.toString?.() ?? m?.recipient?.toString?.();
          return !m.isRead && recipientId === uidStr;
        }).length;
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
