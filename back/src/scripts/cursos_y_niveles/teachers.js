import bcrypt from 'bcryptjs';
import User from '../../models/User.js';

/**
 * Crea (o reutiliza si ya existe) un profesor asignado a un training.
 * Devuelve el documento del profesor.
 */
export async function ensureTeacherForTraining({ training, saltRounds = 12, index = null, defaultPasswordHash = null }) {
  // Si se pasa un índice, generar emails sencillos: profesor1@sicapsi.com
  let email;
  if (typeof index === 'number' && Number.isInteger(index)) {
    email = `profesor${index + 1}@sicapsi.com`;
  } else {
    // Generar un email legible a partir del title del training
    const slug = String(training.title || training._id)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 30);
    email = `prof_${slug}@sicapsi.com`;
  }

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
    firstName: typeof index === 'number' ? `Profesor${index + 1}` : `Profesor`,
    lastName: `${String(training.title).slice(0, 30)}`,
    documentType: 'DNI',
    documentNumber: `${Math.floor(Math.random() * 100000000)}`,
    birthDate: new Date(1980, 0, 1),
    email,
    postalCode: '8000',
    address: 'Aula',
    addressNumber: '1',
    province: 'buenos_aires',
    city: 'Bahía Blanca',
    areaCode: '0291',
    phone: '123456',
    // Use provided hashed password if available, otherwise hash the default docente password
    password: defaultPasswordHash ? defaultPasswordHash : await bcrypt.hash('docente123', saltRounds),
    role: 'Capacitador',
    status: 'available',
    assignedTraining: [training._id],
  });
  return teacher;
}
