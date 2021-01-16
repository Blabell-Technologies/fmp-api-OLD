// Importado de enrutadores
const animals = require('./routers/animals.routes'); // Rutas de razas
const generic = require('./routers/generic.routes'); // Rutas de cosas genericas
const pets = require('./routers/pets.routes'); // Rutas de gestion de mascotas

// Importado de librerias necesarias
const formidable = require('express-formidable'); // Importación de express-formidable
const express = require('express'); // Importación de express
const dotenv = require('dotenv'); // Importación de dotenv
const cors = require('cors'); // Importación de cors

dotenv.config(); // Configuración de las variables de entorno

const app = express(); // Iniciando express

app.set('port', process.env.PORT || 3000); // Configuración

// Middleware
app.use(cors()) // Configurando CORS

app.use(express.json()); // Configurando express para recibir JSONs
app.use(express.urlencoded({ extended: false })); // Configurando express para recepcion de URLEncode
app.use(formidable({ uploadDir: __dirname + '/resources/temp', keepExtensions: true, type: 'multipart' })); // Configurando recepción de formdata

// Rutas
app.use(generic) // Rutas genericas
app.use('/pets', pets) // Rutas de gestion de mascotas
app.use('/animals', animals) // Rutas de gestion de animales

// En caso de que ninguna de las rutas sean compatibles se deriva al error 404
app.use((req, res) => { res.status(404).json({ code: 404, type: 'api-error' }) })

require('./database/connection.db'); // Conectando la base de datos

// Iniciando servidor
app.listen(app.get('port'), () => console.log(`Servidor iniciado en el puerto ${app.get('port')}`));