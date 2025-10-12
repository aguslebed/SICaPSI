// Servicio concreto para mensajes
import { IMessageService } from '../interfaces/IMessageService.js';
import mongoose from 'mongoose';

export class MessageService extends IMessageService {
  constructor({ PrivateMessageModel, UserModel, TrainingModel }) {
    super();
    this.PrivateMessage = PrivateMessageModel;
    this.User = UserModel;
    this.Training = TrainingModel;
  }

  async getMessageById(id) {
    return this.PrivateMessage.findById(id).exec();
  }

  async getMessagesForUser(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return await this.PrivateMessage.find({
      createdAt: { $gte: thirtyDaysAgo },
      $or: [
        // Si el usuario es el remitente, solo traer su copia (sent o trash)
        { sender: userId, folder: { $in: ['sent', 'trash'] } },
        // Si el usuario es el destinatario, solo traer su copia (inbox o trash)
        { recipient: userId, folder: { $in: ['inbox', 'trash'] } }
      ]
    })
      .populate('sender', 'firstName lastName email role profileImage', this.User)
      .populate('recipient', 'firstName lastName email role profileImage', this.User)
      .populate('trainingId', 'title', this.Training)
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async send({ senderId, recipientEmail, recipientId, subject, message, attachments, trainingId }) {
    let recipient = null;
    if (recipientId) {
      // Si recipientId parece un email o no es un ObjectId válido, buscar por email
      if (typeof recipientId === 'string' && recipientId.includes('@')) {
        recipient = await this.User.findOne({ email: recipientId });
      } else if (mongoose.Types.ObjectId.isValid(recipientId)) {
        recipient = await this.User.findById(recipientId);
      } else {
        // Fallback: intentar buscar por email
        recipient = await this.User.findOne({ email: recipientId });
      }
    } else if (recipientEmail) {
      recipient = await this.User.findOne({ email: recipientEmail });
    }
    if (!recipient) throw new Error('Destinatario no encontrado');

    const payload = {
      sender: senderId,
      recipient: recipient._id,
      subject,
      message,
      attachments: attachments || [],
      trainingId: trainingId || undefined
    };

    // Crea dos copias: una para el remitente (sent) y otra para el destinatario (inbox)
    const [senderDoc, recipientDoc] = await Promise.all([
      this.PrivateMessage.create({ ...payload, status: 'sent', folder: 'sent', isRead: true }),
      this.PrivateMessage.create({ ...payload, status: 'received', folder: 'inbox', isRead: false })
    ]);

    const populated = await senderDoc.populate([
      { path: 'sender', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'recipient', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'trainingId', select: 'title', model: this.Training }
    ]);
    return populated;
  }

  async setRead({ messageId, userId, isRead }) {
    const msg = await this.PrivateMessage.findById(messageId);
    if (!msg) throw new Error('Mensaje no encontrado');
    // Solo el destinatario puede marcar como leído
    if (msg.recipient?.toString() !== userId.toString()) throw new Error('No autorizado');
    msg.isRead = !!isRead;
    await msg.save();
    await msg.populate([
      { path: 'sender', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'recipient', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'trainingId', select: 'title', model: this.Training }
    ]);
    return msg;
  }

  async moveToTrash({ messageId, userId }) {
    const msg = await this.PrivateMessage.findById(messageId);
    if (!msg) throw new Error('Mensaje no encontrado');
    // Puede mover a papelera si es el remitente o destinatario
    const isOwner = [msg.sender?.toString(), msg.recipient?.toString()].includes(userId.toString());
    if (!isOwner) throw new Error('No autorizado');
    msg.folder = 'trash';
    await msg.save();
    await msg.populate([
      { path: 'sender', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'recipient', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'trainingId', select: 'title', model: this.Training }
    ]);
    return msg;
  }

  async restore({ messageId, userId }) {
    const msg = await this.PrivateMessage.findById(messageId);
    if (!msg) throw new Error('Mensaje no encontrado');
    const isOwner = [msg.sender?.toString(), msg.recipient?.toString()].includes(userId.toString());
    if (!isOwner) throw new Error('No autorizado');
    // Regla simple: si el user es el destinatario => vuelve a inbox; si es el remitente => vuelve a sent
    const backFolder = msg.recipient?.toString() === userId.toString() ? 'inbox' : 'sent';
    msg.folder = backFolder;
    await msg.save();
    await msg.populate([
      { path: 'sender', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'recipient', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'trainingId', select: 'title', model: this.Training }
    ]);
    return msg;
  }

  async deletePermanent({ messageId, userId }) {
    const msg = await this.PrivateMessage.findById(messageId);
    if (!msg) return { deleted: false };
    const isOwner = [msg.sender?.toString(), msg.recipient?.toString()].includes(userId.toString());
    if (!isOwner) throw new Error('No autorizado');
    if (msg.folder !== 'trash') throw new Error('Solo se pueden eliminar definitivamente los mensajes en papelera');
    await this.PrivateMessage.deleteOne({ _id: messageId });
    return { deleted: true };
  }
}

export default MessageService;
