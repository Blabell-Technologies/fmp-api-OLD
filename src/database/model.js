const { model, Schema } = require('mongoose');

const schema = new Schema({
  nombre: { type: String, unique: true, required: true,  }
})