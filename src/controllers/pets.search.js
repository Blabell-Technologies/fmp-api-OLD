// Librerias
const { only_setted, diacritic_sensitive_regex } = require('../lib/common.lib');
const { print } = require('../lib/logger.class.lib');

// Modelos y controles
const Pets = require('../database/pets.model');

module.exports = async (req, res) => {
  var mongo_query = {  }; // Termino de busqueda usado por mongoose paginate

  // Verificamos el termino de busca
  if (only_setted(req.query.q)) {
    var query = req.query.q; // Guardamos el query de busqueda
    query = query.toLowerCase().trim(); // Lo convertimos a minuscula y lo trimiamos
    if (only_setted(query)) mongo_query = { $or: [{ pet_name: { $regex: diacritic_sensitive_regex(query), $options: 'i' } }, { details: { $regex: diacritic_sensitive_regex(query), $options: 'i' } }, { pet_race: { $regex: diacritic_sensitive_regex(query), $options: 'i' } }, { pet_animal: { $regex: diacritic_sensitive_regex(query), $options: 'i' } }], deleted: false };
  }

  // Verificamos el limite
  const limit = Number(req.query.limit) || 15;
  const page = Number(req.query.page) || 1;

  // Obtenemos los datos de la mascota mediante su nombre
  try { var pets_information_page = await Pets.paginate(mongo_query, { limit, page, sort: { disappearance_date: -1 } }) } 
  catch (error) { print.error(error); return { code: 500, type: 'database-error' } }
  
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
        found: pet_information.found
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