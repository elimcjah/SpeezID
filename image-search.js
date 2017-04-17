/**
 * 
 * @file
 * In this assignment, you need to author a function to perform an arbitrary
 * image search.
 * 
 */

let fs      = require('fs');

let request = require('request');

const key         = '&api_key=b2262c0ff71fe60473136cc5ecb7b6a4';

const url         = 'api.flickr.com';

const search      = '/services/rest/?method=flickr.photos.search';

const getInfo     = '/services/rest/?method=flickr.photos.getInfo';

const getImageURL = '/services/rest/?method=flickr.photos.getSizes';

const dir         = './tmp/';

// This is the only item changed to change the search
let searchTerm    = 'Struthio camelus';

let keyword       = searchTerm.split(' ').join('+');

class ImageSearch {
    constructor() {
        this.network = require('https');
        this.jsonExt = '.json';
        this.jpgExt  = '.jpg';
    }

    /**
     * Gets a photo given a keyword.
     * @param {string} keyword The keyword to search for.  
     * @param {Number} idx (Optional) The index of the results to store.
     */
    getPhoto(keyword) {

        this.search(keyword).then((id) =>
            this.getPhotoContents(id).then((contents) =>
                this.storeFileJSONinfo(contents, keyword).then((pathName) =>
                    this.getFlickrPhoto(id).then((imageURL) =>
                        this.storeFile(imageURL, id).then((imagePath) =>

                                console.log('Image successfully created at '+ imagePath)
                        )))));
    }

    getFlickrPhoto (id){

        return new Promise((resolve, reject) => {

            let options = {
                "method": "GET",
                "hostname": url,
                "path": getImageURL + key + "&photo_id=" + id + "&format=json&nojsoncallback=?"
            };

            let req = this.network.request(options, function (res) {

                // Set the image size here.
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

    /**
     * Gets the photo contents and returns the network response as a promise.
     * Takes an input of an ID.
     * @param {String} id The Flickr photo ID.
     * @return {Promise} A promise that resolves with the photo contents of the
     * ID.
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
     * This function should initiate the request and return a promise with the
     * image URL for the first result.  Note that you'll need to initiate two
     * requests to make this happen.
     * 
     * ex. 
     * format=json
     * method=flickr.photos.search
     * api_key=d103d9be76c00510e3738c283338125e
     * text=waterfall
     * 
     * https://www.flickr.com/services/api/flickr.photos.search.html
     * https://www.flickr.com/services/api/flickr.photos.getSizes.html
     * 
     * @param {String} keyword The keyword to search and pass to the Flickr API.
     * @return {Promise} A promise that resolves with the search listing of the
     * inputted keyword.
     */
    search(keyword) {

        return new Promise((resolve, reject) => {

            let options = {
                "method": "GET",
                "hostname": url,
                "path": search + key + "&tags=" + keyword + "&format=json&nojsoncallback=?"
            };

            let req = this.network.request(options, function (res, err) {

                let chunks = [];

                res.on("data", function (chunk) {
                    chunks.push(chunk)
                });

                res.on("end", function () {

                    //TODO fix this warning somehow
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

    /**
     * Stores the file in the filesystem.
     * @param {String} filename The filename to use.
     * @param {String} contents The contents of the file.
     */
    storeFileJSONinfo(contents, keyword) {

        return new Promise((resolve, reject) => {

            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }

            let imageJSON = dir + keyword + '-' + contents['photo'].id + this.jsonExt;

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

        return new Promise((resolve, reject) => {

            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }

            let jpgFile = dir + keyword + '-' + id + this.jpgExt;

            request(imageURL, {encoding: 'binary'}, (error, response, body) =>

                    fs.writeFile(jpgFile, body, 'binary', function (err) {}));

            resolve(jpgFile)
        });
    }
}

(new ImageSearch()).getPhoto(keyword);

module.exports = ImageSearch;