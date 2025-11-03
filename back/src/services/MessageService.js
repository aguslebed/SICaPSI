// Servicio concreto para mensajes
import { IMessageService } from '../interfaces/IMessageService.js';
import mongoose from 'mongoose';
import MessageRepository from '../repositories/MessageRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import TrainingRepository from '../repositories/TrainingRepository.js';
import {
  isMessageOwner,
  isRecipient,
  determineRestoreFolder,
  isInTrash,
  getThirtyDaysAgo,
  looksLikeEmail,
  createRecipientNotFoundError,
  createMessageNotFoundError,
  createUnauthorizedError,
  createDeleteFromTrashError,
  createMessagingPermissionError
} from '../utils/MessageValidator.js';
import { objectIdsToStrings, createSenderNotFoundError } from '../utils/UserValidator.js';

export class MessageService extends IMessageService {
  /**
   * Constructor con inyección de dependencias
   * @param {Object} dependencies - Dependencias del servicio
   * @param {Object} dependencies.PrivateMessageModel - Modelo PrivateMessage (para retrocompatibilidad)
   * @param {Object} dependencies.UserModel - Modelo User (para retrocompatibilidad)
   * @param {Object} dependencies.TrainingModel - Modelo Training (para retrocompatibilidad)
   * @param {MessageRepository} dependencies.messageRepo - Repositorio de mensajes
   * @param {UserRepository} dependencies.userRepo - Repositorio de usuarios
   * @param {TrainingRepository} dependencies.trainingRepo - Repositorio de capacitaciones
   */
  constructor(dependencies = {}) {
    super();
    // Mantener retrocompatibilidad con modelos directos
    this.PrivateMessage = dependencies.PrivateMessageModel;
    this.User = dependencies.UserModel;
    this.Training = dependencies.TrainingModel;
    
    // DIP: Inyección de repositorios (con defaults para producción)
    this.messageRepo = dependencies.messageRepo || new MessageRepository();
    this.userRepo = dependencies.userRepo || new UserRepository();
    this.trainingRepo = dependencies.trainingRepo || new TrainingRepository();
  }

  async getMessageById(id) {
    return this.messageRepo.findById(id);
  }

  async getMessagesForUser(userId) {
    // Usar función pura para calcular fecha
    const thirtyDaysAgo = getThirtyDaysAgo();
    
    // Configurar filtro y populate
    const filter = {
      createdAt: { $gte: thirtyDaysAgo },
      $or: [
        { sender: userId, folder: { $in: ['sent', 'trash'] } },
        { recipient: userId, folder: { $in: ['inbox', 'trash'] } }
      ]
    };
    
    const populateOptions = [
      { path: 'sender', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'recipient', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'trainingId', select: 'title', model: this.Training }
    ];
    
    // Usar repositorio para buscar
    return await this.messageRepo.findWithPopulate(
      filter,
      populateOptions,
      { createdAt: -1 },
      50
    );
  }

  async send({ senderId, recipientEmail, recipientId, subject, message, attachments, trainingId }) {
    let recipient = null;
    
    if (recipientId) {
      // Usar función pura para determinar si parece email
      if (looksLikeEmail(recipientId)) {
        recipient = await this.userRepo.findByEmailDocument(recipientId);
      } else if (mongoose.Types.ObjectId.isValid(recipientId)) {
        recipient = await this.userRepo.findByIdDocument(recipientId);
      } else {
        // Fallback: intentar buscar por email
        recipient = await this.userRepo.findByEmailDocument(recipientId);
      }
    } else if (recipientEmail) {
      recipient = await this.userRepo.findByEmailDocument(recipientEmail);
    }
    
    if (!recipient) throw new Error(createRecipientNotFoundError());

    const sender = await this.userRepo.findById(senderId, 'role assignedTraining');
    if (!sender) throw new Error(createSenderNotFoundError());

    const trainingIdStr = trainingId?.toString?.() || (trainingId != null ? String(trainingId) : null);
    const senderRole = (sender.role || '').toLowerCase();
    const recipientRole = (recipient.role || '').toLowerCase();
    const senderTrainings = objectIdsToStrings(sender.assignedTraining);
    const recipientTrainings = objectIdsToStrings(recipient.assignedTraining);
    const shareTraining = trainingIdStr
      ? senderTrainings.includes(trainingIdStr) && recipientTrainings.includes(trainingIdStr)
      : false;

    let allowed = true;
    if (senderRole === 'alumno') {
      allowed = shareTraining && (recipientRole === 'alumno' || recipientRole === 'capacitador');
    } else if (senderRole === 'capacitador') {
      allowed = shareTraining && recipientRole === 'alumno';
    }

    if (!allowed) {
      throw new Error(createMessagingPermissionError());
    }

    const payload = {
      sender: senderId,
      recipient: recipient._id,
      subject,
      message,
      attachments: attachments || [],
      trainingId: trainingId || undefined
    };

    // Crea dos copias: una para el remitente (sent) y otra para el destinatario (inbox)
    const [senderDoc, recipientDoc] = await this.messageRepo.createMany([
      { ...payload, status: 'sent', folder: 'sent', isRead: true },
      { ...payload, status: 'received', folder: 'inbox', isRead: false }
    ]);

    // Usar repositorio para populate
    const populateOptions = [
      { path: 'sender', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'recipient', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'trainingId', select: 'title', model: this.Training }
    ];
    
    const populated = await this.messageRepo.findByIdWithPopulate(senderDoc._id, populateOptions);
    return populated;
  }

  async setRead({ messageId, userId, isRead }) {
    // Usar repositorio para obtener mensaje
    const msg = await this.messageRepo.findById(messageId);
    if (!msg) throw new Error(createMessageNotFoundError());
    
    // Validar con función pura
    if (!isRecipient(msg, userId)) throw new Error(createUnauthorizedError());
    
    msg.isRead = !!isRead;
    await msg.save();
    
    // Populate usando modelo directo (operación específica)
    await msg.populate([
      { path: 'sender', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'recipient', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'trainingId', select: 'title', model: this.Training }
    ]);
    return msg;
  }

  async moveToTrash({ messageId, userId }) {
    // Usar repositorio para obtener mensaje
    const msg = await this.messageRepo.findById(messageId);
    if (!msg) throw new Error(createMessageNotFoundError());
    
    // Validar con función pura
    if (!isMessageOwner(msg, userId)) throw new Error(createUnauthorizedError());
    
    msg.folder = 'trash';
    await msg.save();
    
    // Populate usando modelo directo
    await msg.populate([
      { path: 'sender', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'recipient', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'trainingId', select: 'title', model: this.Training }
    ]);
    return msg;
  }

  async restore({ messageId, userId }) {
    // Usar repositorio para obtener mensaje
    const msg = await this.messageRepo.findById(messageId);
    if (!msg) throw new Error(createMessageNotFoundError());
    
    // Validar con función pura
    if (!isMessageOwner(msg, userId)) throw new Error(createUnauthorizedError());
    
    // Usar función pura para determinar carpeta
    const backFolder = determineRestoreFolder(msg, userId);
    msg.folder = backFolder;
    await msg.save();
    
    // Populate usando modelo directo
    await msg.populate([
      { path: 'sender', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'recipient', select: 'firstName lastName email role profileImage', model: this.User },
      { path: 'trainingId', select: 'title', model: this.Training }
    ]);
    return msg;
  }

  async deletePermanent({ messageId, userId }) {
    // Usar repositorio para obtener mensaje
    const msg = await this.messageRepo.findById(messageId);
    if (!msg) return { deleted: false };
    
    // Validar con funciones puras
    if (!isMessageOwner(msg, userId)) throw new Error(createUnauthorizedError());
    if (!isInTrash(msg)) throw new Error(createDeleteFromTrashError());
    
    // Usar repositorio para eliminar
    await this.messageRepo.deleteById(messageId);
    return { deleted: true };
  }
}

export default MessageService;
