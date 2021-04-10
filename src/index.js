// process.env['TF_CPP_MIN_LOG_LEVEL'] = 2
// console.log(process.env['TF_CPP_MIN_LOG_LEVEL']);

// const tf = require('@tensorflow/tfjs-node');

const dotenv = require('dotenv'); // Importación de dotenv
dotenv.config(); // Configuración de las  variables de entorno

//#region  Importado de enrutadores
  const animals = require('./routers/animals.routes'); // Rutas de razas
  const generic = require('./routers/generic.routes'); // Rutas de cosas genericas
  const pets = require('./routers/pets.routes'); // Rutas de gestion de mascotas
//#endregion

//#region  Importado de librerias necesarias
  const formidable = require('express-formidable'); // Importación de express-formidable
  const express = require('express'); // Importación de express
  const cors = require('cors'); // Importación de cors
  const { print } = require('./lib/logger.class.lib'); // Importación de gestor de logs
//#endregion


// Iniciando express
const app = express();

// Configuración
app.set('port', process.env.PORT || 3000); 
// Directorio raiz del proyecto
process.env.dirname = __dirname; 

//#region  Middlewares
  app.use(generic) // Rutas genericas
  app.use((req, res, next) => {
    if (req.query.atk == 'B2wmZLREFsk2c11') return next();
    if (req.headers['access-token'] == 'B2wmZLREFsk2c11') return next();
    return res.json({ code: 401, type: 'token-error' });
  })
  app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] })) // Configurando CORS 
  app.use((req, res, next) => { req.request_time = new Date().getTime(); next(); });
  app.use(express.json()); // Configurando express para recibir JSONs
  app.use(express.urlencoded({ extended: false })); // Configurando express para recepcion de URLEncode
  app.use(formidable({ uploadDir: __dirname + '/resources/temp', keepExtensions: true, type: 'multipart' })); // Configurando recepción de formdata
//#endregion

//#region Rutas
  app.use('/pets', pets) // Rutas de gestion de mascotas
  app.use('/animals', animals) // Rutas de gestion de animales

  // En caso de que ninguna de las rutas sean compatibles se deriva al error 404
  app.use((req, res) => { print.response(req.request_time, req.url, req.method, 404, req.ip); res.status(404).json({ code: 404, type: 'api-error' }) })
//#endregion

// Conectando la base de datos
require('./database/connection.db');
// Iniciando servidor
app.listen(app.get('port'), () => print.info(`Server started on port ${app.get('port')}`));