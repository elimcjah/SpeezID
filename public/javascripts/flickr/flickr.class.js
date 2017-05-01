/**
 *
 * @fileoverview Uses flickr search and get-sizes to save image.
 * About its dependencies.
 * @link https://www.flickr.com/services/api/|Flickr API
 */

const request = require('request');
const url = 'https://api.flickr.com/services/rest/';

require('dotenv').config();

/**
 * @class
 * @classdesc
 */
class Flickr {
  /**
   * @constructor
   */
  constructor() {

  }

  /**
   * @method
   * @methodOf Flickr
   * @param {String} scientificName - Scientific Name with no whitespace
   * @return {Promise}
   */
  search(scientificName) {
    return new Promise((resolve, reject) => {
      let options = {
        method: 'GET',
        url: url,
        qs: {
          method: 'flickr.photos.search',
          api_key: process.env.FLICKR_KEY,
          tags: scientificName,
          format: 'json',
          nojsoncallback: '?',
        },
      };
      request(options, function(error, response, body) {
        body = JSON.parse(body);
        if (error) throw new Error(error);
          if(body['photos']['photo'][Math.floor(Math.random() *
                  body['photos']['photo'].length)] !== undefined) {
            resolve(body['photos']['photo'][Math.floor(Math.random()
                * body['photos']['photo'].length)].id);
          } else{
            resolve(5565732642);
          }
      });
    });
  }

  /**
   *
   * @param {Number} id
   * @return {Promise}
   */
  getImageURL(id) {
    return new Promise((resolve, reject) => {
      let options = {
        method: 'GET',
        url: url,
        qs: {
          method: 'flickr.photos.getSizes',
          api_key: process.env.FLICKR_KEY,
          photo_id: id,
          format: 'json',
          nojsoncallback: '?',
        },
      };

      request(options, function(error, response, body) {
        if (error) throw new Error(error);
        const sizeOfImage = 'Medium';
        body = JSON.parse(body);

        /** Initially called image URL returns object of JSON data
         * about the image incl. URL */
        let imageURL = body.sizes.size;

        /** reduce imageURL to return value for the property equal
         *  to the size of image set earlier */
        imageURL = imageURL.filter(function( obj ) {
          return obj.label === sizeOfImage;
        });

        imageURL = imageURL[0]['source'];

        resolve(imageURL);
      });
    });
  }

  /**
   *
   * @param {Number} id
   * @return {Promise}
   */
  getPhotoContents(id) {
    return new Promise((resolve, reject) => {
      let options = {
        method: 'GET',
        url: url,
        qs: {
          method: 'flickr.photos.getInfo',
          api_key: process.env.FLICKR_KEY,
          photo_id: id,
          format: 'json',
          nojsoncallback: '?'},
          };

      request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
      });
    });
  }
}

module.exports = Flickr;

// let id = 2597115849;
let flickr = new Flickr;
flickr.search('nacho+supreme').then((id) =>
  flickr.getImageURL(id).then((image) => {
  console.log(image);
  return image;
}));
