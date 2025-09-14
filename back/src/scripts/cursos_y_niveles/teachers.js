import bcrypt from 'bcryptjs';
import User from '../../models/User.js';

/**
 * Crea (o reutiliza si ya existe) un profesor asignado a un training.
 * Devuelve el documento del profesor.
 */
export async function ensureTeacherForTraining({ training, saltRounds = 12 }) {
  const email = `prof_${training._id}@sicapsi.com`;
  let teacher = await User.findOne({ email }).exec();
  if (teacher) {
    // Asegurar que esté asignado al training
    if (!teacher.assignedTraining?.some(t => t.toString() === training._id.toString())) {
      teacher.assignedTraining = [...(teacher.assignedTraining || []), training._id];
      await teacher.save();
    }
    return teacher;
  }
  teacher = await User.create({
    firstName: `Profesor ${training.title}`,
    lastName: 'Asignado',
    documentType: 'DNI',
    documentNumber: `${Math.floor(Math.random()*100000000)}`,
    birthDate: new Date(1980, 0, 1),
    email,
    postalCode: '8000',
    address: 'Aula',
    addressNumber: '1',
    province: 'buenos_aires',
    city: 'Bahía Blanca',
    areaCode: '0291',
    phone: '123456',
    password: await bcrypt.hash('docente123', saltRounds),
    role: 'Trainer',
    assignedTraining: [training._id],
  });
  return teacher;
}
