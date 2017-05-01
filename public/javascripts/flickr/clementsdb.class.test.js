
let ClementsDB = require('./clementsdb.class');
let clements = new ClementsDB;

test('ClementsDB is an instance of ClementsDB', () => {
  expect(new ClementsDB).toBeInstanceOf(ClementsDB);
});

test('clements.getByOrder(): Anseriformes has an array length of 448', () => {
  clements.getByOrder('Anseriformes').then((clemObj)=>
  expect(clemObj.length).toEqual(448));
});

test('clements.getByOrder(): returns an object with "Order" as a key ', () => {
  clements.getByOrder('Anseriformes').then((clemObj)=>
      expect(clemObj[1]['Order']).toEqual('Anseriformes'));
});

// test('Array of objects reduced to array of Strings', () => {
//   let obj = [
//     {
//       '_id': '58f5620899cc6501ab4cfe13',
//       'eBird species code v2016': 'ostric2',
//       'sort v2016': 1,
//       'Order': 'Struthioniformes',
//       'Family name': 'Struthionidae',
//       'Common family name': 'Ostriches',
//       'eBird species group': 'Ostriches',
//       'Category': 'species',
//       'English name': 'Common Ostrich',
//       'Scientific name': 'Struthio camelus',
//       'Range': '',
//       'Extinct': '',
//       'Extinct year': '',
//     },
//     {
//       '_id': '58f5620899cc6501ab4cfe14',
//       'eBird species code v2016': 'ostric2',
//       'sort v2016': 2,
//       'Order': 'Struthioniformes',
//       'Family name': 'Struthionidae',
//       'Common family name': 'Ostriches',
//       'eBird species group': 'Ostriches',
//       'Category': 'subspecies',
//       'English name': '',
//       'Scientific name': 'Struthio camelus camelus',
//       'Range': '',
//       'Extinct': '',
//       'Extinct year': '',
//     }];
//   clements.reduceToSpeciesArray(obj).then((newObj) =>
//       expect(newObj).toEqual(['Struthio+camelus','Struthio+camelus+camelus'])
//   );
// });
