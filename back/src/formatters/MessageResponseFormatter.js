// Formatter para mensajes
import { IMensaje } from '../interfaces/IMensaje.js';

export class MessageResponseFormatter {
  static format(mensaje) {
    return {
      _id: mensaje._id,
      sender: mensaje.sender,
      recipient: mensaje.recipient,
      courseId: mensaje.courseId,
      subject: mensaje.subject,
      message: mensaje.message,
      attachments: mensaje.attachments,
      status: mensaje.status,
      isRead: mensaje.isRead,
      folder: mensaje.folder,
      createdAt: mensaje.createdAt
    };
  }
}

export default MessageResponseFormatter;
