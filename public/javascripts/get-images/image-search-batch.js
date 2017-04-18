
const search = require('./image-search.js');







for (i = 0; i < 25; i++){
    require('child_process').execSync('node ./public/javascripts/get-images/image-search.js')
}