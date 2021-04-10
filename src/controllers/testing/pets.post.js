'use strict'

// exclude = [cosa1, cosa2, cosa3]
// only = [otracosa1, otracosa2]

// Node modules
const uuid = require('uuid');
const e = require('express');
const clean_object = require('clean-deep');
const ObjectID = require('mongodb').ObjectID;

// Modulos internos
const pets = require('../../database/pets.model');
const { print } = require('../../lib/logger.class.lib');

/** @param {e.Request} req @param {e.Response} res */
module.exports = async (req, res) => {
  const id = req.params.id;

  // if (req.query.include != undefined && req.query.include.includes('k'))

  //#region Genera la lista de incluciónes
    /** @type {string[]} */
    let a_include = (typeof req.query.include == 'string') ? req.query.include.split(',').map(elem => {return elem.trim()}) : req.query.include;
    let o_include = (a_include != undefined) ? a_include.reduce((acc, curr) => (acc[curr] = 1, acc), {}) : null;
  //#endregion

  //#region Genera la lista de exluciones
    /** @type {string[]} */
    // Genera el array de excluciones
    let a_exclude = (typeof req.query.exclude == 'string') ? req.query.exclude.split(',').map(elem => {return elem.trim()}) : req.query.exclude;
    let o_exclude = (a_exclude != undefined) ? a_exclude.reduce((acc, curr) => (acc[curr] = 1, acc), {}) : null;
  //#endregion

  // Verifica si el id es valido (ObjectId, UUID)
  if (!(ObjectID.isValid(id) || uuid.validate(id))) 
    return res.status(406).json({ kind: 'validation-error', field: ':id', description: 'Unknown id format, valid formats are (ObjectID, UUID)' })

  // Intenta obtiener la información de la mascota
  try { 
    // Busca la mascota por ID
    if (ObjectID.isValid(id)) var results = await pets.findOne({ _id: id, deleted: false }, { ...o_exclude, ...o_include }); 
    // Busca la mascota por UUID
    if (uuid.validate(id)) var results = await pets.findOne({ uuid: id }, { ...o_exclude, ...o_include });

  } catch (err) {
    if (err.toString().includes('buffering timed out')) return res.status(500).json({ kind: 'database-error', type: 'timed-out', description: 'Connection has been rejected due timeout' });
    
    res.status(500).json({ kind: 'api-error', description: 'Uncaught server exception' });
    return print.error(err);
  }
  
  // Si no se encontro la mascota se retorna ...
  if (results == null || results == undefined) return res.status(404).json({ kind: 'resource-error', type: 'pet-not-found', description: 'Pet not found' })
  
  // Se guarda el documento de retorno de mongo
  results = results.toObject();

  // Se incluye la url en cada imagen
  if (results.pictures != undefined) results.pictures = results.pictures.map(image_id => { return process.env.IMAGE_URL + image_id });

  // Si no hay coordenadas se iguala home a null
  if (results.owner_home != null && results.owner_home.coordinates.length <= 0) results.owner_home = null;
    
  // En caso de solicitar por ViewID (ObjectID) ...
  if (results.owner_home != null && results.owner_home.address != undefined && ObjectID.isValid(id)) {
    // Se separa la direccion por comas
    var splited_address = results.owner_home.address.split(', ');
    // Se remplaza la calle recuperando todo exepto la ultima entrada
    splited_address[0] = splited_address[0].split(' ').slice('0', '-1');

    // Se une y se remplaza la entrada address
    results.owner_home.address = splited_address.join(', ');
  }

  // Excluye los campos uuid y v
  results.uuid = null; results.__v = null;

  // Se remueven los campos indefinidos
  results = clean_object(results)

  // Despacha la información ya procesada
  res.json({ eps: 'insider', ...results })
}