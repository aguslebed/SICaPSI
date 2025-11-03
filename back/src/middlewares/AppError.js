class AppError extends Error {
  constructor(message, statusCode = 500, code = "ERR", details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    // Always keep details as an array (or null if explicitly passed as null)
    this.details = details == null ? [] : details;
  }
}
export default AppError;