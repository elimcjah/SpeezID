let mongoose = require('mongoose');

let ImageSearch = require('./image-search');

let Clements = new require('../../../model/clements.js');

mongoose.connect('mongodb://localhost:27017/speezid');


let order = 'Struthioniformes';

// /^Struthio camelus/

class MultiImageSearch {
    constructor(){

    }

    sendData(){
        this.getClements().then((data) =>
        //console.log(data[0]['Scientific name']),
        new ImageSearch(data[0]).getPhoto(),
            mongoose.connection.close()
        );
    }

    getClements(){
        return new Promise((resolve, reject) =>
            Clements.find({
                "Order": order
            }, function(err, species) {
                if (err) {
                    console.log("Error has occurred  " + err);
                } else {
                   // console.log(species);
                    resolve(species);
                }
            })

        )
    }



}


// for (let i = 0; i < 1; i++){

// }

let multi = new MultiImageSearch();

multi.sendData();

module.exports = MultiImageSearch;

