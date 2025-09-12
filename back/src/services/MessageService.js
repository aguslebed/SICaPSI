// Servicio concreto para mensajes
import { IMessageService } from '../interfaces/IMessageService.js';

export class MessageService extends IMessageService {
  constructor({ PrivateMessageModel, UserModel, TrainingModel }) {
    super();
    this.PrivateMessage = PrivateMessageModel;
    this.User = UserModel;
    this.Training = TrainingModel;
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
  .populate('sender', 'firstName lastName email role', this.User)
  .populate('recipient', 'firstName lastName email role', this.User)
  .populate('trainingId', 'title', this.Training)
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }
}

export default MessageService;
