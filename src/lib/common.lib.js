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

module.exports = { create_uuid, is_set };