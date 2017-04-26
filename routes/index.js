let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let cloudinary = require('cloudinary');

const Image = new require('../model/images.js');

require('dotenv').config();

mongoose.connect(process.env.DB_URL);
mongoose.set('debug', true);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SpeezID' });
});

/**
 * @TODO have image sent to crop page onload also have crop page return a new image or ten and have them in state
 */

/**
 *  Get Images
 */
router.get('/get-image', function(req, res, next) {

  Image.findOne({'ImagesData.Cropped': false})
      .exec(function(err, imageData){
        if(err){
          res.send('err has occurred')
        } else {

          let imageToDisplay = imageData.ImagesData[0].Cloudinary.public_id;
          let displayThis = cloudinary.image(imageToDisplay);
          console.log(displayThis);
          console.log(typeof  displayThis);
          displayThis = displayThis.slice(0, 5) + ' id="image" ' + displayThis.slice(5);
                res.send(displayThis);
        }
      })
});



module.exports = router;
