// Interface para el servicio de mensajes
export class IMessageService {
  async getMessagesForUser(userId) { throw new Error('Not implemented'); }
  async send({ senderId, recipientEmail, recipientId, subject, message, attachments }) { throw new Error('Not implemented'); }
  async setRead({ messageId, userId, isRead }) { throw new Error('Not implemented'); }
  async moveToTrash({ messageId, userId }) { throw new Error('Not implemented'); }
  async restore({ messageId, userId }) { throw new Error('Not implemented'); }
  async deletePermanent({ messageId, userId }) { throw new Error('Not implemented'); }
}
