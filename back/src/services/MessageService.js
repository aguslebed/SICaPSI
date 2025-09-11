// Servicio concreto para mensajes
import { IMessageService } from '../interfaces/IMessageService.js';

export class MessageService extends IMessageService {
  constructor({ PrivateMessageModel, UsuarioModel, CourseModel }) {
    super();
    this.PrivateMessage = PrivateMessageModel;
    this.Usuario = UsuarioModel;
    this.Course = CourseModel;
  }

  async getMessagesForUser(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return await this.PrivateMessage.find({
      $or: [
        { sender: userId, folder: { $ne: 'trash' } },
        { recipient: userId, folder: { $ne: 'trash' } }
      ],
      createdAt: { $gte: thirtyDaysAgo }
    })
      .populate('sender', 'nombre apellidos email tipo', this.Usuario)
      .populate('recipient', 'nombre apellidos email tipo', this.Usuario)
      .populate('courseId', 'title', this.Course)
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }
}

export default MessageService;
