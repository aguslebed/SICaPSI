const mongoose = require('mongoose');
const { Schema } = mongoose;

const notaNivelSchema = new Schema({
  guardia: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  curso: { type: Schema.Types.ObjectId, ref: 'Curso', required: true },
  nivel: { type: Schema.Types.ObjectId, ref: 'Nivel', required: true },
  nota: { type: Number, required: true },
  fechaHora: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NotaNivel', notaNivelSchema);