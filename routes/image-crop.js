let express = require('express');
let router = express.Router();
let Cropper = require('cropperjs');
let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/speezid');

let connection = mongoose.connection;

exports.teamlist = function teamlist(gname, callback) {
    let Team = mongoose.model('Team');
    Team.find({
        'GroupName': gname
    }, function(err, teams) {
        if (err) {
            console.log(err);
        } else {
            console.log(teams);
            callback("", teams);
        }
    }); // end Team.find
};

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('image-crop', { title: 'SpeezID', data : data });
});


module.exports = router;