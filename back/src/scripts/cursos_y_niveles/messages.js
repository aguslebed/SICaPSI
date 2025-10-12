/**
 * Construye documentos de mensajes de bienvenida del profesor a alumnos del curso.
 * Devuelve dos copias por alumno: inbox (alumno) y sent (profe), con trainingId.
 */
export function buildWelcomeMessageDocs({ training, teacherId, studentIds }) {
  const docs = [];
  for (const sid of studentIds) {
    const subject = `Bienvenida a ${training.title}`;
    const body = `¡Hola! Bienvenido/a al curso ${training.title}.`;
    docs.push({
      sender: teacherId,
      recipient: sid,
      subject,
      message: body,
      isRead: false,
      folder: 'inbox',
      status: 'received',
      trainingId: training._id,
    });
    docs.push({
      sender: teacherId,
      recipient: sid,
      subject,
      message: body,
      isRead: true,
      folder: 'sent',
      status: 'sent',
      trainingId: training._id,
    });
  }
  return docs;
}

/**
 * Construye documentos de mensajes de consulta del alumno al profesor.
 * Devuelve dos copias: sent (alumno) e inbox (profe), con trainingId.
 */
export function buildStudentInquiryDocs({ training, teacherId, studentId }) {
  const subject = `Consulta en ${training.title}`;
  const body = 'Profe, tengo una duda del primer nivel.';
  return [
    {
      sender: studentId,
      recipient: teacherId,
      subject,
      message: body,
      isRead: true,
      folder: 'sent',
      status: 'sent',
      trainingId: training._id,
    },
    {
      sender: studentId,
      recipient: teacherId,
      subject,
      message: body,
      isRead: false,
      folder: 'inbox',
      status: 'received',
      trainingId: training._id,
    },
  ];
}
