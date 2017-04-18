let mongoose = require('mongoose');
let imageSchema = new mongoose.Schema({
    Order: String,
    Family: String,
    Genus: String,
    Species: String,
    Subspecies: String,
    Images: [String]

});
mongoose.model('images', imageSchema);
mongoose.connect('mongodb://localhost/speezid');