const { print } = require('../lib/logger.class.lib');
global.pets_single = require('./pets.single');
global.pets_search = require('./pets.search');
global.pets_modify = require('./pets.modify');
global.pets_index = require('./pets.index');
global.pets_add = require('./pets.add');

const controller = async (req, res, next, controller = 'pets_single') => {
  const process_result = await global[controller](req, res);
  print.response(req.request_time, req.originalUrl || '?', req.method || '?', process_result.code || '?', req.ip || '?');
  res.status(process_result.code).json(process_result);
}

const single = async (req, res, next) => { controller(req, res, next, 'pets_single') }
const search = async (req, res, next) => { controller(req, res, next, 'pets_search') }
const modify = async (req, res, next) => { controller(req, res, next, 'pets_modify') }
const index = async (req, res, next) => { controller(req, res, next, 'pets_index') } 
const add = async (req, res, next) => { controller(req, res, next, 'pets_add') }

module.exports = { controller, single, index, search, modify, add }