const Pets = require('../database/pets.model');
const { only_setted } = require('../lib/common.lib');
const Animal = require('./classes/animal.controller.class');

const AnimalController = new Animal;

module.exports = async (req, res) => {
  // Obtenemos los datos editables
  var { owner_phone, owner_email, owner_home, pet_race, disappearance_place, details, reward, found } = req.fields;

  // Verificamos que la mascota a editar exsista
  try { var pet_information = await Pets.findOne({ uuid: req.params.uuid }); }
  catch (error) { console.error(error); return res.status(500).json({ code: 500, type: 'database-error' }) }

  if (pet_information == null) return res.status(404).json({ code: 404, type: 'pet-error' })

  let query_object = { $unset: {} }; // Objeto de consulta enviado a MongoDB 

  //#region Verificamos los datos y los añadimos a la consulta
    // Verificamos el teléfono y lo añadimos a la consulta
    if (only_setted(owner_phone)) {
      if (!/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g.test(owner_phone)) return res.status(406).json({ code: 406, type: 'validation-error', field: 'owner_phone' });
      query_object.owner_phone = owner_phone;
    }

    // Verificamos el email y lo añadimos a la consulta
    if (only_setted(owner_email)) {
      if (!/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(owner_email)) return res.status(406).json({ code: 406, type: 'validation-error', field: 'owner_email' });
      query_object.owner_email = owner_email;
    }

    // Verificamos las coordenadas del hogar y las agregamos a la consulta}
    if (only_setted(owner_home)) {
      owner_home = owner_home.split(',')
      if (owner_home.length != 2) return res.status(406).json({ code: 406, type: 'validation-error', field: 'owner_home' });
      owner_home = owner_home.map(coordinate => { coordinate = Number(coordinate);  if (!isNaN(coordinate) && coordinate <= 90 && coordinate >= -90 ) return coordinate; })
      if (owner_home.includes(undefined)) return res.status(406).json({ code: 406, type: 'validation-error', field: 'owner_home' });
    
      query_object.owner_home = { type: "Point", coordinates: [owner_home] }
    }

    // Verificamos la raza de la mascota y la agregamos a la consulta
    if (only_setted(pet_race)) {
      pet_race = pet_race.toLowerCase();
      if (!AnimalController.RaceExist(pet_information.pet_animal, pet_race)) return res.status(406).json({ code: 406, type: 'validation-error', field: 'pet_race' });
      
      query_object.pet_race = pet_race;
    }

    // Verificamos sí las coordenadas de desaparición son validas y las agregamos a la consulta
    if (only_setted(disappearance_place)) {
      disappearance_place = disappearance_place.split(',')
      if (disappearance_place.length != 2) return res.status(406).json({ code: 406, type: 'validation-error', field: 'disappearance_place' });
      disappearance_place = disappearance_place.map(coordinate => { coordinate = Number(coordinate);  if (!isNaN(coordinate) && coordinate <= 90 && coordinate >= -90 ) return coordinate; })
      if (disappearance_place.includes(undefined)) return res.status(406).json({ code: 406, type: 'validation-error', field: 'disappearance_place' });
    
      query_object.disappearance_place = { type: "Point", coordinates: [disappearance_place] }
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
      else return res.status(406).json({ code: 406, type: 'validation-error', field: 'found' });
    }
  //#endregion

  //#region Editamos la info de la mascota  
    try { await Pets.findOneAndUpdate({ uuid: req.params.uuid }, query_object, { runValidators: true })  }
    catch (error) { 
      const path = Object.values(error.errors)[0].path;
      if (error._message == 'Validation failed') return res.status(400).json({ code: 400, type: `validation-error`, field: path  })
      console.error(error); return res.status(500).json({ code: 500, type: 'database-error' });
    }
  //#endregion  

  // TODO Enviamos un mail notificando la edición

  // Damos el ok de la edición
  res.status(200) .json({ code: 200, details: query_object })
}