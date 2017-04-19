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

let dbImages = require('./model/db-images');
let ebirdClements = require('./model/clements');

let index = require('./routes/index');
let users = require('./routes/users');
let searchFlickr = require('./routes/search-flickr');
let imageCrop = require('./routes/image-crop');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

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

app.use('/', index);
app.use('/users', users);
app.use('/search-flickr', searchFlickr);
app.use('/image-crop', imageCrop);

cloudinary.config({
    cloud_name: 'elijahs',
    api_key: '263371231383956',
    api_secret: 'Ef8mZYvcc_LWY48a1VOVKmcWd4Y'
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
