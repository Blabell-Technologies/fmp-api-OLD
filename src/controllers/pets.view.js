const Pets = require('../database/pets.model');
const { is_set, create_uuid, fetch_nominatim } = require('../lib/common.lib');

module.exports = async (req, res) => {
  // Obtenemos los datos de la mascota
  try { var pet_information = await Pets.findOne({ _id: req.params.id }); } 
  catch (error) { console.error(error); return res.status(500).json({ code: 500, msg: 'database-read-error' }) }

  // Comprobamos que la mascota exista
  if (pet_information == null) { console.error('pet not found'); return res.status(404).json({ code: 404, type: 'pet-error' }) }

  // TODO Cambiar el entorno de nominatim al publicador
  // Obtenemos la dirección del dueño
  try { var owner_home_address = await fetch_nominatim(pet_information.owner_home.coordinates) }
  catch (error) { console.log(error); }

  // TODO Cambiar el entorno de nominatim al publicador
  // Obtenemos la dirección de la desaparición
  try { var disappearance_address = await fetch_nominatim(pet_information.disappearance_place.coordinates) }
  catch (error) { console.log(error); }
  
  // Preparamos la información de la consulta
  var parsed_information = {
    // Informacón de la mascota
    pet_name: pet_information.pet_name,
    pet_animal: pet_information.pet_animal,
    pet_race: pet_information.pet_race,

    // Información del dueño
    owner_name: pet_information.owner_name,
    owner_email: pet_information.owner_email,
    owner_phone: pet_information.owner_phone,
    owner_home: { 
      coordinates: pet_information.owner_home.coordinates,
      address: owner_home_address,
    },

    // Información de la desaparición
    disappearance_date: pet_information.disappearance_date,
    disappearance_place: {
      coordinates: pet_information.disappearance_place.coordinates,
      address: disappearance_address,
    },

    // Información varia
    details: pet_information.details,
    pictures: pet_information.pictures,
    reward: pet_information.reward,
    found: pet_information.found
  }

  

  // Damos el ok de la lecrtura y devolvemos los datos de la mascota
  console.log('pet-information');
  res.json({ code: 200, msg: 'pet-information', information: { pet: parsed_information } });
}