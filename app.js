
new (require(__dirname + '/app.class.js'))();

let express = require('express');
let http = require('http');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let mongodb = require('mongodb');
let mongoose = require('mongoose');
let cloudinary = require('cloudinary');

let Images = require('./model/images');
let Clements = require('./model/clements');

let index = require('./routes/index');
let users = require('./routes/users');
let searchFlickr = require('./routes/search-flickr');
let crop = require('./routes/crop');

let app = express();


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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


app.use(express.static(path.join(__dirname, 'public')));
app.use('/model', express.static(__dirname + '/model'));

app.use('/', index);
app.use('/users', users);
app.use('/search-flickr', searchFlickr);
app.use('/crop', crop);


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});



module.exports = app;
