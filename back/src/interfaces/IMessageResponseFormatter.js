export class IMessageResponseFormatter {
  format(messageDoc) {
    throw new Error("Method 'format' must be implemented");
  }
}

export default IMessageResponseFormatter;