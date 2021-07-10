// Librerias
const { is_set, create_uuid, fetch_nominatim } = require('../lib/common.lib');
const { print } = require('../lib/logger.class.lib');
const upload = require('../lib/uploads.lib');
var number_parser = require("libphonenumber-js")

// Modelos y controladores
const Animals = require('../controllers/classes/animal.controller.class');
const Pets = require('../database/pets.model');

const AnimalController = new Animals();

// Función express
module.exports = async (req, res, next) => {
  console.log('Peticion entrante a PETS.ADD');

  try { is_set( req.fields, req.files ); }
  catch (error) { return { code: 400, type: 'invalid-request-error' } };

  var { pet_animal, pet_race, pet_name, owner_name, owner_phone, owner_email, owner_home, disappearance_date, disappearance_place, details, reward } = req.fields;
  const { pet_photo_0 } = req.files;

  //#region Validaciónes de datos
    //#region Verificamos que los campos necesarios no esten vacios, asi como la imagen 0
      try { is_set( pet_animal, pet_name, pet_photo_0, owner_name, owner_phone, owner_email, disappearance_date, disappearance_place, details ) }
      catch (error) { return { code: 400, type: 'invalid-request-error' } }
    //#endregion

    //#region Comprobamos el mail
      if (!/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(owner_email)) return { code: 406, type: 'validation-error', field: 'owner_email' };
    //#endregion
    
    //#region Verificamos que el telefono sea valido
      let phone_list = {};

      function genHexString(len) {
        const str = Math.floor(Math.random() * Math.pow(16, len)).toString(16);
        return "0".repeat(len - str.length) + str;
      }

      owner_phone = owner_phone.split(',').map(phone => {
        try { phone = number_parser(phone); }
        catch { return false }

        if (phone == undefined) return false;

        if (!phone.isValid()) return false;      
        phone_list[genHexString(6)] = phone.formatInternational();
      });

      if (owner_phone.length < 1) return { code: 406, type: 'validation-error', field: 'owner_phone' };
    //#endregion

    //#region Verificamos que la fecha sea valida
      if (!/(\d{4}|\d{2})[^\w\d\r\n:](0?[1-9]|1[0-2])[^\w\d\r\n:](0?[1-9]|[12]\d|30|31)\T(0?([01]?\d|2[0-3]):([0-5]?\d))/gm.test(disappearance_date)) return { code: 406, type: 'validation-error', field: 'disappearance_date' };
      disappearance_date = new Date(disappearance_date);
      if (disappearance_date > new Date()) return { code: 406, type: 'validation-error', field: 'disappearance_date' };
    //#endregion

    //#region Verificamos que el tipo de animal exsista
      if (!AnimalController.AniamlExist(pet_animal)) return { code: 406, type: 'validation-error', field: 'pet_animal' };
    //#endregion

    //#region Verificamos que las coordenadas de desaparición sean validas
      disappearance_place = disappearance_place.split(',')
      if (disappearance_place.length != 2) return { code: 406, type: 'validation-error', field: 'disappearance_place' };
      disappearance_place = disappearance_place.map(coordinate => { coordinate = Number(coordinate);  if (!isNaN(coordinate) && coordinate <= 90 && coordinate >= -90 ) return coordinate; })
      if (disappearance_place.includes(undefined)) return { code: 406, type: 'validation-error', field: 'disappearance_place' };
    //#endregion

    //#region Verificamos que la raza
      if (pet_race != undefined) if (!AnimalController.RaceExist(pet_animal, pet_race)) return { code: 406, type: 'validation-error', field: 'pet_race' };
    //#endregion

    //#region Verificamos que la recompensa sea un numero
      if (reward != undefined) if (!is_set(reward)) return { code: 406, type: 'validation-error', field: 'reward' };
    //#endregion

    //#region Verificamos que las coordenadas de la casa sean validas
      if (owner_home != undefined) {
        owner_home = owner_home.split(',')
        if (owner_home.length != 2) return { code: 406, type: 'validation-error', field: 'owner_home' };
        owner_home = owner_home.map(coordinate => { coordinate = Number(coordinate);  if (!isNaN(coordinate) && coordinate <= 90 && coordinate >= -90 ) return coordinate; })
        if (owner_home.includes(undefined)) return { code: 406, type: 'validation-error', field: 'owner_home' };
      }
    //#endregion
  //#endregion

  //#region Subimos las imagenes
    var images_urls = []
    for (let index = 0; index <= 4; index++) {
      const photo_index = 'pet_photo_'+index;
      const photo_object = req.files[photo_index];
      if (photo_object == undefined) continue;
      if (!/^image\/jpeg$|^image\/png$|^image\/gif$/g.test(photo_object.type)) continue;
      const photo_path = photo_object.path;

      try { var upload_name = await upload.upload_image(photo_path); }
      catch (error) { print.error(error); return { code: 500, type: 'image-error', field: photo_index } }
    
      images_urls.push(upload_name)
    }

    if (images_urls.length == 0) return { code: 400, type: 'invalid-request-error' };
  //#endregion

  //#region Obtenemos la direccion de desaparicion y de la casa
    try { var disappearance_address = await fetch_nominatim(disappearance_place); disappearance_place = disappearance_place.reverse(); }
    catch (error) { print.error(error); return { code: 500, type: 'api-error', details: 'fetch-error' }; }
    
    if (owner_home != undefined) {
      try { var home_address = await fetch_nominatim(owner_home); owner_home = owner_home.reverse(); }
      catch (error) { print.error(error); return { code: 500, type: 'api-error', details: 'fetch-error' }; }
    }
  //#endregion
  
  //#region Creamos el perfil de la mascota perdida
    const pet_information = new Pets({
      // Datos del dueño
      owner_name,
      owner_phone: phone_list,
      owner_email,
      owner_home: { type: 'Point', coordinates: owner_home, address: home_address },

      // Datos de la mascota
      pet_animal: pet_animal.toLowerCase(),
      pet_name,

      // Datos de desaparición
      disappearance_date,
      disappearance_place: { type: 'Point', coordinates: disappearance_place, address: disappearance_address },

      // Detalles de la publicación
      details,
      pictures: images_urls,
      reward,
      uuid: create_uuid()
    });

    // Si la raza no esta definida la agregamos
    if (pet_race != undefined) { pet_information.pet_race = pet_race.toLowerCase(); }

    const edit_id = pet_information.uuid; // ID de edición
    const view_id = pet_information.id; // ID de vista
  //#endregion

  //#region Guardamos los datos de la mascota en la base de datos
    try { await pet_information.save() }
    catch (error) { 
      const path = Object.values(error.errors)[0].path;
      if (error._message == 'Validation failed') return { code: 400, type: `validation-error`, field: path  }
      print.error(error); return { code: 500, type: 'database-error' }
    }
  //#endregion

  // Damos el okey de la creación
  return { code: 200, details: { edit_id, view_id } }
}