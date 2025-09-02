const mongoose = require('mongoose');
const { Schema } = mongoose;

const notaCursoSchema = new Schema({
  guardia: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  curso: { type: Schema.Types.ObjectId, ref: 'Curso', required: true },
  notaFinal: { type: Number },
  fecha: { type: Date }
});

module.exports = mongoose.model('NotaCurso', notaCursoSchema);