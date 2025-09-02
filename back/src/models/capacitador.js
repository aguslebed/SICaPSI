const Usuario = require('./usuario');
const mongoose = require('mongoose');

module.exports = Usuario.discriminator('capacitador', new mongoose.Schema({
  cursosACargo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Curso' }]
}));