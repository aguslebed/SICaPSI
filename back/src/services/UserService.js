// Servicio concreto para usuario
import { IUserService } from '../interfaces/IUserService.js';

export class UserService extends IUserService {
  constructor({ UserModel, TrainingModel }) {
    super();
    this.User = UserModel;
    this.Training = TrainingModel;
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
      role: data.role || "Alumno", // Por defecto todos los nuevos usuarios son Alumno
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

  /**
   * Retorna destinatarios permitidos para redactar mensajes según cursos del remitente.
   * - Profesores: usuarios que figuran como createdBy de los trainings del remitente
   * - Compañeros: estudiantes que comparten al menos uno de esos trainings
   */
  async findRecipientsForCompose({ senderId, trainingId }) {
    const sender = await this.User.findById(senderId).select('assignedTraining role').lean();
    if (!sender) throw new Error('Usuario remitente no encontrado');

    const assigned = (sender.assignedTraining || []).map((id) => id.toString());
    let trainingScope = assigned;
    if (trainingId) {
      const tStr = trainingId.toString();
      if (assigned.includes(tStr)) {
        trainingScope = [tStr];
      }
    }

    // Profesores: createdBy de trainings dentro del scope
    const trainings = await this.Training.find({ _id: { $in: trainingScope } }).select('createdBy').lean();
    const teacherIds = [...new Set(trainings.map(t => t.createdBy?.toString()).filter(Boolean))];

    // Compañeros: estudiantes que comparten al menos un training del scope
    const classmates = await this.User.find({
      _id: { $ne: senderId },
      role: 'Student',
      assignedTraining: { $in: trainingScope }
    }).select('firstName lastName email role assignedTraining').lean();

    // Profesores (cualquier rol) identificados por createdBy
    const teachers = teacherIds.length
      ? await this.User.find({ _id: { $in: teacherIds } }).select('firstName lastName email role').lean()
      : [];

    // Unificar y devolver únicos por _id
    const byId = new Map();
    for (const u of [...teachers, ...classmates]) {
      byId.set(u._id.toString(), u);
    }
    return Array.from(byId.values());
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

  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.User.findById(userId).exec();
    if (!user) throw new Error('Usuario no encontrado');
    const bcrypt = (await import('bcryptjs')).default;
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) throw new Error('La contraseña actual es incorrecta');
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return user;
  }

  /**
   * CAMBIO: Método agregado para obtener todos los profesores/trainers del sistema
   * Respeta SRP: Solo se encarga de obtener profesores desde la base de datos
   * Respeta OCP: Extiende funcionalidad sin modificar métodos existentes
   */
  async getTeachers() {
    return await this.User.find({ 
      role: { $in: ['Trainer', 'Manager'] } 
    })
    .populate('assignedTraining', 'title subtitle')
    .sort({ createdAt: -1 })
    .exec();
  }

  /**
   * CAMBIO: Método agregado para obtener un profesor específico por ID
   * Respeta SRP: Solo obtiene datos de un profesor específico
   */
  async getTeacherById(id) {
    const teacher = await this.User.findOne({ 
      _id: id,
      role: { $in: ['Trainer', 'Manager'] } 
    })
    .populate('assignedTraining', 'title subtitle')
    .exec();
    
    return teacher;
  }

  /**
   * CAMBIO: Método agregado para actualizar el estado de un profesor
   * Respeta SRP: Solo maneja el cambio de estado en la base de datos
   * Respeta ISP: Método específico para una tarea específica
   */
  async updateTeacherStatus(id, status) {
    const teacher = await this.User.findOneAndUpdate(
      { 
        _id: id,
        role: { $in: ['Trainer', 'Manager'] } 
      },
      { status: status },
      { new: true }
    )
    .populate('assignedTraining', 'title subtitle')
    .exec();
    
    return teacher;
  }

  async delete(id) {
    const user = await this.User.findById(id).exec();
    if (!user) return null;
    return await this.User.findByIdAndDelete(id).exec();
  }
}

export default UserService;
