const Pets = require('../database/pets.model');
const { is_set, create_uuid, fetch_nominatim, only_setted } = require('../lib/common.lib');

module.exports = async (req, res) => {
  var mongo_query = {  };

  // Verificamos el termino de busca
  if (only_setted(req.query.q)) {
    var query = req.query.q; // Guardamos el query de busqueda
    query = query.toLowerCase().trim(); // Lo convertimos a minuscula y lo trimiamos
    
    const regex_query = new RegExp(query, 'i'); // Generamos la expresión regular
    try { mongo_query.$or.push({ pet_name: regex_query }, { details: regex_query }); }
    catch { mongo_query.$or = []; mongo_query.$or.push({ pet_name: regex_query }, { details: regex_query }); }
  }

  // Verificamos el limite
  const limit = Number(req.query.limit) || 15;
  const page = Number(req.query.page) || 1;

  // Obtenemos los datos de la mascota mediante su nombre
  try { var pets_information_page = await Pets.paginate(mongo_query, { limit, page }) } 
  catch (error) { console.error(error); return res.status(500).json({ code: 500, type: 'database-error' }) }
  
  const pets_information = pets_information_page.docs;
  const formated_information = await Promise.all(pets_information.map( async pet_information => { 
    // TODO Cambiar el entorno de nominatim al publicador
    try { var disappearance_address = await fetch_nominatim(pet_information.disappearance_place.coordinates) }
    catch (error) { console.log(error); return res.status(500).json({ code: 500, type: 'api-error' }); }

    // Retornamos el objeto decodificado
    return ({
      id: pet_information.id,

      pet_name: pet_information.pet_name,
      pet_animal: pet_information.pet_animal,
      pet_race: pet_information.pet_race,

      disappearance_date: pet_information.disappearance_date,
      disappearance_place: {
        coordinates: pet_information.disappearance_place.coordinates,
        address: disappearance_address,
      },

      details: pet_information.details,
      picture: process.env.IMAGE_URL + pet_information.pictures[0],
    });
  }));

  // Damos el ok de la lecrtura y devolvemos los datos de la mascota
  try { res.status(200).json({ code: 200, details: { items: formated_information, page_details: { results: formated_information.length, next: pets_information_page.nextPage || false, total: pets_information_page.totalPages } } }); }
  catch (error) { console.log('Error'); }
}