// Librerias
const { print } = require('../lib/logger.class.lib');
const { only_setted, fetch_nominatim } = require('../lib/common.lib');

// Modelos y controles
const Animal = require('./classes/animal.controller.class');
const Pets = require('../database/pets.model');

const AnimalController = new Animal;

module.exports = async (req, res) => {
  // Obtenemos los datos editables
  var { owner_phone, owner_home, pet_race, disappearance_place, details, reward, found } = req.fields;

  // Verificamos que la mascota a editar exsista
  try { var pet_information = await Pets.findOne({ uuid: req.params.uuid, deleted: false }); }
  catch (error) { print.error(error); return { code: 500, type: 'database-error' } }

  if (pet_information == null) return { code: 404, type: 'api-error' }

  let query_object = { $unset: {} }; // Objeto de consulta enviado a MongoDB 

  //#region Verificamos los datos y los añadimos a la consulta
    // Verificamos el teléfono y lo añadimos a la consulta
    if (only_setted(owner_phone)) {
      if (!/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g.test(owner_phone)) return { code: 406, type: 'validation-error', field: 'owner_phone' };
      query_object.owner_phone = owner_phone;
    }

    // Verificamos las coordenadas del hogar y las agregamos a la consulta
    if (only_setted(owner_home)) {
      if (owner_home === 'unset') { query_object.$unset.owner_home = ""; }
      else {
        owner_home = owner_home.split(',');
        if (owner_home.length != 2) return { code: 406, type: 'validation-error', field: 'owner_home' };
        owner_home = owner_home.map(coordinate => { coordinate = Number(coordinate);  if (!isNaN(coordinate) && coordinate <= 90 && coordinate >= -90 ) return coordinate; });
        if (owner_home.includes(undefined)) return { code: 406, type: 'validation-error', field: 'owner_home' };
        
        const owner_address = await fetch_nominatim(owner_home);
        if (owner_address == 'invalid_address') return { code: 406, type: 'validation-error', field: 'owner_home' };
        query_object.owner_home = { type: "Point", coordinates: owner_home, address: owner_address };
      }
    }

    // Verificamos la raza de la mascota y la agregamos a la consulta
    if (only_setted(pet_race)) {
      if (pet_race === 'unset') { query_object.$unset.owner_home = ""; }
      else {
        pet_race = pet_race.toLowerCase();
        if (!AnimalController.RaceExist(pet_information.pet_animal, pet_race)) return { code: 406, type: 'validation-error', field: 'pet_race' };
        
        query_object.pet_race = pet_race;
      }
    }

    // Verificamos sí las coordenadas de desaparición son validas y las agregamos a la consulta
    if (only_setted(disappearance_place)) {
      disappearance_place = disappearance_place.split(',');
      if (disappearance_place.length != 2) return { code: 406, type: 'validation-error', field: 'disappearance_place' };
      disappearance_place = disappearance_place.map(coordinate => { coordinate = Number(coordinate);  if (!isNaN(coordinate) && coordinate <= 90 && coordinate >= -90 ) return coordinate; });
      if (disappearance_place.includes(undefined)) return { code: 406, type: 'validation-error', field: 'disappearance_place' };
      
      const disappearance_address = await fetch_nominatim(disappearance_place)
      if (disappearance_address == 'invalid_address') return { code: 406, type: 'validation-error', field: 'disappearance_place' };
      query_object.disappearance_place = { type: "Point", coordinates: disappearance_place, address: disappearance_address };
    }

    // Verificamos que los detalles sean validos y lo agregamos a la consulta
    if (only_setted(details)) query_object.details = details;

    // Verificamos que la recompensa sea valida, asi mismo si es 'unset' la borramos
    if (only_setted(reward)) {
      if (reward === 'unset') query_object.$unset.reward = "";
      else query_object.reward = reward;
    }

    // Verificamos que el estado de busqueda sea un booleano
    if (only_setted(found)) {
      if (found == 'true' || found == 'false')query_object.found = (found === 'true');
      else return { code: 406, type: 'validation-error', field: 'found' };
    }
  //#endregion

  //#region Editamos la info de la mascota  
    try { await Pets.findOneAndUpdate({ uuid: req.params.uuid }, query_object, { runValidators: true })  }
    catch (error) { 
      const path = Object.values(error.errors)[0].path;
      if (error._message == 'Validation failed') return { code: 400, type: `validation-error`, field: path  }
      print.error(error); 
      return { code: 500, type: 'database-error' };
    }
  //#endregion  

  // Damos el ok de la edición
  return { code: 200, details: query_object };
}