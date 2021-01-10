// Importado de librerias necesarias
const animals = require('./routers/animals.routes');
const generic = require('./routers/generic.routes');
const pets = require('./routers/pets.routes');
const formidable = require('formidable');
const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config(); // Configuración de las variables de entorno

// Iniciando express
const app = express();

// Configuración
app.set('port', process.env.PORT || 3000);

// Middleware
app.use(async (req, res, next) => { 
  req.request_time = new Date().getTime();

  req.headers['content-type'] = req.headers['content-type'] || 'data/type';
  if (req.headers['content-type'].includes('multipart/form-data;')) {
    const form = new formidable.IncomingForm({ uploadDir: __dirname + '/resources/temp', keepExtensions: true });
  
    await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        Object.assign(req, { err, fields, files });
        resolve();
      });
    })
  }

  function write_log(data) {
    const log_filename = `/logs/${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}.log`;
    try { fs.appendFileSync(__dirname + log_filename, '\n' + data); }
    catch (error) { 
      if (error.errno == -4058) { fs.mkdirSync(__dirname + '/logs'); write_log(data); }
    }
  }

  req.on('end', function () {
    const ms = new Date().getTime() - req.request_time + 'ms';
    const method = req.method;
    const url = req.baseUrl + req.url;
    let ip = req.ip.replace('::ffff:', '');
    ip = (ip == '::1') ? 'localhost' : ip;
    const http_code = res.statusCode;

    const log = `[${new Date().toUTCString()} • ${ms}] ${url} • ${method} • ${http_code} • ${ip}`;
    console.log(log);
    if (http_code == 500) { 
      write_log(log)
    }
  });

  next();
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(formidableMiddleware({ uploadDir: __dirname + '/resources/temp', keepExtensions: true }));

// Rutas
app.use(generic)
app.use('/pets', pets)
app.use('/animals', animals)

app.use((req, res) => { res.status(404).json({ code: 404, type: 'api-error' }) })

// Conectando la base de datos
require('./database/connection.db');

// Iniciando servidor
app.listen(app.get('port'), () => console.log(`Servidor iniciado en el puerto ${app.get('port')}`));