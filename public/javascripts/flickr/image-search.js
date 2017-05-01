/**
 * @namespace image-search
 *
 * @author Elijah McClendon <Elijah@davinciinstitute.com>
 *
 * @description image-search uses asynchronous calls with promises to save
 *      images/data from Flickr and combine with select information from the
 *      saved Clements Database of birds.
 *
 * @link https://www.flickr.com/services/api/|Flickr API
 * @link http://cloudinary.com/documentation/solution_overview Cloudinary API
 *
 * @requires cloudinary
 * @requires fs
 * @requires mongoose
 * @requires request
 */

/**
 * A List of Constants & required modules for the ImageSearch class
 *
 * @constant {String} cloudinary - Calls the cloudinary node module for
 *      uploading photos.
 * @constant {String} fs - Calls the Core fs module (File System Module)
 * @constant {String} getImageURL - Directory to add to Flickr API URL gives
 *      size options for specific photo
 * @constant {String} getInfo - specific directory to add to Flickr API URL
 *      for information about specific photo
 * @constant {String} @private key - sets the API key for Flickr API @private
 * @constant {String} mongoose - calls the mongoose node module for abstraction
 *      of MongoDB data
 * @constant {String} request - calls the request node module for making http
 *      requests
 * @constant {String} search - specific directory to add to Flickr API URL to
 *      perform a keyword search
 * @constant {String} url - base URL for flickr API
 */

const cloudinary = require('cloudinary');
const getImageURL = '/services/rest/?method=flickr.photos.getSizes';
const getInfo = '/services/rest/?method=flickr.photos.getInfo';
const key = '&api_key=b2262c0ff71fe60473136cc5ecb7b6a4';
const mongoose = require('mongoose');
const search = '/services/rest/?method=flickr.photos.search';
const url = 'api.flickr.com';


// eslint-disable-next-line new-cap
const Clements = new require('../../../model/clements.js');
// const Image = new require('../../../model/images.js');

require('dotenv').config();
mongoose.connect(process.env.DB_URL);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

let order = 'Galliformes';
let clementsArr = [];
let iterations = -1;
let keyword = [];
let alphabetized = 0;
let imagesUploaded = 0;


// TODO(me): Make a change to push cwd __dirname and pop it off at the end.
// TODO(me): Fix images uploaded number count.
// TODO(me): Verify no images for 5565732642.
// TODO(me): Make more efficient how to deal with no result for id.
// TODO(me): If ScientificName exists then Add Image Data to existing object.

/**
 * @summary Takes an object from clementsDB, reduces it down to just
 *      'Scientific name',calls flickr api for image, save image to
 *      Cloudinary, & then saves JSON data about photos and species to
 *      image collection in MongoDB.
 * @namespace ImageSearch
 *
 * @class
 *
 * @classdesc ImageSearch takes an input of an object, usually sent
 * from ./image-search-batch.js, and reduces the object down to just
 * the scientific name. Asynchronous calls are then made in following
 * order. First, the keyword is used as input for search() method using
 * the url, key, and search constants to call Flickr API and return an
 * id number for a specific photo. Second, the id returned from search()
 * method is used as an input param for the getFlickrPhoto() method.
 * The the constants url, key, and getImageURL are also used in this
 * method to take an image id and call the getSizes api. In turn, a
 * selection is made to the size desired and a URL is returned. Third,
 * we again use the same id used in getFlickrPhoto() method that was
 * generated in search() method to make another api call to Flickr using
 * constants url, key, and getInfo. This call returns all the JSON data
 * associated with the image and user that uploaded the image. Fourth,
 * we will use the saveToCloud() method with params of imageURL and id
 * to push the image to our Cloudinary cloud server. The saveToCloud()
 * method also uses cloudinary config data, keyword, and familyDir to
 * create filename, enabling us to keep the Cloudinary storage organized.
 *
 * @param {Object} object - object from ClementsDB @returns
 * {ImageSearch} ImageSearch returns with an image uploaded
 * to appropriate Cloudinary folder and data about that
 * photo stored in the images collection of MongoDB.
 *
 * @example
 * let imageSearch = new ImageSearch(objectFromClementsDB).getPhoto();
 */
class ImageSearch {
  /**
   * @constructor
   */
  constructor() {
    this.network = require('https');
  }

  /**
   *
   * @param {String} order
   * @return {Promise}
   */
    getClements(order) {
        return new Promise((resolve, reject) =>
            Clements.find({
                'Order': order,
            }, function(err, speciesArray) {
                if (err) {
                    console.log('Error has occurred  ' + err);
                } else {
                    clementsArr = speciesArray;
                    iterations = speciesArray.length;
                    clementsArr.forEach(function(obj) {
                      keyword.push(obj['Scientific name'].split(' ').join('+'));
                    });
                    resolve(iterations, speciesArray);
                }
            })
        );
    }

  /**
   * @name getFlickrPhoto
   *
   * @description The id returned from search() method is used as
   * an input param with the constants url, key, and getImageURL.
   * The method takes an image id and calls the getSizes api. In
   * turn, a selection is made to the size desired with the variable
   * sizeOfImage and a URL is returned to an image of selected size.
   *
   * @method getFlickrPhoto
   *
   * @methodOf ImageSearch
   *
   * @memberOf ImageSearch @param {number} id - id is a number associated to
   * a specific image from flickr and found with ImageSearch().getPhoto()
   *
   * @param {Number} id
   *
   * @return {Promise} imageURL - sends back an imageURL to the
   * getPhoto chain of Promises. @example this.getFlickrPhoto(id)
   */
    getFlickrPhoto(id) {
        return new Promise((resolve, reject) => {
            /**
             * @name options
             * @type {{method: string, hostname: string, path: string}}
             * @inner
             */
            let options = {
                'method': 'GET',
                'hostname': url,
                'path': getImageURL + key + '&photo_id=' + id +
                    '&format=json&nojsoncallback=?',
            };

            /**
             * @callback
             * @params options
             */
            let req = this.network.request(options, function(res) {
                /** @constant {string} sizeOfImage - Determines the size of
                 *  the Flickr Image to save  */
                const sizeOfImage = 'Medium';

                let chunks = [];

                res.on('data', function(chunk) {
                    chunks.push(chunk);
                });

                res.on('end', function() {
                    /** @type {Buffer} Using Node Core HTTP module returns
                     * chunks to be Buffered into body string
                     */
                    let body = Buffer.concat(chunks);

                    /** parse body into object */
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

            req.on('error', (e) => {
                console.error(e);
                return e;
            });

            req.end();
        });
    }

    /**
     * @name getPhoto
     *
     * @Description Coming Soon!
     * @method
     * @methodOf ImageSearch
     * @memberOf ImageSearch
     *
     * @example let imageSearch = new ImageSearch(someJSONObj).getPhoto();
     */
    getPhoto() {
      let storeKeywords = this.getClements(order).
          then((iterations, speciesArray) => {
        });

        if(iterations === -1) {
          console.log('keepALphabetical =  '+ alphabetized);
          storeKeywords.then(()=> this.search(keyword[alphabetized]).
              then((id) => {
                if(id === 5565732642) {
                  console.log('No images for: ' + keyword[alphabetized - 1]);
                  this.getPhoto();
                }
                this.getFlickrPhoto(id).then((imageURL) =>
                    this.getPhotoContents(id).then((flickrJson) =>
                        this.saveToCloud(imageURL, id, keyword[alphabetized]).
                            then((imagePath) =>
                                this.saveDataToDB(imagePath, flickrJson, id).
                                    then((imageObj) => {
                                      this.getPhoto();
                                    }
                                    ) ) ) );
            }
                   ) );
        } else if(iterations > -1 && iterations > alphabetized ) {
            console.log('keepALphabetical =  '+ alphabetized);
            this.search(keyword[alphabetized]).then((id) => {
                    if(id === 5565732642) {
                      console.log('No image for: ' + keyword[alphabetized - 1]);
                        this.getPhoto();
                    }
                    this.getFlickrPhoto(id).then((imageURL) =>
                        this.getPhotoContents(id).then((flickrJson) =>
                            this.saveToCloud(imageURL, id,
                                keyword[alphabetized]).then((imagePath) =>
                                this.saveDataToDB(imagePath, flickrJson, id).
                                    then((imageObj) => {
                                        this.getPhoto();
                                    }
                    ) ) ) );
            });
        }
    }

    /**
     *
     * @name getPhotoContents
     *
     * @Description Coming Soon!
     *
     * @method
     *
     * @methodOf ImageSearch
     *
     * @memberOf ImageSearch
     *
     * @param {number} id - A number associated to a specific Flickr image
     *
     *
     * @return  {Promise}
     * @example Coming Soon!
     */
    getPhotoContents(id) {
        return new Promise((resolve, reject) => {
            let options = {
                'method': 'GET',
                'hostname': url,
                'path': getInfo + key + '&photo_id=' + id +
                    '&format=json&nojsoncallback=?',
            };

            let req = this.network.request(options, function(res) {
                let chunks = [];

                res.on('data', function(chunk) {
                    chunks.push(chunk);
                });

                res.on('end', function() {
                    let body = Buffer.concat(chunks);

                    body = JSON.parse(body);

                    resolve(body);
                });
            });

            req.on('error', (e) => {
                console.error(e);
                return e;
            });

            req.end();
        });
    }

    /**
     * @name saveToCloud
     *
     * @Description Coming Soon!
     *
     * @method
     *
     * @methodOf ImageSearch
     *
     * @memberOf ImageSearch
     *
     * @param {String} imageURL - URL for a specific image of a defined size.
     * @param {Number} id - A number associated to a specific image from flickr
     * with ImageSearch().getPhoto()
     * @param {String} scientificName
     *
     * @return {Promise}
     * @example Coming Soon!
     */
    saveToCloud(imageURL, id, scientificName) {
        return new Promise((resolve, reject) => {
            let jpgFile = 'flickr/' + order + '/' +
                clementsArr[alphabetized - 1]['Family name'] + '/' +
                scientificName + '-' + id;
            let cloudinaryResult;

            if(id !== 5565732642) {
                 cloudinaryResult = cloudinary.uploader.upload(imageURL,
                     function(result) {
                          console.log(result);
                     },
                     {public_id: jpgFile});
                 console.log('There have been '+ (imagesUploaded + 1) +
                     ' images uploaded out of '+ (alphabetized + 1) +
                     ' searches performed');
                resolve(cloudinaryResult, imagesUploaded++);
            }
            resolve(cloudinaryResult);
        });
    }

    /**
     * @name search
     *
     * @Description Uses this.keyword from constructor, constant
     *    url, constant key, and constant search to call Flickr API
     *    using nodes core HTTP request. Resolves the promise by
     *    sending back an image id to the getPhoto() method where it
     *    will be passed to the next method in a chain of Promises.
     *
     * @method
     * @methodOf ImageSearch
     * @memberOf ImageSearch
     *
     * @param {String} scientificName
     *
     * @return {Promise}
     *
     * @example this.search().then(id)=> Wait for the promise to resolve then
     *    move to the next Async call
     */
    search(scientificName) {
        return new Promise((resolve, reject) => {
            let options = {
                'method': 'GET',
                'hostname': url,
                'path': search + key + '&tags=' + scientificName +
                    '&format=json&nojsoncallback=?',
            };


            let req = this.network.request(options, function(res, err) {
                let chunks = [];

                res.on('data', function(chunk) {
                    chunks.push(chunk);
                });

                res.on('end', function() {
                    /**
                     * @TODO fix this warning somehow
                     */

                    let body = JSON.parse(Buffer.concat(chunks));

                    // console.log(body);
                    alphabetized++;
                    console.log('Inside search and remaining iterations = '+
                        (iterations - alphabetized));

                    if(body['photos']['photo'][Math.floor(Math.random() *
                            body['photos']['photo'].length)] !== undefined) {
                        resolve(body['photos']['photo'][Math.floor(Math.random()
                            * body['photos']['photo'].length)].id);
                    } else{
                        resolve(5565732642);
                    }
                });
            });

            req.on('error', (e) => {
                console.error(e);
                return e;
            });

            req.end();
        });
    }

    /**
     * @name saveDataToDB
     *
     * @Description Coming Soon!
     *
     * @method
     * @methodOf ImageSearch
     * @memberOf ImageSearch
     *
     * @param {Object} imagePath - JSON object with cloudinary data about
     *    stored image
     * @param {Object} flickrJson - JSON object with data about image of
     *    specific id.
     * @param {Number} id
     *
     * @return {Promise}
     * @example Coming Soon!
     */
    saveDataToDB(imagePath, flickrJson, id) {
        return new Promise((resolve, reject) => {
            let imageObj = {};

            if (id === 5565732642) {
                imageObj = {error: 'That is a whale. Its a mammal. '};
                resolve(imageObj);
            }


            if (id !== 5565732642) {
                imageObj.Order = clementsArr[alphabetized].Order;
                imageObj.Family = clementsArr[alphabetized]['Family name'];
                imageObj.CommonFamilyName =
                    clementsArr[alphabetized]['Common family name'];
                imageObj.ScientificName =
                    clementsArr[alphabetized]['Scientific name'];
                imageObj.Category = clementsArr[alphabetized].Category;
                imageObj.EnglishName =
                    clementsArr[alphabetized]['English name'];
                imageObj.ImagesData = {};
                imageObj.ImagesData._imageID =
                    // eslint-disable-next-line new-cap
                    mongoose.Types.ObjectId();
                imageObj.ImagesData.VerifiedBird = false;
                imageObj.ImagesData.FlaggedAsNonBird = 0;
                imageObj.ImagesData.Cropped = false;

                if (flickrJson['photo']['location']) {
                    imageObj.ImagesData.HasGeoData = true;
                } else {
                    imageObj.ImagesData.HasGeoData = false;
                }
                imageObj.ImagesData.Cloudinary = imagePath;
                imageObj.ImagesData.FlickrData = flickrJson['photo'];
                // TODO(me): Finish the FindOneAndUpdate for images
                //     var query = {
                //         Order: imageObj.Order,
                //         Family: imageObj.Family,
                //         CommonFamilyName: imageObj.CommonFamilyName,
                //         ScientificName: imageObj.ScientificName,
                //         Category: imageObj.Category,
                //         EnglishName: imageObj.EnglishName
                //     }
                //        // update = { ImagesData[ImagesData.length] =
                //              imageObj.ImagesData },
                //       //  options = { upsert: true, new: true};
                //     Image.findOneAndUpdate(query, update, options,
                //          function(error, result) {
                //         if (error) return;
                //
                //     console.log('This is the imageObj:   \n' + imageObj);
                // });

              // TODO(me): Replace the db.images.insert or sim. that was here.
            }
            resolve(imageObj);
        });
    }
}

module.exports = ImageSearch;
let imageSearch = new ImageSearch();
imageSearch.getPhoto();

