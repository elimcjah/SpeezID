/**
 * @author Elijah McClendon <Elijah@davinciinstitute.com>
 *
 * @summary image-search uses asynchronous calls with promises to save images/data from Flickr and combine with select
 * information from the saved Clements Database of birds.
 *
 * @namespace image-search
 * See {@link https://www.flickr.com/services/api/|Flickr API} &
 * {@link http://cloudinary.com/documentation/solution_overview|Cloudinary API} for 3rd Party API information
 */

/**
 * @constant {String} cloudinary - calls the cloudinary node module for uploading photos
 * @constant {String} dir - appended to the beginning of image name so Cloudinary stays organized
 * @constant {String} fs - calls the Core fs module (File System Module)
 * @constant {String} getImageURL - directory to add to Flickr API URL gives size options for specific photo
 * @constant {String} getInfo - specific directory to add to Flickr API URL for information about specific photo
 * @constant {String} @private key - sets the API key for Flickr API @private
 * @constant {String} mongoose - calls the mongoose node module for abstraction of MongoDB data
 * @constant {String} request - calls the request node module for making http requests
 * @constant {String} search - specific directory to add to Flickr API URL to perform a keyword search
 * @constant {String} url - base URL for flickr API **/

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




cloudinary.config({
    cloud_name: 'elijahs',
    api_key: '263371231383956',
    api_secret: 'Ef8mZYvcc_LWY48a1VOVKmcWd4Y'
});


/**
 * @TODO make a change to push cwd __dirname and pop it off at the end
 * @TODO hide private API keys somewhere not visible to public or anyone else if project is on github.
 * @TODO push data from clementsobj, flickrJSON, and cloudinary to imageDB
 */

class ImageSearch {

    /**
     * @summary Takes an object from clementsDB, reduces it down to just 'Scientific name',calls flickr api for image,
     * save image to Cloudinary, & then saves JSON data about photos and species to image collection in MongoDB.
     * @name ImageSearch
     * @class
     * @classdesc ImageSearch takes an input of an object, usually sent from ./image-search-batch.js, and reduces the
     * object down to just the scientific name. Asynchronous calls are then made in following order. First, the
     * keyword is used as input for search() method using the url, key, and search constants to call Flickr API and
     * return an id number for a specific photo. Second, the id returned from search() method is used as an input param
     * for the getFlickrPhoto() method. The the constants url, key, and getImageURL are also used in this method to
     * take an image id and call the getSizes api. In turn, a selection is made to the size desired and a URL is
     * returned. Third, we again use the same id used in getFlickrPhoto() method that was generated in search() method
     * to make another api call to Flickr using constants url, key, and getInfo. This call returns all the JSON data
     * associated with the image and user that uploaded the image. Fourth, we will use the storeFile() method with
     * params of imageURL and id to push the image to our Cloudinary cloud server. The storeFile() method also uses
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
    constructor(object) {

        this.network = require('https');
        this.clementsObj   = object;
        this.familyDir     = dir + this.keyword + '/';
        this.jsonExt = '.json';
        this.keyword       = this.clementsObj['Scientific name'].split(' ').join('+');
    }


    getPhoto() {
        this.search().then((id) =>
            this.getFlickrPhoto(id).then((imageURL) =>
                this.getPhotoContents(id).then((flickrJson) =>
                    this.storeFile(imageURL, id).then((imagePath) =>
                            console.log('Image successfully created at ' + JSON.stringify(imagePath.secure_url) +
                                ' with FlickrJSON of' + JSON.stringify(flickrJson, null, "\t"))
                    ))));
    }

    /**
     * @name getFlickrPhoto
     * @alias ImageSearch().getFlickrPhoto(id)
     * @methodOf ImageSearch
     * @method getFlickrPhoto
     * @description The id returned from search() method is used as an input param with the constants url, key,
     * and getImageURL. The method takes an image id and calls the getSizes api. In turn, a selection
     * is made to the size desired with the variable sizeOfImage and a URL is returned to an image of selected size.
     * @param id
     * @returns {Promise} imageURL - sends back an imageURL to the getPhoto chain of Promises.
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

                /** @type {string} sizeOfImage - determines the size of the Flickr Image to save  */
                let sizeOfImage = 'Medium';

                let chunks = [];

                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                res.on("end", function () {
                    let body = Buffer.concat(chunks);

                    body = JSON.parse(body);

                    //console.log(body);

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
     * Uses an input of this.keyword
     * @returns {Promise}
     */
    search() {

        return new Promise((resolve, reject) => {

            let options = {
                "method": "GET",
                "hostname": url,
                "path": search + key + "&tags=" + this.keyword + "&format=json&nojsoncallback=?"
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

                    resolve(body['photos']['photo'][Math.floor(Math.random() * body['photos']['photo'].length)].id);
                });
            });

            req.on('error', (e) => {
                console.error(e);
                return e;
            });

            req.end();
        })
    }

    storeFileJSONinfo(contents) {

        return new Promise((resolve, reject) => {

            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }

            let imageJSON = dir + this.keyword + '-' + contents['photo'].id + this.jsonExt;

            if(fs.existsSync(imageJSON)){

                contents = JSON.stringify(contents, null, "\t");

                fs.writeFileSync(imageJSON, contents, 'utf-8');


            } else {

                contents = JSON.stringify(contents, null, "\t");

                fs.writeFileSync(imageJSON, contents, 'utf-8');

            }

            resolve(imageJSON)
        });
    }

    storeFile(imageURL, id){
        console.log('storeFile');
        return new Promise((resolve, reject) => {

             let jpgFile = this.familyDir + this.keyword + '-' + id;

             let cloudinaryResult = cloudinary.uploader.upload(imageURL,
                function(result) { console.log(result) },
                { public_id: jpgFile });
            resolve(cloudinaryResult);
        });
    }
}

module.exports = ImageSearch;