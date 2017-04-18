
let ImageSearch = require('./image-search');


let searchTerm = 'Struthio camelus australis';

for (let i = 0; i < 10; i++){
    (new ImageSearch(searchTerm)).getPhoto();
}




