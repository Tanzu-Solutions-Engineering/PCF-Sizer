var express = require('express');
var app = express();
var glob = require('glob');
var fs = require('fs');

app.use(express.static('.'));

app.get('/buildnumber', function(req, res) {
    var vcapApplication = process.env.VCAP_APPLICATION
        || '{ "application_name": "local-dev", "application_uris": [ "localhost:3000" ] }';

    res.send(vcapApplication);
});

app.get('/ersjson/:iaas/:version', function(req, res){
    //TODO Is this safe?
    var matchingFiles = glob.sync('js/data/ers_' + req.params['iaas']  + '_*-' + req.params['version'] + '.json');
    var json = {};
    matchingFiles.forEach(function(file) {
      var size = file.split('_')[2];
      json[size] = JSON.parse(fs.readFileSync(file));
    });
    res.send(JSON.stringify(json));
});

app.get('/services/:service/versions', function(req, res){
    var matchingFiles = glob.sync('js/data/services/' + req.params['service']  + '_*-*.json');
    var versions = [];
    matchingFiles.forEach(function(file) {
        versions.push(file.split('-')[1].replace('.json', ''));
    });
    res.send(versions)
});

app.get('/services', function(req, res) {
    var services = [];
    var serviceJSONs = glob.sync('js/data/services/*.json');
    serviceJSONs.forEach(function(file) {
        var withPath = file.split('-')[0];
        var serviceName = withPath.split('/')[3];
        if(-1 == services.indexOf(serviceName)) {
            services.push(serviceName)
        }
    });
    res.status(200).json(services);
});

app.get('/tile/:iaas/:name/:version', function(req, res) {
    var filePath = '/js/data/services/' + req.params['name'] + "_" + req.params['iaas'] + "-" + req.params['version']+ ".json";
    res.contentType('application/json').redirect(filePath);
});

app.get('/instanceTypes/:iaas', function(req, res) {
    var filePath = '/js/data/' + req.params['iaas'] + "_" + "instance_types.json";
    res.contentType('application/json').redirect(filePath);
});


var port = process.env.PORT||3000;
console.log("PCF Sizer:: " + "Starting App on port :" + port);
app.listen(port);
