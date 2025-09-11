// Servicio concreto para usuario
import { IUserService } from '../interfaces/IUserService.js';

export class UserService extends IUserService {
  constructor({ UsuarioModel }) {
    super();
    this.Usuario = UsuarioModel;
  }

  async getUserById(id) {
    return await this.Usuario.findById(id).exec();
  }
}

export default UserService;
