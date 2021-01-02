const formidableMiddleware = require('express-formidable');
const generic = require('./routers/generic.routes');
const pets = require('./routers/pets.routes');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

// Iniciando express
const app = express();

// Configuración
app.set('port', process.env.PORT || 3000);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(formidableMiddleware({ uploadDir: __dirname + '/resources/temp', keepExtensions: true }));

// Rutas
app.use(generic)
app.use('/pets', pets)

// Conectando la base de datos
require('./database/connection.db');

// Iniciando servidor
app.listen(app.get('port'), () => console.log(`Servidor iniciado en el puerto ${app.get('port')}`));