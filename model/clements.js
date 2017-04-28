'use strict';

let mongoose = require('mongoose');
let clementsSchema = new mongoose.Schema({
    'eBird species code v2016': String,
    'sort v2016': Number,
    'Order': String,
    'Family name': String,
    'Common family name': String,
    'eBird species group': String,
    'Category': String,
    'English name': String,
    'Scientific name': String,
    'Range': String,
    'Extinct': Boolean,
    'Extinct year': Number,
});

module.exports = mongoose.model('Clements', clementsSchema);
