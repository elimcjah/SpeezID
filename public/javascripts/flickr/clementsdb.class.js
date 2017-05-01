/**
 * @file clementsdb.class.js
 * @fileoverview Uses flickr search and get-sizes to save image.
 *
 * @requires mongoose
 * @requires Clements model
 */

const mongoose = require('mongoose');
const clements = require('../../../model/clements.js');
// eslint-disable-next-line new-cap
const Clements = new clements;

require('dotenv').config();
mongoose.connect(process.env.DB_URL);

/**
 * @class
 * @classdesc
 */
class ClementsDB {
  /**
   * @constructor
   */
  constructor() {

  }

  /**
   *
   * @method getByOrder
   * @methodOf ClementsDB
   * @param {String} order - The desired order of species
   * @return {Promise}
   */
  getByOrder(order) {
    return new Promise((resolve, reject) =>
      Clements.find({
        'Order': order,
      }, function(err, arrOfObj) {
        if (err) {
          console.log('Error has occurred  ' + err);
        } else {
          mongoose.connection.close();
          resolve(arrOfObj);
        }
      })
    );
  }

  /**
   *
   * @method reduceToSpeciesArray
   * @methodOf ClementsDB
   * @param {Array} arrOfObj - Array of Objects from getByOrder
   * @return {Array} scientificNames - An array of strings with no whitespace.
   */
  reduceToSpeciesArray(arrOfObj) {
    let scientificNames = [];
    arrOfObj.forEach(function(obj) {
      scientificNames.push(obj['Scientific name'].split(' ').join('+'));
    });
    return scientificNames;
  }
}

module.exports = ClementsDB;

// let clementsDB = new ClementsDB();
// clementsDB.getByOrder('Anseriformes').then((arrOfObj) => {
//   let species = clementsDB.reduceToSpeciesArray(arrOfObj);
//   console.log(species.length);
//   return(species.length);
// });


