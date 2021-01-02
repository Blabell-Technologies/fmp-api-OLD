const { Router } = require('express');
const path = require('path');

const router = Router();

// Visualización de imagenes
router.get('/images/:image', (req, res) => { 
  console.log(path.resolve(`${__dirname}/../resources/${req.params['image']}.webp`))
  res.sendFile(path.resolve(`${__dirname}/../resources/${req.params['image']}.webp`), (err) => {
    if (err) return res.status(404).json({ code: 404, msg: 'File not found' });
  });
})

module.exports = router