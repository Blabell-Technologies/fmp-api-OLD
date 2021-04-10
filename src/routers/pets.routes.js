const { Router } = require('express');

// Importando controladores
const controller_pet = require('../controllers/pets.controller');

// Estableciendo ruter
const router = Router();

// Ver todas las mascotas perdidas
router.get('/', controller_pet.index)
// Ver mascota por id
router.get('/single/:id', controller_pet.single);
// Buscar mascotas por querys de busqueda
router.get('/search', controller_pet.search)
// Ruta para creación de nueva mascota perdida
router.post('/', controller_pet.add);
// Modificar mascota en base a su uuid
router.put('/:uuid', controller_pet.modify);


// Retorna los post dentro del radio especificado desde un punto de origen
router.get('/insider/nearby', require('../controllers/testing/pets.nearby'));

// Retorna la información de un post
router.get('/insider/post/:id', require('../controllers/testing/pets.post'));


// Borra un post de mascota
router.delete('/:uuid', require('../controllers/pets.delete'));

module.exports = router