let mongoose = require('mongoose');
let imageSchema = new mongoose.Schema({
    Order: String,
    Family: String,
    CommonFamilyName: String,
    ScientificName: String,
    Category: String,
    EnglishName: String,
    Images: [{ imageFrom: String, imagePath: String, dateAdded: String }]
});

mongoose.model('Images', imageSchema);
