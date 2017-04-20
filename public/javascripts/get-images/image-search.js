/**
 * @namespace image-search
 * @author Elijah McClendon <Elijah@davinciinstitute.com>
 * @description image-search uses asynchronous calls with promises to save images/data from Flickr and combine with select
 * information from the saved Clements Database of birds.
 *
 * @link https://www.flickr.com/services/api/|Flickr API
 * @link http://cloudinary.com/documentation/solution_overview Cloudinary API
 * @requires cloudinary
 * @requires fs
 * @requires mongoose
 * @requires request
 */

/**
 * A List of Constants & required modules for the ImageSearch class
 *
 * @constant {String} cloudinary - calls the cloudinary node module for uploading photos
 * @constant {String} dir - appended to the beginning of image name so Cloudinary stays organized
 * @constant {String} fs - calls the Core fs module (File System Module)
 * @constant {String} getImageURL - directory to add to Flickr API URL gives size options for specific photo
 * @constant {String} getInfo - specific directory to add to Flickr API URL for information about specific photo
 * @constant {String} @private key - sets the API key for Flickr API @private
 * @constant {String} mongoose - calls the mongoose node module for abstraction of MongoDB data
 * @constant {String} request - calls the request node module for making http requests
 * @constant {String} search - specific directory to add to Flickr API URL to perform a keyword search
 * @constant {String} url - base URL for flickr API
 */
const cloudinary  = require('cloudinary');
const dir         = 'flickr/';
const fs          = require('fs');
const getImageURL = '/services/rest/?method=flickr.photos.getSizes';
const getInfo     = '/services/rest/?method=flickr.photos.getInfo';
const key         = '&api_key=b2262c0ff71fe60473136cc5ecb7b6a4';
const mongoose    = require('mongoose');
const request     = require('request');
const search      = '/services/rest/?method=flickr.photos.search';
const url         = 'api.flickr.com';


const Clements = new require('../../../model/clements.js');
const Image = new require('../../../model/images.js');

mongoose.connect('mongodb://localhost:27017/speezid');

const goose = mongoose.connection;

cloudinary.config({
    cloud_name: 'elijahs',
    api_key: '263371231383956',
    api_secret: 'Ef8mZYvcc_LWY48a1VOVKmcWd4Y'
});

let order = 'Galliformes';
let clementsArray = [];
let iterations = -1;
let keyword = [];
let keepAlphabetical = 0;
let imagesUploaded = 0;


/**
 * @TODO make a change to push cwd __dirname and pop it off at the end
 * @TODO hide private API keys somewhere not visible to public or anyone else if project is on github.
 * @TODO think about how to deal with 1 image being same for different scientific names and uploading twice to cloudinary
 * @TODO fix images uploaded number count
 * @TODO make more efficient how to deal with no result for id.
 * @TODO make sure that a return of 5565732642 really does mean that there was no image for those keywords
 * @TODO clean up the code.
 */

class ImageSearch {

    /**
     * @summary Takes an object from clementsDB, reduces it down to just 'Scientific name',calls flickr api for image,
     * save image to Cloudinary, & then saves JSON data about photos and species to image collection in MongoDB.
     * @namespace ImageSearch
     * @class
     * @classdesc ImageSearch takes an input of an object, usually sent from ./image-search-batch.js, and reduces the
     * object down to just the scientific name. Asynchronous calls are then made in following order. First, the
     * keyword is used as input for search() method using the url, key, and search constants to call Flickr API and
     * return an id number for a specific photo. Second, the id returned from search() method is used as an input param
     * for the getFlickrPhoto() method. The the constants url, key, and getImageURL are also used in this method to
     * take an image id and call the getSizes api. In turn, a selection is made to the size desired and a URL is
     * returned. Third, we again use the same id used in getFlickrPhoto() method that was generated in search() method
     * to make another api call to Flickr using constants url, key, and getInfo. This call returns all the JSON data
     * associated with the image and user that uploaded the image. Fourth, we will use the saveToCloud() method with
     * params of imageURL and id to push the image to our Cloudinary cloud server. The saveToCloud() method also uses
     * cloudinary config data, keyword, and familyDir to create filename, enabling us to keep the Cloudinary storage
     * organized.
     *
     * @param {Object} object - object from ClementsDB
     * @returns {ImageSearch} ImageSearch returns with an image uploaded to appropriate Cloudinary folder and data
     * about that photo stored in the images collection of MongoDB.
     *
     * @example
     * let imageSearch = new ImageSearch(objectFromClementsDB).getPhoto();
     */
    constructor() {

        this.network = require('https');
        //clementsArray[iterations]   = object;
        // this.familyDir     = dir + this.keyword + '/';
        this.jsonExt = '.json';
       // this.keyword       = clementsArray[iterations]['Scientific name'].split(' ').join('+');
    }

    getClements(order){
        return new Promise((resolve, reject) =>
            Clements.find({
                "Order": order
            }, function(err, speciesArray) {
                if (err) {
                    console.log("Error has occurred  " + err);
                } else {
                    clementsArray = speciesArray;
                    iterations = speciesArray.length;
                    //keyword.push(clementsArray[i]['Scientific name'].split(' ').join('+'));
                    clementsArray.forEach(function (obj) {
                        keyword.push(obj['Scientific name'].split(' ').join('+'))
                    });

                    resolve(iterations, speciesArray);
                }
            })
        )
    }

    /**
     * @name getFlickrPhoto
     * @alias ImageSearch().getFlickrPhoto(id)
     * @description The id returned from search() method is used as an input param with the constants url, key,
     * and getImageURL. The method takes an image id and calls the getSizes api. In turn, a selection
     * is made to the size desired with the variable sizeOfImage and a URL is returned to an image of selected size.
     * @method getFlickrPhoto
     * @methodOf ImageSearch
     * @memberOf ImageSearch
     * @param {number} id - id is a number associated to a specific image from flickr and found
     * with ImageSearch().getPhoto()
     * @returns {Promise} imageURL - sends back an imageURL to the getPhoto chain of Promises.
     * @example this.getFlickrPhoto(id)
     */
    getFlickrPhoto (id){

        return new Promise((resolve, reject) => {

            /**
             * @name options
             * @type {{method: string, hostname: string, path: string}}
             * @inner
             */
            let options = {
                "method": "GET",
                "hostname": url,
                "path": getImageURL + key + "&photo_id=" + id + "&format=json&nojsoncallback=?"
            };

            /**
             * @callback
             * @params options
             */
            let req = this.network.request(options, function (res) {

                /** @constant {string} sizeOfImage - determines the size of the Flickr Image to save  */
                const sizeOfImage = 'Medium';

                let chunks = [];

                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                res.on("end", function () {

                    let body = Buffer.concat(chunks);

                    body = JSON.parse(body);

                    let imageURL = body.sizes.size;

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
        })
    }

    /**
     * @name getPhoto
     * @alias ImageSearch().getPhoto()
     * @Description Coming Soon!
     * @method
     * @methodOf ImageSearch
     * @memberOf ImageSearch
     *
     * @returns stuff
     * @example let imageSearch = new ImageSearch(JSONObjectFromClementsDB).getPhoto();
     */
    getPhoto() {
        let storeKeywords = this.getClements(order).then((iterations, speciesArray) => {
        });

        if(iterations === -1){
            console.log('keepALphabetical = '+ keepAlphabetical);
            storeKeywords.then(()=> this.search(keyword[keepAlphabetical]).then((id) => {
                    if(id === 5565732642){
                        console.log('No images returned for:   ' + keyword[keepAlphabetical - 1]);
                        this.getPhoto();
                    }
                    this.getFlickrPhoto(id).then((imageURL) =>
                        this.getPhotoContents(id).then((flickrJson) =>
                            this.saveToCloud(imageURL, id, keyword[keepAlphabetical]).then((imagePath) =>
                                this.saveDataToDB(imagePath, flickrJson, id).then((imageObj) =>  {
                                        this.getPhoto();
                                    }
                                )         )   )   )
            }
                   )   )

        } else if(iterations > -1 && iterations > keepAlphabetical ){
            console.log('inside the else if and iterations = '+ iterations);
            console.log('keepALphabetical = '+ keepAlphabetical);
            this.search(keyword[keepAlphabetical]).then((id) => {
                    if(id === 5565732642){
                        console.log('No images returned for:   ' + keyword[keepAlphabetical - 1]);
                        this.getPhoto();
                    }
                    this.getFlickrPhoto(id).then((imageURL) =>
                        this.getPhotoContents(id).then((flickrJson) =>
                            this.saveToCloud(imageURL, id, keyword[keepAlphabetical]).then((imagePath) =>
                                this.saveDataToDB(imagePath, flickrJson, id).then((imageObj) =>  {
                                    this.getPhoto();
                                    }
                    )   )   )   )
            })
        }
    }

    /**
     *
     * @name getPhotoContents
     * @alias ImageSearch().getPhotoContents()
     * @Description Coming Soon!
     * @method
     * @methodOf ImageSearch
     * @memberOf ImageSearch
     * @param {number} id - id is a number associated to a specific image from flickr and found
     * with ImageSearch().getPhoto()
     * @returns {Promise}
     * @example Coming Soon!
     */
    getPhotoContents(id) {

        return new Promise((resolve, reject) => {

            let options = {
                "method": "GET",
                "hostname": url,
                "path": getInfo + key + "&photo_id=" + id + "&format=json&nojsoncallback=?"
            };

            let req = this.network.request(options, function (res) {

                let chunks = [];

                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                res.on("end", function () {
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

        })
    }

    /**
     * @name saveToCloud
     * @alias ImageSearch().saveToCloud()
     * @Description Coming Soon!
     * @method
     * @methodOf ImageSearch
     * @memberOf ImageSearch
     * @param {string} imageURL - URL associated to a specific image of a specific size.
     * @param {number} id - d is a number associated to a specific image from flickr and found
     * with ImageSearch().getPhoto()
     * @param {string} keyword
     * @returns {Promise}
     * @example Coming Soon!
     */
    saveToCloud(imageURL, id, scientificName){
        //console.log('saveToCloud');
        return new Promise((resolve, reject) => {

            let jpgFile = 'flickr/' + order + '/' + clementsArray[keepAlphabetical - 1]['Family name'] + '/' + scientificName + '-' + id;
            let cloudinaryResult;
            if(id !== 5565732642){
                 cloudinaryResult = cloudinary.uploader.upload(imageURL,
                    function(result) { console.log(result) },
                    { public_id: jpgFile });
                console.log('There have been '+ (imagesUploaded + 1) +' images uploaded out of '+ (keepAlphabetical + 1) +' searches performed');
                resolve(cloudinaryResult, imagesUploaded++);
            }

            resolve(cloudinaryResult);
        });
    }

    /**
     * @name search()
     * @alias ImageSearch().search()
     * @Description Uses this.keyword from constructor, @constant url, @constant key, and @constant search
     * to call Flickr API using nodes core HTTP request. Resolves the promise by sending back an image id to the
     * getPhoto() method where it will be passed to the next method in a chain of Promises.
     * @method
     * @methodOf ImageSearch
     * @memberOf ImageSearch
     *
     * @returns {Promise}
     * @example this.search().then(id)=> Wait for the promise to resolve then move to the next Async call
     */
    search(scientificName) {

        return new Promise((resolve, reject) => {

            let options = {
                "method": "GET",
                "hostname": url,
                "path": search + key + "&tags=" + scientificName + "&format=json&nojsoncallback=?"
            };


            let req = this.network.request(options, function (res, err) {

                let chunks = [];

                res.on("data", function (chunk) {
                    chunks.push(chunk)
                });

                res.on("end", function () {

                    /**
                     * @TODO fix this warning somehow
                     */

                    let body = JSON.parse(Buffer.concat(chunks));

                    //console.log(body);
                    keepAlphabetical++;
                    console.log('Inside search and remaining iterations = '+ (iterations - keepAlphabetical));

                    if(body['photos']['photo'][Math.floor(Math.random() * body['photos']['photo'].length)] !== undefined){
                        resolve(body['photos']['photo'][Math.floor(Math.random() * body['photos']['photo'].length)].id);
                    }
                    else{
                        resolve(5565732642);
                    }
                });
            });

            req.on('error', (e) => {
                console.error(e);
                return e;
            });

            req.end();
        })
    }

    /**
     * @name saveDataToDB
     * @alias ImageSearch().saveDataToDB()
     * @Description Coming Soon!
     * @method
     * @methodOf ImageSearch
     * @memberOf ImageSearch
     *
     * @param {object} flickrJson - JSON object with data about image of specific id.
     * @param {object} imagePath - JSON object with cloudinary data about stored image
     * @returns {Promise}
     * @example Coming Soon!
     */
    saveDataToDB(imagePath, flickrJson, id) {

        return new Promise((resolve, reject) => {

            let imageObj = {};

            if(id !== 5565732642) {
                imageObj.Order = clementsArray[keepAlphabetical].Order;
                imageObj.Family = clementsArray[keepAlphabetical]['Family name'];
                imageObj.CommonFamilyName = clementsArray[keepAlphabetical]['Common family name'];
                imageObj.ScientificName = clementsArray[keepAlphabetical]['Scientific name'];
                imageObj.Category = clementsArray[keepAlphabetical].Category;
                imageObj.EnglishName = clementsArray[keepAlphabetical]['English name'];
                imageObj.ImagesData = {};
                imageObj.ImagesData._imageID = mongoose.Types.ObjectId();
                imageObj.ImagesData.VerifiedBird = false;
                imageObj.ImagesData.FlaggedAsNonBird = 0;
                imageObj.ImagesData.Cropped = false;

                if(flickrJson['photo']["location"]){
                    imageObj.ImagesData.HasGeoData = true;
                }
                else {
                    imageObj.ImagesData.HasGeoData = false;
                }

                imageObj.ImagesData.Cloudinary = imagePath;
                imageObj.ImagesData.FlickrData = flickrJson['photo'];

                goose.collection('images').insert(imageObj);

                console.log('This is the imageObj:   \n' + imageObj);
            }
            resolve(imageObj);
        })
    }
}

module.exports = ImageSearch;

let imageSearch = new ImageSearch();

imageSearch.getPhoto();

