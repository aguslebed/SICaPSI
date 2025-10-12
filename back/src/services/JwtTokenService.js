import jwt from "jsonwebtoken";
import { ITokenService } from "../interfaces/ITokenService.js";

export class JwtTokenService extends ITokenService {
  constructor({ secret, defaultExpiresIn = "12h" } = {}) {
    super();
    if (!secret || secret.length < 32) {
      throw new Error("JWT secret inválido o ausente");
    }
    this.secret = secret;
    this.defaultExpiresIn = defaultExpiresIn;
  }

  sign(payload, options) {
    const expiresIn = options?.expiresIn ?? this.defaultExpiresIn;
    return jwt.sign(payload, this.secret, { expiresIn });
  }

  verify(token) {
    return jwt.verify(token, this.secret);
  }
}

export default JwtTokenService;