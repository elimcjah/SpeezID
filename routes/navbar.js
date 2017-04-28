/**
 * Created by Elijah McClendon on 4/21/17.
 */

let express = require('express');

// eslint-disable-next-line new-cap
let router = express.Router();

/* GET Navigation Bar*/
router.about = function(req, res) {
    res.render('navbar', {title: 'Express'});
};

module.exports = router;
