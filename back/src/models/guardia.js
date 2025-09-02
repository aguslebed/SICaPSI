const Usuario = require('./usuario');
const mongoose = require('mongoose');

module.exports = Usuario.discriminator('guardia', new mongoose.Schema({
  cursoAsignado: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Curso' }],
  cursoRealizado: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Curso' }],
  certificados: [String]
}));