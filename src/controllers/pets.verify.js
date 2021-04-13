'use strict'

// Node modules
const uuid = require('uuid');
const e = require('express');
const clean_object = require('clean-deep');
const ObjectID = require('mongodb').ObjectID;

// Modulos internos
const pets = require('../database/pets.model');
const { print } = require('../lib/logger.class.lib');

/** @param {e.Request} req @param {e.Response} res */
module.exports = async (req, res) => {
  const id = req.params.id;

  // Verifica si el id es valido (UUID)
  if (!uuid.validate(id)) 
    return res.status(406).json({ kind: 'validation-error', field: ':id', description: 'Unknown id format, valid formats are (ObjectID, UUID)' })

  // Intenta obtiener la información de la mascota
  try {
    // Busca la mascota por UUID
    if (uuid.validate(id)) var results = await pets.findOne({ uuid: id });
  } catch (err) {
    if (err.toString().includes('buffering timed out')) return res.status(500).json({ kind: 'database-error', type: 'timed-out', description: 'Connection has been rejected due timeout' });
    
    res.status(500).json({ kind: 'api-error', description: 'Uncaught server exception' });
    return print.error(err);
  }
  
  // Si no se encontro la mascota se retorna ...
  if (results == null || results == undefined) return res.status(404).json({ kind: 'resource-error', type: 'pet-not-found', description: 'Pet not found' })
  
  // Se guarda el documento de retorno de mongo
  results = results.toObject();

  // Comprueba si el post esta activo
  if (!results.deleted)
    return res.status(404).json({ kind: 'resource-error', type: 'ilegal-activation', description: 'Unable to activate activated item' })
  
  // Activa el post
  try {
    // Busca la mascota por UUID
    await pets.findOneAndUpdate({ uuid: id }, { deleted: false });
  } catch (err) {
    if (err.toString().includes('buffering timed out')) return res.status(500).json({ kind: 'database-error', type: 'timed-out', description: 'Connection has been rejected due timeout' });
    
    res.status(500).json({ kind: 'api-error', description: 'Uncaught server exception' });
    return print.error(err);
  }

  // Despacha la información ya procesada
  res.json({ eps: 'insider' })
}