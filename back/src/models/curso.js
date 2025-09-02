const mongoose = require('mongoose');
const { Schema } = mongoose;

const cursoSchema = new Schema({
  idCurso: { type: String, unique: true },
  nombre: { type: String },
  niveles: [{ type: Schema.Types.ObjectId, ref: 'Nivel' }],
  capacitador: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  guardiasInscritos: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }]
});

module.exports = mongoose.model('Curso', cursoSchema);