'use strict';

let mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId;

let nestedDoc = new mongoose.Schema({
    _imageID: ObjectId,
    VerifiedBird: { type: Boolean, default: false },
    FlaggedAsNonBird: Number,
    Cropped: { type: Boolean, default: false },
    HasGeoData: { type: Boolean, default: false },
    Cloudinary: Object,
    FlickrData: Object
});
let imagesSchema = new mongoose.Schema({
    Order: String,
    Family: String,
    CommonFamilyName: String,
    ScientificName: String,
    Category: String,
    EnglishName: String,
    ImagesData: [ nestedDoc ]
});

module.exports = mongoose.model('Images', imagesSchema);
