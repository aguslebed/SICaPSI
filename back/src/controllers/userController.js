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
        // Excluir el administrador principal por seguridad
        const filteredUsers = users.filter(user => user.email !== 'admin@sicapsi.com');
        res.json(userFormatter.toPublicList(filteredUsers));
      } catch (err) { next(err); }
    },

    async listRecipients(req, res, next) {
      try {
        const senderId = req.user?.userId;
        if (!senderId) throw new AppError('No autorizado', 401);
        const { trainingId } = req.query || {};
        const recipients = await userService.findRecipientsForCompose({ senderId, trainingId });
        res.json(userFormatter.toPublicList(recipients));
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
        // Verificar si se está intentando actualizar el administrador principal
        const user = await userService.getById(req.params.id);
        if (user && user.email === 'admin@sicapsi.com') {
          return res.status(403).json({ 
            message: 'No se puede modificar el administrador principal por razones de seguridad.' 
          });
        }
        
        const updatedUser = await userService.update(req.params.id, req.body);
        res.json(userFormatter.toPublic(updatedUser));
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
    },

    /**
     * Método para listar todos los profesores/trainers
     * Respeta SRP: Solo maneja la obtención y formateo de profesores
     * Respeta DIP: Depende de abstracciones (userService, userFormatter)
     */
    async listTeachers(req, res, next) {
      try {
        const teachers = await userService.getTeachers();
        res.json(userFormatter.toPublicList(teachers));
      } catch (err) { 
        next(err); 
      }
    },

    /**
     * Método para actualizar el estado de un profesor
     * Respeta SRP: Solo maneja el cambio de estado de profesores
     * Respeta OCP: Extiende funcionalidad sin modificar código existente
     */
    async updateTeacherStatus(req, res, next) {
      try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id) {
          throw new AppError('ID de profesor requerido', 400);
        }

        // Verificar si se está intentando cambiar el estado del administrador principal
        const user = await userService.getById(id);
        if (user && user.email === 'admin@sicapsi.com') {
          return res.status(403).json({ 
            message: 'No se puede modificar el estado del administrador principal.' 
          });
        }

        if (!status || !['available', 'disabled', 'pendiente'].includes(status)) {
          throw new AppError('Estado inválido. Use: available, disabled o pendiente', 400);
        }

        const updatedTeacher = await userService.updateTeacherStatus(id, status);
        
        if (!updatedTeacher) {
          throw new AppError('Profesor no encontrado', 404);
        }

        res.json({
          message: 'Estado del profesor actualizado exitosamente',
          teacher: userFormatter.toPublic(updatedTeacher)
        });
        
      } catch (err) { 
        next(err); 
      }
    },

    /**
     * Método para obtener un profesor específico
     * Respeta SRP: Solo obtiene y formatea datos de un profesor
     */
    async getTeacherById(req, res, next) {
      try {
        const { id } = req.params;
        
        if (!id) {
          throw new AppError('ID de profesor requerido', 400);
        }

        const teacher = await userService.getTeacherById(id);
        
        if (!teacher) {
          throw new AppError('Profesor no encontrado', 404);
        }

        res.json(userFormatter.toPublic(teacher));
        
      } catch (err) { 
        next(err); 
      }
    },

      /**
   * Elimina un usuario por su ID
   */
    async deleteUser(req, res, next) {
      try {
        const userId = req.params.id;
        if (!userId) throw new AppError('ID de usuario requerido', 400);
        
        // Verificar si se está intentando eliminar el administrador principal
        const user = await userService.getById(userId);
        if (user && user.email === 'admin@sicapsi.com') {
          return res.status(403).json({ 
            message: 'No se puede eliminar el administrador principal por razones de seguridad.' 
          });
        }
        
        const deletedUser = await userService.delete(userId);
        if (!deletedUser) throw new AppError('Usuario no encontrado', 404);

        res.json({ message: 'Usuario eliminado exitosamente', user: userFormatter.toPublic(deletedUser) });
      } catch (err) {
        next(err);
      }
    },
}
}

export default makeUserController;
