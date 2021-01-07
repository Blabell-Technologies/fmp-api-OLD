const fs = require('fs');

class AnimalController {
  #animals;
  #animal_set;

  constructor (animals_set = __dirname + '/animal.data.json') {
    this.#animal_set = animals_set;
    this.#animals = require(animals_set);
  }
  
  /** Permite obtener todos los tipos de animales registrados
   * 
   * @returns {string[]} Animales registrados
   * ---
   * @author Santiago de Nicolás <santidenicolas@gmail.com>
   * @since 1.0.0
   * ---
   * @example
   *  animal.GetAnimals()
   */
  GetAnimals() { return Object.keys(this.#animals); }

  /** Comprueba si el animal existe
   * 
   * @param {string} animal Nombre del animal
   * @returns {(boolean)} Devuelve `true` en caso de Existir y `false` en caso de que no
   * ---
   * @author Santiago de Nicolás <santidenicolas@gmail.com>
   * @since 1.0.0
   * ---
   * @example
   *  animal.AniamlExist('dog')
   */
  AniamlExist(animal) {
    animal = animal.toLowerCase()
    const getted_aniaml = this.#animals[animal];
    if (getted_aniaml == undefined) return false;

    return true;
  }

  /** Agrega un nuevo animal al dataset
   * 
   * @param {string} animal Nombre del animal
   * @returns {Object<string, string[]>} Objeto con la nueva información del dataset
   * ---
   * @author Santiago de Nicolás <santidenicolas@gmail.com>
   * @since 1.0.0
   * ---
   * @example
   *  animal.AddAnimal('dog')
   */
  AddAnimal(animal) {
    if (this.AniamlExist(animal)) throw new Error('El animal ya existe');
    var animals = this.#animals;
    
    animals[animal] = [];

    try { fs.writeFileSync(this.#animal_set, JSON.stringify(animals)); }
    catch (error) { console.log('errosito'); throw new Error('Error de escritura'); }

    return animals;
  }

  /** Permite obtener todas las razas asociadas a un animal especifico
   * @param {string} animal Animal del cual se desean sus razas adheridas
   * 
   * @returns {string[]} Razas de animal
   * ---
   * @author Santiago de Nicolás <santidenicolas@gmail.com>
   * @since 1.0.0
   * ---
   * @example
   *  animal.GetRace('dog')
   */
  GetRace(animal) { 
    animal = animal.toLowerCase()
    const getted_races = this.#animals[animal];
    if (!this.AniamlExist(animal)) throw new Error(`No se encontro el animal "${animal}"`);

    return getted_races
  }

  /** Comprueba si la raza existe
   * @param {string} animal Animal objetivo
   * @param {string} race Raza objetivo
   * 
   * @returns {(boolean)} Devuelve `true` en caso de Existir y `false` en caso de que no
   * ---
   * @author Santiago de Nicolás <santidenicolas@gmail.com>
   * @since 1.0.0
   * ---
   * @example
   *  animal.RaceExist('dog', 'poodle')
   */
  RaceExist(animal, race) { 
    animal = animal.toLowerCase()
    race = race.toLowerCase()

    const getted_races = this.#animals[animal];

    if (getted_races == undefined) return false;
    if (!getted_races.includes(race)) return false;

    return true
  }

  /** Añade una raza a un animal del dataset
   * @param {string} animal Animal objetivo
   * @param {string} race Nombre de la raza a añadir
   * 
   * @returns {(boolean)} Devuelve el objeto modificado
   * ---
   * @author Santiago de Nicolás <santidenicolas@gmail.com>
   * @since 1.0.0
   * ---
   * @example
   *  animal.RaceExist('dog', 'poodle')
   */
  AddRace(animal, race) { 
    animal = animal.toLowerCase()
    race = race.toLowerCase()

    // Comprobamos que el animal Exista
    if (!this.AniamlExist(animal)) throw new Error('El animal no existe')
    // Comprobamos que la raza no Exista
    if (this.RaceExist(animal, race)) throw new Error('La raza ya existe')

    var animals = this.#animals;
    animals[animal].push(race);

    try { fs.writeFileSync(this.#animal_set, JSON.stringify(animals)); }
    catch (error) { console.log('errosito'); throw new Error('Error de escritura'); }

    return animals
  }
}

module.exports = AnimalController;