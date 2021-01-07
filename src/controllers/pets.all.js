const Pets = require('../database/pets.model');
const fetch = require('node-fetch');
const { is_set, create_uuid, fetch_nominatim } = require('../lib/common.lib');
const geoip = require('geoip-lite');

// Permite obtener todas las mascotas cercanas a la ubicación requerida
module.exports = async (req, res) => {
  // Verificamos si la petición tiene coordenadas de ubicación
  const max_limit = Number(req.query.limit) || 5;
  var origin = geoip.lookup(req.ip.replace('::ffff:', '')).ll; // Origen por defecto, lat lon de la ip
  var radius = Number(req.query.radius) || 15000; // Verificamos el radio, por defecto 15Km

  // Si el query origin esta seteado usamos esas coordenadas
  if (req.query.origin != undefined) {
    radius = 10000;
    origin = req.query.origin.split(',').map(elem => Number(elem));
  }

  // Creamos el query de busqueda
  var query = { found: false, disappearance_place: { $near: { $maxDistance: radius ,$geometry: { type: 'Point', coordinates: [origin[0], origin[1]] } } } };
  if (Boolean(req.query.all)) query = { found: false }; // Si el query de consulta all esta seteado obtenemos todos las mascotas que no han sido encontradas
  
  // Obtenemos los datos de la mascota
  try { var pets_information = await Pets.find(query).limit(max_limit); } 
  catch (error) { console.error(error); return res.status(500).json({ code: 500, msg: 'database-read-error' }) }

  // Sanitizamos la información
  const formated_information = await Promise.all(pets_information.map( async pet_information => { 
    // TODO Cambiar el entorno de nominatim al publicador
    try { var disappearance_address = await fetch_nominatim(pet_information.disappearance_place.coordinates) }
    catch (error) { console.log(error); }

    // Retornamos el objeto decodificado
    return ({
      pet_name: pet_information.pet_name,
      pet_animal: pet_information.pet_animal,
      pet_race: pet_information.pet_race,

      disappearance_date: pet_information.disappearance_date,
      disappearance_place: {
        coordinates: pet_information.disappearance_place.coordinates,
        address: disappearance_address,
      },

      details: pet_information.details,
      picture: pet_information.pictures[0],
      url: process.env.ARTICLE_URL + pet_information.id
    });
  }));

  // Damos el ok de la lecrtura y devolvemos los datos de la mascota
  console.log('Información de mascota');
  res.json({ code: 200, msg: 'Pet information', information: { pets: formated_information } });
}