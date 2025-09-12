// Formatter para mensajes
import { IMensaje } from '../interfaces/IMensaje.js';

export class MessageResponseFormatter extends IMensaje{
  static format(message) {
    return {
      _id: message._id,
      sender: message.sender,
      recipient: message.recipient,
      trainingId: message.trainingId,
      subject: message.subject,
      message: message.message,
      attachments: message.attachments,
      status: message.status,
      isRead: message.isRead,
      folder: message.folder,
      createdAt: message.createdAt
    };
  }
}

export default MessageResponseFormatter;
