const { Router } = require('express');
const path = require('path');
const pkg_json = require('../../package.json');

const router = Router();

// Visualización de imagenes
router.get('/images/:image', (req, res) => {
  res.status(200).sendFile(path.resolve(`${__dirname}/../resources/${req.params['image']}.webp`), (err) => {
    if (err) {
      res.status(404).json({ code: 404, type: 'image-error' });
    }
  });
});


// Licencia y creditos
router.get('/', (req, res) => { 
  res.status(200).json({ code: 200, details: { 
    api_name: pkg_json.name,
    api_version: pkg_json.version,
    api_authors: pkg_json.authors,
    "github-repository": pkg_json.GitHubRepo,
    dependencies: pkg_json.dependencies,
  }});
});

router.get('/licence-credits', (req, res) => { 
  res.status(200).json({ code: 200, details: { 
    api_name: pkg_json.name,
    api_version: pkg_json.version,
    api_authors: pkg_json.authors,
    "github-repository": pkg_json.GitHubRepo,
    dependencies: pkg_json.dependencies,
  }});
});

module.exports = router