export class ITokenService {
  sign(payload, options) {
    throw new Error("Method 'sign' must be implemented");
  }
  verify(token) {
    throw new Error("Method 'verify' must be implemented");
  }
}

export default ITokenService;