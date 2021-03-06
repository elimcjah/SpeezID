let express = require('express');
// eslint-disable-next-line new-cap
let router = express.Router();

/**
 * The Signup Router
 *
 */
router.get('/signup', function(req, res, next) {
    res.render('signup');
});

/**
 * The Login Router
 */
router.get('/login', function(req, res, next) {
    res.render('login');
});

/**
 * Post the signup info to our MongoDB
 */
router.post('/signup', function(req, res, next) {
    // let name = req.body.name;
    // let email     = req.body.email;
    // let username  = req.body.username;
    // let password  = req.body.password;
    // let password2 = req.body.password2;
});

module.exports = router;
