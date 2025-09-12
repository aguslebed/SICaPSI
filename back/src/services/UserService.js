// Servicio concreto para usuario
import { IUserService } from '../interfaces/IUserService.js';

export class UserService extends IUserService {
  constructor({ UserModel }) {
    super();
    this.User = UserModel;
  }

  async getById(id) {
  return await this.User.findById(id).exec();
  }

  async create(data) {
    const exists = await this.User.findOne({ email: data.email });
    if (exists) {
      throw new Error("El mail ya está registrado");
    }
    // Hash de contraseña si existe el campo
    if (data.password) {
      const bcrypt = await import('bcryptjs');
      data.password = await bcrypt.default.hash(data.password, 10);
    }
    const entity = new this.User({
      ...data,
      ultimoIngreso: data.ultimoIngreso ?? null,
      legajo: data.legajo ?? null,
      imagenPerfil: data.imagenPerfil ?? null
    });
    return await entity.save();
  }

  async list(query) {
    // Puedes agregar paginación si lo necesitas
    return await this.User.find().sort({ createdAt: -1 }).exec();
  }

  async update(id, patch) {
    if (patch.password) {
      const bcrypt = await import('bcryptjs');
      patch.password = await bcrypt.default.hash(patch.password, 10);
    }
    const updated = await this.User.findByIdAndUpdate(id, patch, { new: true }).exec();
    if (!updated) {
      throw new Error("Usuario no encontrado");
    }
    return updated;
  }
}

export default UserService;
