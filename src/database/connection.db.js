const { print } = require('../lib/logger.class.lib'); // Importación de gestor de logs
const mongoose = require('mongoose'); // Importación de mongoose
require('dotenv').config(); // Configuracion de variables de entorno


module.exports = (() => {
  mongoose.set('useFindAndModify', false) // Desactivando useFindAndModify
  
  mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, (err) => {
    if (err) return print.error(err);
    print.info('Successful connection to the database');
  })

})()