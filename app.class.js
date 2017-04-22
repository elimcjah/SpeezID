/**
 * @file Javascript - App.js
 * @author Elijah McClendon <Elijah@fungry.com>
 */

const express = require('express');
const http = require('http');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
const app = express();

/**
 *
 * @class
 * @classdescription
 *
 */

class App {

    /**
     * Constructor for the App class
     * @constructor
     * @requires express
     * */
    constructor()
    {
        console.log('App constructor')

        this.express = require('express');
        this.app = this.express();
        this.path = require('path');
        this.setRoutes();
        this.setEnvVariables();
        this.setViewEngine();
        this.handleErrors();
        this.setLogger();
        this.setCloudinary();

    }



    /**
     * Sets up the Environment Variables saved in the .env file.
     *
     */
     setEnvVariables(){
        console.log('setEnvVariables');
        const dotEnv = require('dotenv');
        dotEnv.config();


    }

    setViewEngine(){

        /**
         * Set the view engine to pug/jade and the path to 'views'
         * */

        console.log('setViewEngine');

        const app = this.express();
        app.set('views', this.path.join(__dirname, 'views'));
        app.set('view engine', 'pug');

    }

    handleErrors() {

        console.log('handleErrors');
        // catch 404 and forward to error handler
        this.app.use(function (req, res, next) {
            let err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        // error handler
        this.app.use(function (err, req, res, next) {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // render the error page
            res.status(err.status || 500);
            res.render('error');
        });
    }

    setRoutes(){

        console.log('setRoutes');
        const app = this.express();
        let path = require('path');
        let index = require('./routes/index');
        let users = require('./routes/users');
        let searchFlickr = require('./routes/search-flickr');
        let crop = require('./routes/crop');

        app.use(this.express.static(path.join(__dirname, 'public')));
        app.use('/model', this.express.static(__dirname + '/model'));


        app.use('/', index);
        app.use('/users', users);
        app.use('/search-flickr', searchFlickr);
        app.use('/crop', crop);

    }

    setLogger(){

        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(require('node-sass-middleware')({
            src: path.join(__dirname, 'public'),
            dest: path.join(__dirname, 'public'),
            indentedSyntax: true,
            sourceMap: true
        }));
    }

    setCloudinary(){
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_KEY,
            api_secret: process.env.CLOUDINARY_SECRET
        });
    }



}

module.exports = app;