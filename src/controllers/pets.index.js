// Librerias
const { print } = require('../lib/logger.class.lib');
const Pets = require('../database/pets.model');
const geoip = require('geoip-lite');

// Permite obtener todas las mascotas cercanas a la ubicación requerida
module.exports = async (req, res) => {
  // Verificamos si la petición tiene coordenadas de ubicación
  const max_limit = Number(req.query.limit) || 5;
  var origin = [-34.60371736549615, -58.381629785710956];
  var radius = Number(req.query.radius) || 15000; // Verificamos el radio, por defecto 15Km
  const page = Number(req.query.page) || 1;

  // Comprobamos, si hay una ip definida usamos las coordenadas de la misma
  if (req.query.ip != undefined) {
    origin = geoip.lookup(req.query.ip).ll;
  }
  // Si el query origin esta seteado usamos esas coordenadas
  if (req.query.origin != undefined) {
    origin = origin.split(',').map(elem => Number(elem));
  }

  // Creamos el query de busqueda
  var query = { found: false, disappearance_place: { $geoWithin: { $center: [[origin[0], origin[1]], radius] } }, deleted: false };
  
  // Si el query de consulta all esta seteado obtenemos todos las mascotas que no han sido encontradas
  if (Boolean(req.query.all)) query = { found: false }; 
  
  // Obtenemos los datos de la mascota
  try { var pets_information_page = await Pets.paginate(query, { limit: max_limit, page, sort: { disappearance_date: -1 } }) } 
  catch (error) { print.error(error); return { code: 500, type: 'database-error' }; }

  // Sanitizamos la información
  const pets_information = pets_information_page.docs;
  const formated_information = await Promise.all(pets_information.map( async pet_information => { 
    try { 
      var returner = ({
        id: pet_information.id,

        pet_name: pet_information.pet_name,
        pet_animal: pet_information.pet_animal,
        pet_race: pet_information.pet_race,

        disappearance_date: pet_information.disappearance_date,
        disappearance_place: {
          coordinates: pet_information.disappearance_place.coordinates,
          address: pet_information.disappearance_place.address,
        },

        details: pet_information.details,
        picture: process.env.IMAGE_URL + pet_information.pictures[0],

      });
    }
    catch (error) { print.warn(error); return false; }
    // Retornamos el objeto ya formateado
    return returner;
  }));

  if (formated_information.includes(false)) { print.error('Error processing pet information'); return { code: 500, type: 'api-error' }; }

  // Damos el ok de la lecrtura y devolvemos los datos de la mascota
  return { code: 200, details: { items: formated_information, page_details: { results: formated_information.length, next: pets_information_page.nextPage || false, total: pets_information_page.totalPages } } };
}