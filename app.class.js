/**
 * @file Javascript - App.js
 * @author Elijah McClendon <Elijah@fungry.com>
 */


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
        this.express = require('express');
        this.app = this.express();
        this.path = require('path');
        this.setEnvVariables();
        this.setViewEngine();
        this.handleErrors();

    }
    /**
     * Sets up the Environment Variables saved in the .env file.
     *
     */
     setEnvVariables(){

        const dotEnv = require('dotenv');
        dotEnv.config();


    }

     setViewEngine(){

        /**
         * Set the view engine to pug/jade and the path to 'views'
         * */
        this.app.set('views', this.path.join(__dirname, 'views'));
        this.app.set('view engine', 'pug');

    }

    handleErrors() {
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

    setPath(){


    }

}

module.exports = App;