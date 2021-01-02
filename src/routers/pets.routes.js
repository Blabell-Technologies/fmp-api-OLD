const { Router } = require('express');
const upload = require('../lib/uploads.lib');
const Pets = require('../database/pet.model');
const { is_set, create_uuid } = require('../lib/common.lib');

const router = Router();

// Visualización de imagenes
router.post('/manager', async (req, res) => {   
  var { owner_name, owner_phones, owner_email, pet_name, pet_type, pet_description, city } = req.fields;
  const pet_image = req.files['pet_image'];
  
  //#region Verificamos que los campos no esten vacios
  try { is_set( owner_name, owner_phones, owner_email, pet_name, pet_type, pet_description, pet_image, city ) }
  catch (error) { console.log(error); return res.status(400).send({ code: 400, msg: 'Empry fields' }) }
  //#endregion

  //#region Comprobamos el mail
  if (!/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(owner_email)) return res.status(400).json({ code: 400, msg: 'El email no es valido' })
  //#endregion
  
  //#region Verificamos los telefonos
  owner_phones = owner_phones.split(',')
  var owner_phones_boolean = owner_phones.map(elem => !/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/g.test(elem))
  if (owner_phones_boolean.includes(false)) return res.status(400).json({ code: 400, msg: 'Invalid phone' });
  //#endregion

  //#region Verificamos que la categoria exsista
  const pet_types = ['dog', 'cat'];
  pet_type = pet_type.toLowerCase();
  if (!pet_types.includes(pet_type)) return res.status(400).json({ code: 400, msg: 'Invalid category' });
  //#endregion

  //#region Subimos la imagen
  const pet_image_route = pet_image.path;
  try { var upload_name = await upload.upload_image(pet_image_route); }
  catch (error) { console.log(error); return res.status(500).json({ code: 500, msg: 'Image processing error' }) }
  //#endregion

  //#region Creamos el perfil de la mascota perdida
  const pet_information = new Pets({
    owner: owner_name,
    owner_email,
    owner_phones,
    pet_name,
    pet_type,
    pet_description,
    city,
    pet_uuid: create_uuid(),
    pet_image: upload_name
  });
  
  const pet_uuid = pet_information.pet_uuid;
  const pet_id = pet_information.id;
  //#endregion

  //#region Guardamos los datos de la mascota en la base de datos
  try { await pet_information.save() }
  catch (error) { console.error(error); return res.status(500).json({ code: 500, msg: 'Database save error' });  }
  //#endregion

  //#region TODO enviamos el mail de creación

  //#endregion

  // Damos el okey de la creación
  console.log('Nueva mascota guardada');
  res.json({ code: 200, msg: 'Pet published', information: { edit_id: pet_uuid, view_id: pet_id } });
})

module.exports = router