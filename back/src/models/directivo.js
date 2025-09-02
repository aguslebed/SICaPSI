const Usuario = require('./usuario');
const mongoose = require('mongoose');

module.exports = Usuario.discriminator('directivo', new mongoose.Schema({
  cargo: { type: String }
}));