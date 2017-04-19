let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');

const Image = new require('../../../model/images.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SpeezID' });
});

/**
 *  Get Images
 */
router.get('/get-image', function(req, res, next) {
    let resultArray = [];
    mongo.connect(url, function (err, db) {
        assert.equal(null, err);
        let cursor = db.collection('employees').find();
        cursor.forEach(function(doc, err) {
            assert.equal(null, err);
            resultArray.push(doc);
        }, function () {
            db.close();
            res.render('directory', {items: resultArray});
        });
    });
});

module.exports = router;
