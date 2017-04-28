let express = require('express');
// eslint-disable-next-line new-cap
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('search-flickr', {title: 'SpeezID'});
});

module.exports = router;
