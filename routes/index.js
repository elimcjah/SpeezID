let express = require('express');
// eslint-disable-next-line new-cap
let router = express.Router();
let mongoose = require('mongoose');
let cloudinary = require('cloudinary');
const ImageModel = require('../model/images.js');
const Image = new ImageModel;

require('dotenv').config();

mongoose.connect(process.env.DB_URL);
mongoose.set('debug', true);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'SpeezID'});
});

// TODO(me): Send array of image URLs to crop page to put heavy load upfront
// TODO(me): Return data to images collection after each cropped image

/**
 *  Get Images
 */
router.get('/get-image', function(req, res, next) {
  Image.findOne({'ImagesData.Cropped': false})
      .exec(function(err, imageData) {
        if(err) {
          res.send('err has occurred');
        } else {
          let imageToDisplay = imageData.ImagesData[0].Cloudinary.public_id;
          let displayThis = cloudinary.image(imageToDisplay);
          console.log(displayThis);
          console.log(typeof displayThis);
          displayThis = displayThis.slice(0, 5) + ' id="image" ' +
              displayThis.slice(5);
                res.send(displayThis);
        }
      });
});


module.exports = router;
