// Libreria de logs
const { print } = require('../lib/logger.class.lib');

// Modelos y controles
const Pets = require('../database/pets.model');

module.exports = async (req, res) => {
  let uuid_request = false;
  // Obtenemos los datos de la mascota
  try { var pet_information = await Pets.findOne({ _id: req.params.id, deleted: false }); } 
  catch (error) { 
    if (error.kind == 'ObjectId') {
      try { var pet_information = await Pets.findOne({ uuid: req.params.id, deleted: false }); uuid_request = true; } 
      catch (error) { 
        if (error.kind == 'ObjectId') return { code: 404, type: 'api-error' }
        print.error(error); 
        return { code: 500, type: 'database-error' }
      }
    } else {
      print.error(error); 
      return { code: 500, type: 'database-error' }
    }
  }

  // Comprobamos que la mascota exista
  if (pet_information == null) { return { code: 404, type: 'api-error' } }

  // Incluimos la URL delante de los IDs de las imagenes
  pet_information.pictures = pet_information.pictures.map(image_id => { return process.env.IMAGE_URL + image_id })

  // Preparamos la información de la consulta
  switch (req.query.format) {
    case 'template1':
      var parsed_information = {
        // Informacón de la mascota
        pet_name: pet_information.pet_name,
    
        // Información del dueño
        owner_name: pet_information.owner_name,
        owner_email: pet_information.owner_email,
      }
      break;
    default:
      var parsed_information = {
        id: pet_information._id,

        // Informacón de la mascota
        pet_name: pet_information.pet_name,
        pet_animal: pet_information.pet_animal,
        pet_race: pet_information.pet_race,
    
        // Información del dueño
        owner_name: pet_information.owner_name,
        owner_email: pet_information.owner_email,
        owner_phone: pet_information.owner_phone,
    
        // Información de la desaparición
        disappearance_date: pet_information.disappearance_date,
        disappearance_place: {
          coordinates: pet_information.disappearance_place.coordinates,
          address: pet_information.disappearance_place.address,
        },
    
        // Información varia
        details: pet_information.details,
        pictures: pet_information.pictures,
        reward: pet_information.reward,
        found: pet_information.found
      }
      break;
  }
  

  // Obtenemos la dirección del dueño
  if (pet_information.owner_home.coordinates.length == 2) {
    let owner_address = pet_information.owner_home.address;
    if (!uuid_request) {
      // Separamos owner address por "coma espacio"
      const splited_owner_address = owner_address.split(', ');
      // Obtenemos la calle de la dirección y la separamos por espacios
      let owner_road = splited_owner_address[0].split(' ');
      // Obtenemos toda la calle salvo el ultimo item (la altura) y lo unimos por espacios
      owner_road = owner_road.splice(0, owner_road.length - 1).join(' ');

      // Remplazamos el primer item (la calle) con la calle sin altura
      splited_owner_address[0] = owner_road;
      // Lo juntamos todo con una separacion de "coma espacio"
      owner_address = splited_owner_address.join(', ');
    }

    parsed_information.owner_home = { 
      coordinates: pet_information.owner_home.coordinates,
      address: owner_address,
    }
  }
  
  // Damos el ok de la lectura y devolvemos los datos de la mascota
  return { code: 200, details: { items: parsed_information } };
}