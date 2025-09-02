const Usuario = require('./usuario');
const mongoose = require('mongoose');

module.exports = Usuario.discriminator('administrador', new mongoose.Schema({}));