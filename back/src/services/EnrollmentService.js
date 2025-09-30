

export class EnrollmentService {
  constructor({ UserModel, TrainingModel }) {
    this.user = UserModel;
    this.training = TrainingModel;
  }

  async enrollUserToTraining(userId, trainingId) {
    const user = await this.user.findById(userId);

    if (!user) throw new Error("Alumno no encontrado");

    const training = await this.training.findById(trainingId);
    if (!training) throw new Error("Capacitacion no encontrado");

    if (user.assignedTraining.includes(trainingId)) {
      throw new Error("El alumno ya está inscrito en la capacitacion");
    }

    user.assignedTraining.push(trainingId);
    await user.save(trainingId);

    return { message: "Inscripción exitosa", training };
  }


  async unenrollUserToTraining(userId, trainingId) {
    const user = await this.user.findById(userId);

    if (!user) throw new Error("Alumno no encontrado");

    const training = await this.training.findById(trainingId);
    if (!training) throw new Error("Capacitacion no encontrado");

    if (!user.assignedTraining.includes(trainingId)) {
      throw new Error("El alumno no está inscrito en la capacitacion");
    }

    user.assignedTraining = user.assignedTraining.filter(
      id => id.toString() !== trainingId.toString()
    );

    await user.save();

    return { message: "Alumno desinscripto correctamente", training };
  }


  //Busca si un usuario esta inscrito en una capacitacion. (Podria ser estudiante o capacitador)
  async getUserEnrollments(userId) {
    const user = await this.user.findByIdWithTrainings(userId);
    if (!user) throw new Error("Usuario no encontrado");

    return user.assignedTraining;
  }
}