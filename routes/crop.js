let express = require('express');
let router = express.Router();
let Cropper = require('cropperjs');
let mongoose = require('mongoose');
let cloudinary = require('cloudinary');


/* GET crop page. */
router.get('/', function(req, res, next) {
    res.render('crop', { title: 'SpeezID' });
});


module.exports = router;