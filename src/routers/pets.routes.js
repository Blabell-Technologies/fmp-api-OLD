const { Router } = require('express');

// Importando controladores
const all_pet = require('../controllers/pets.all');
const sch_pet = require('../controllers/pets.search');
const viw_pet = require('../controllers/pets.view');
const add_pet = require('../controllers/pets.add');
const modify_pet = require('../controllers/pets.modify');
const cors = require('cors');

// Estableciendo ruter
const router = Router();

// Ver todas las mascotas perdidas
router.get('/', all_pet)
// Ver mascota por id
router.get('/single/:id', viw_pet);
// Buscar mascotas por querys de busqueda
router.get('/search', sch_pet)
// Ruta para creación de nueva mascota perdida
router.post('/', add_pet);
// Modificar mascota en base a su uuid
router.put('/:uuid', modify_pet);

module.exports = router