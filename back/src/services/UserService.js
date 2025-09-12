// Servicio concreto para usuario
import { IUserService } from '../interfaces/IUserService.js';

export class UserService extends IUserService {
  constructor({ UserModel }) {
    super();
    this.User = UserModel;
  }

  async getUserById(id) {
  return await this.User.findById(id).exec();
  }
}

export default UserService;
