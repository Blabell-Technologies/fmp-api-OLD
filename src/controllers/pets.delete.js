// Types
const e = require('express');

// Modelos y controladores
const Pets = require('../database/pets.model');

/** @param {e.Request} req @param {e.Response} res */
module.exports = async (req, res) => {
  // Guardado del id del la mascota en una constante
  const EDIT_ID = req.params.uuid;

  // Se realiza una busqueda en base al uuid de la mascota y se edita su propiedad deleted
  try { var results = await Pets.findOneAndUpdate({ uuid: EDIT_ID, deleted: false }, { deleted: true, deleted_time: new Date() }) }
  catch (err) { console.error(err); return res.status(500).json({ code: 500, type: 'database-error' }) }

  // En caso de no encontrarse resultados, responde ...
  if (results == null) return res.status(404).json({ code: 404, type: 'api-error' })

  // Una vez editado se responde ...
  res.json({ code: 200 })
}