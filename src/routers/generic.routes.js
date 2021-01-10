const { Router } = require('express');
const path = require('path');
const pkg_json = require('../../package.json');

const router = Router();

// Visualización de imagenes
router.get('/images/:image', (req, res) => { 
  res.sendFile(path.resolve(`${__dirname}/../resources/${req.params['image']}.webp`), (err) => {
    if (err) return res.status(404).json({ code: 404, type: 'image-error' });
  });
})

router.get('/licence-credits', (req, res) => { 
  res.json({ code: 200, details: { 
    api_name: pkg_json.name,
    api_version: pkg_json.version,
    api_authors: pkg_json.authors,
    "github-repository": pkg_json.GitHubRepo,
    dependencies: pkg_json.dependencies,
  }});
});

module.exports = router