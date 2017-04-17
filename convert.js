var fs = require('fs');

var xml2js = require('xml2js');

var parser = new xml2js.Parser();

fs.readFile('master_ioc_list_xml.xml', function (err, data) {
	parser.parseString(data, function (err, result) {
		var newName = JSON.stringify(result, null, "\t");

		fs.writeFileSync('master-ioc.json', newName, 'utf-8');
	});
});
