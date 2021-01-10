const { Router } = require('express');

// Importando controladores
const Aniamals = require('../controllers/classes/animal.controller.class');
const animals = new Aniamals();

// Estableciendo ruter
const router = Router();

// Permite ver todos los tipos de animales
router.get('/', (req, res) => { res.json({ code: 200, details: { items: animals.GetAnimals() } }) });

// Permite controlar si el animal exsiste
router.get('/:animal/check', (req, res) => { 
  const animal_exist = animals.AniamlExist(req.params.animal);
  if (!animal_exist) return res.status(404).json({ code: 404, type: 'animal-error', field: ':animal' })

  res.json({ code: 200, details: { exist: animal_exist } })
})

// Permite crear un animal
router.post('/:animal/add', (req, res) => { 
  try { var new_animal_object = animals.AddAnimal(req.params.animal); }
  catch (error) { 
    if (error.message == 'El animal ya existe') return res.status(409).json({ code: 409, type: 'animal-error', field: ':animal' })
    return res.status(500).json({ code: 500, type: 'api-error' });
  }

  res.json({ code: 200, details: new_animal_object })
})

// Permite obtener las razas dependientes de un animal
router.get('/:animal/races', (req, res) => {
  try { var animal_races = animals.GetRace(req.params.animal); } 
  catch (error) { return res.status(404).json({ code: 404, type: 'animal-error', field: ':animal' }); }

  res.json({ code: 200, details: { races: animal_races } })
})

// Permite comprobar si una raza existe
router.get('/:animal/races/:race/check', (req, res) => { 
  const race_exist = animals.RaceExist(req.params.animal, req.params.race);
  if (!race_exist) return res.status(404).json({ code: 404, type: 'animal-error', field: ':animal' })

  res.json({ code: 200, details: { exist: race_exist } })
})

// Permite añadir una raza a un animal
router.post('/:animal/races/:race/add', (req, res) => { 
  try { var new_animal_object = animals.AddRace(req.params.animal, req.params.race); }
  catch (error) { 
    if (error.message == 'El animal no existe') return res.status(409).json({ code: 409, type: 'animal-error', field: ':animal' })
    if (error.message == 'La raza ya existe') return res.status(409).json({ code: 409, type: 'animal-error', field: ':race' })
    
    console.error(error.message);
    return res.status(500).json({ code: 500, type: 'api-error' });
  }

  res.json({ code: 200, details: new_animal_object })
})

router.use((req,res) => { 
  res.status(404).json({ code: 404, msg: 'api-error'}); 
})

module.exports = router