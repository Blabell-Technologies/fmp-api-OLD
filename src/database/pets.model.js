const { model, Schema } = require('mongoose');
const { create_uuid } = require('../lib/common.lib')
const paginate = require('mongoose-paginate-v2');

const pet_schema = new Schema({
  // Datos del dueño
  owner_name: { type: String, required: true },
  owner_phone: { type: String, required: true },
  owner_email: { type: String, required: true },
  owner_home: { address: String, type: { type: String, enum: ['Point'] }, coordinates: { type: [Number] } },

  // Datos de la mascota
  pet_animal: { type: String, required: true },
  pet_name: { type: String, required: true },
  pet_race: { type: String },

  // Datos de desaparición
  disappearance_date: { type: Date, required: true },
  disappearance_place: { address: String, type: { type: String, enum: ['Point'], required: true }, coordinates: { type: [Number], required: true } },

  // Detalles de la publicación
  details: { type: String, required: true },
  pictures: [{ type: String, required: true }],
  reward: { type: String },

  // Generación automatica
  iat: { type: Date, default: new Date() },
  uuid: { type: String, default: create_uuid(), unique: true },
  found: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false }
}, { collection: process.env.MONGO_TABLE, bufferTimeoutMS: 10000 });

pet_schema.index({ pet_name: 'text', pet_animal: 'text', pet_race: 'text', details: 'text' })
pet_schema.plugin(paginate);

module.exports = model('Pets', pet_schema);