const { model, Schema } = require('mongoose');

const pet_schema = new Schema({
  owner: { type: String, required: true },
  owner_email: { type: String, required: true },
  owner_phones:  { type: [String], required: true },
  pet_name: { type: String, required: true },
  pet_type: { type: String, required: true },
  pet_description: { type: String, required: true },
  city: { type: String, required: true },
  pet_image: String,
  pet_uuid: { type: String, unique: true },
  found: { type: Boolean, default: false },
  iat: { type: Date, default: new Date() } 
}, { collection: 'pets' });

module.exports = model('Pets', pet_schema);