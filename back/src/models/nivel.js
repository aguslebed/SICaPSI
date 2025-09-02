const mongoose = require('mongoose');
const { Schema } = mongoose;

const nivelSchema = new Schema({
  idNivel: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  teoria: { type: String },
  juegoURL: { type: String },
  materialBibliografico: { type: String },
  orden: { type: Number },
  curso: { type: Schema.Types.ObjectId, ref: 'Curso' }
});

module.exports = mongoose.model('Nivel', nivelSchema);