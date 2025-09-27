

export class EnrollmentService {
  constructor({ UserModel, TrainingModel }) {
    this.user = UserModel;
    this.training = TrainingModel;
  }

  async enrollUserToTraining(userId, trainingId) {
    const user = await this.user.findById(userId);

    if (!user) throw new Error("Usuario no encontrado");

    const training = await this.training.findById(trainingId);
    if (!training) throw new Error("Curso no encontrado");

    if (user.assignedTraining.includes(trainingId)) {
      throw new Error("Ya inscrito en el curso");
    }

    user.assignedTraining.push(trainingId);
    await user.save(trainingId);

    return { message: "Inscripción exitosa", training };
  }

  async getUserEnrollments(userId) {
    const user = await this.user.findByIdWithTrainings(userId);
    if (!user) throw new Error("Usuario no encontrado");

    return user.assignedTraining; 
  }
}