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

    async uploadProfileImage(req, res, next) {
      try {
        const userId = req.params.id;
        if (!userId) throw new AppError('ID de usuario requerido', 400);
        if (!req.file) throw new AppError('Archivo de imagen requerido', 400);

        // Build public URL path
        const filePath = `/uploads/${req.file.filename}`;
        const user = await userService.update(userId, { profileImage: filePath });
        res.status(200).json({ user: userFormatter.toPublic(user), profileImage: filePath });
      } catch (err) { next(err); }
    },

    async changePassword(req, res, next) {
      try {
        const { currentPassword, newPassword, confirmPassword } = req.body || {};
        if (!currentPassword || !newPassword || !confirmPassword) {
          throw new AppError('Campos requeridos: currentPassword, newPassword, confirmPassword', 400);
        }
        if (newPassword !== confirmPassword) {
          throw new AppError('La confirmación de contraseña no coincide', 400);
        }
        // El usuario autenticado viene del middleware
        const authUserId = req.user?.userId;
        if (!authUserId) throw new AppError('No autorizado', 401);
        await userService.changePassword(authUserId, currentPassword, newPassword);
        res.json({ message: 'Contraseña actualizada' });
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
