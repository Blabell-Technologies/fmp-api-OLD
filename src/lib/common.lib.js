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
  try { var geo_coordinates = await fetch(`https://nominatim.openstreetmap.org/reverse?format=geojson&limit=1&lat=${coordinates[0]}&lon=${coordinates[1]}&zoom=18`) }
  catch (error) { throw error }

  // Decodifciamos la respuesta del nominatim y usamos aquellos datos que requerimos
  geo_coordinates = await geo_coordinates.json();
  var geo_address = geo_coordinates.features[0].properties.address;
  geo_address = `${geo_address.road}, ${geo_address.city_district}, ${geo_address.suburb}, ${geo_address.city},  ${geo_address.state}, ${geo_address.country}`;
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

module.exports = { create_uuid, is_set, fetch_nominatim, only_setted };