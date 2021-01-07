const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('useFindAndModify', false)
mongoose.connect(`${process.env.MONGO_URL}/${process.env.MONGO_DB}`, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}, (err) => {
  if (err) return console.error(err);
  console.log('Conexion con la base de datos establecida correctamente');
})