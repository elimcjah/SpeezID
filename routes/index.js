let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let cloudinary = require('cloudinary');

const Image = new require('../model/images.js');

mongoose.connect('mongodb://localhost:27017/speezid');
mongoose.set('debug', true);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SpeezID' });
});

/**
 *  Get Images
 */
router.get('/get-image', function(req, res, next) {

  Image.findOne({'ImagesData.Cropped': false})
      .exec(function(err, imageData){
        if(err){
          res.send('err has occurred')
        } else {
          let imageToDisplay = JSON.stringify(imageData);
          imageToDisplay = imageData.ImagesData[0].Cloudinary.public_id;
           let displayThis = cloudinary.image(imageToDisplay, { width: 100, height: 150, crop: "fill" })
          console.log(imageToDisplay);
          res.render("crop", displayThis);
        }
      })

});



module.exports = router;
