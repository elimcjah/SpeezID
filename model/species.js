let mongoose = require('mongoose');
// let Clements = new require('./clements.js');
mongoose.connect(process.env.DB_URL);

let clementsList = (orderName) => {
    let Clements = new require('./clements');
    Clements.find({
        'Order': orderName,
    }, function(err, species) {
        if (err) {
            console.log('Error has occurred  ' + err);
        } else {
           console.log(species);
            return species;
        }
    });
};

clementsList('Struthioniformes');

mongoose.connection.close();

module.exports = clementsList();
