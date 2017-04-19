let express = require('express');
let router = express.Router();
let Cropper = require('cropperjs');
let mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost:27017/speezid');
//
// let connection = mongoose.connection;
//
// connection.on('error', console.error.bind(console, 'connection error:'));
// connection.once('open', function () {
//
//     connection.db.collection("ebird-clements", function(err, collection){
//         collection.find({ 'Scientific name' : /^Struthio camelus/}).toArray(function(err, data){
//             console.log(data); // it will print your collection data
//         })
//     });
// });


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('image-crop', { title: 'SpeezID' });
});


module.exports = router;