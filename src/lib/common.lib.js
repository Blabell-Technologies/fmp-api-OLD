const fetch = require('node-fetch');

/**
 * Genera un UUID
 * 
 * @returns {String} UUID Generado automaticamente
 */
const create_uuid = () => {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

/**
* Verifica si los valores son nulos o no estan definidos
* @param  {...any} values Valores a comprobar
* 
* @throws {ReferenceError} Lanazara un error si alguno de los argumentos son indefinidos, nulos o estan vacios
* @returns {boolean}
*/
const is_set = (...values) => {
  for (const value of values) {
    if (value == undefined || value == null || value == '' || value.lenght == 0) throw new ReferenceError(`The variable is not defined or is null`);
  }

  return true;
}

/**
 * Obtiene el address de nominatim
 * 
 * @param {[number, number]} coordinates Latitud y longitud del lugar en cuestion
 */
const fetch_nominatim = async (coordinates) => {
  try { 
    const url = `https://nominatim.openstreetmap.org/reverse?format=geojson&limit=1&lat=${coordinates[0]}&lon=${coordinates[1]}&zoom=18`;
    var geo_coordinates = await fetch(url)
    // Decodifciamos la respuesta del nominatim y usamos aquellos datos que requerimos
    geo_coordinates = await geo_coordinates.json();
  } catch (error) { throw error }

  if (geo_coordinates.features != undefined) {
    var geo_address = geo_coordinates.features[0].properties.address;
    geo_address = `${geo_address.road} ${geo_address.house_number}, ${geo_address.suburb}, ${geo_address.city}, ${geo_address.state}`;
    geo_address = geo_address.split(',');
  
    // Removemos  y trimeamos los undefineds
    geo_address = await geo_address.map(elem => { 
      elem = elem.trim();
      if (elem != 'undefined') return elem
      else return 
    }).filter(elem => { return elem !== undefined });
  
    // Remplazamos aquellas calles estilo (75 - Av Rivadavia)
    geo_address[0] = await geo_address[0].replace(/^.* - /gm, '');
  
    return geo_address.join(', ');
  } else {
    return 'invalid_address';
  }

}

/**
* Verifica si la variable es nula o indefinida
* @param  {any} value Valor a comprobar
* 
* @returns {boolean} Retornará el valor booleano correspondiente al resultado
*/
const only_setted = (value) => {
  if (value == undefined || value == null || value == '' || value.lenght == 0) return false;
  return true;
}

/**
 * Inicia un ciclo de espera de x ms
 * @param {Number} milliseconds Milisegundos a esperar
 */
const sleep = (milliseconds) => {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

/**
 * Anula la sensitividad diacritica
 *
 * @param {string} string Texto
 */
const diacritic_sensitive_regex = (string = '') => {
  return string.replace(/a/g, '[a,á,à,ä]')
  .replace(/e/g, '[e,é,ë]')
  .replace(/i/g, '[i,í,ï]')
  .replace(/o/g, '[o,ó,ö,ò]')
  .replace(/u/g, '[u,ü,ú,ù]');
}


module.exports = { create_uuid, is_set, fetch_nominatim, only_setted, sleep, diacritic_sensitive_regex };