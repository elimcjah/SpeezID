let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('search-flickr', { title: 'SpeezID' });
});

module.exports = router;