const upload = require('../lib/uploads.lib');
const Pets = require('../database/pets.model');
const { is_set, create_uuid } = require('../lib/common.lib');
const Animlas = require('../controllers/classes/animal.controller.class');

const AnimalController = new Animlas();

module.exports = async (req, res) => { 
  var { pet_animal, pet_race, pet_name, owner_name, owner_phone, owner_email, owner_home, disappearance_date, disappearance_place, details, reward } = req.fields;
  const { pet_photo_0 } = req.files;
  
  //#region  Validaciónes de datos
    //#region Verificamos que los campos necesarios no esten vacios, asi como la imagen 0
      try { is_set( pet_animal, pet_name, pet_photo_0, owner_name, owner_phone, owner_email, disappearance_date, disappearance_place, details ) }
      catch (error) { console.log(error); return res.status(400).send({ code: 400, type: 'invalid-request-error' }) }
    //#endregion

    //#region Comprobamos el mail
      if (!/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(owner_email)) return res.status(406).json({ code: 406, type: 'validation-error', field: 'owner_email' })
    //#endregion
    
    //#region Verificamos que el telefono sea valido
      if (!/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g.test(owner_phone)) return res.status(406).json({ code: 406, type: 'validation-error', field: 'owner_phone' });
    //#endregion

    //#region Verificamos que la fecha sea valida
      try { disappearance_date = new Date(disappearance_date) }
      catch (error) { return res.status(406).json({ code: 406, type: 'validation-error', field: 'disappearance_date' }); }
    //#endregion

    //#region Verificamos que el tipo de animal exsista
      if (!AnimalController.AniamlExist(pet_animal)) return res.status(406).json({ code: 406, type: 'validation-error', field: 'pet_animal' });
    //#endregion

    //#region Verificamos que las coordenadas de desaparición sean validas
      disappearance_place = disappearance_place.split(',')
      if (disappearance_place.length != 2) return res.status(406).json({ code: 406, type: 'validation-error', field: 'disappearance_place' });
      disappearance_place = disappearance_place.map(coordinate => { coordinate = Number(coordinate);  if (!isNaN(coordinate) && coordinate <= 90 && coordinate >= -90 ) return coordinate; })
      if (disappearance_place.includes(undefined)) return res.status(406).json({ code: 406, type: 'validation-error', field: 'disappearance_place' });
    //#endregion

    //#region Verificamos que la raza exsiste
      if (pet_race != undefined) if (!AnimalController.RaceExist(pet_animal, pet_race)) return res.status(406).json({ code: 406, type: 'validation-error', field: 'pet_race' });
    //#endregion

    //#region Verificamos que la recompensa sea un numero
      if (reward != undefined) if (!is_set(reward)) return res.status(406).json({ code: 406, type: 'validation-error', field: 'reward' });
    //#endregion

    //#region Verificamos que las coordenadas de la casa sean validas
      if (owner_home != undefined) {
        owner_home = owner_home.split(',')
        if (owner_home.length != 2) return res.status(406).json({ code: 406, type: 'validation-error', field: 'owner_home' });
        owner_home = owner_home.map(coordinate => { coordinate = Number(coordinate);  if (!isNaN(coordinate) && coordinate <= 90 && coordinate >= -90 ) return coordinate; })
        if (owner_home.includes(undefined)) return res.status(406).json({ code: 406, type: 'validation-error', field: 'owner_home' });
      }
    //#endregion
  //#endregion

  //#region Subimos las imagenes
    var images_urls = []
    for (let index = 0; index <= 4; index++) {
      const photo_index = 'pet_photo_'+index;
      const photo_object = req.files[photo_index];
      if (photo_object == undefined) continue;
      const photo_path = photo_object.path;

      try { var upload_name = await upload.upload_image(photo_path); }
      catch (error) { console.log(error); return res.status(500).json({ code: 500, type: 'image-processing-error', field: photo_index }) }
    
      images_urls.push(upload_name)
    }
  //#endregion

  //#region Creamos el perfil de la mascota perdida
    const pet_information = new Pets({
      // Datos del dueño
      owner_name,
      owner_phone,
      owner_email,
      owner_home: { type: 'Point', coordinates: owner_home },

      // Datos de la mascota
      pet_animal: pet_animal.toLowerCase(),
      pet_name,
      pet_race: pet_race.toLowerCase(),

      // Datos de desaparición
      disappearance_date,
      disappearance_place: { type: 'Point', coordinates: disappearance_place },

      // Detalles de la publicación
      details,
      pictures: images_urls,
      reward,
      uuid: create_uuid()
    });

    const edit_id = pet_information.uuid; // ID de edición
    const view_id = pet_information.id; // ID de vista
  //#endregion

  //#region Guardamos los datos de la mascota en la base de datos
    try { await pet_information.save() }
    catch (error) { 
      const path = Object.values(error.errors)[0].path;
      if (error._message == 'Validation failed') return res.status(400).json({ code: 400, type: `validation-error`, field: path  })
      console.error(error); return res.status(500).json({ code: 500, type: 'database-error' });
    }
  //#endregion

  // TODO enviamos el mail de creación
  
  // Damos el okey de la creación
  res.json({ code: 200, details: { edit_id, view_id } });
}