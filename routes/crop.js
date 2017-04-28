let express = require('express');

// eslint-disable-next-line new-cap
let router = express.Router();

/* GET crop page. */
router.get('/', function(req, res, next) {
    res.render('crop', {title: 'SpeezID'});
});

module.exports = router;
