let mongoose = require('mongoose');
exports.imageList = function imageList(imgname, callback) {
    let Image = mongoose.model('Images');
    Image.find({
        'Images': imgname
    }, function(err, images) {
        if (err) {
            console.log(err);
        } else {
            console.log(images);
            callback("", images);
        }
    });
};