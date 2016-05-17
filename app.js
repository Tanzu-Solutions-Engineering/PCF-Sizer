var express = require('express');
var app = express();
var glob = require('glob');
var path = require('path');

app.use('/bower_components', express.static('bower_components'));
app.use('/app', express.static('app'));
app.use('/images', express.static('images'));
app.use('/js', express.static('js'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/buildnumber', function(req, res) {
    var vcapApplication = process.env.VCAP_APPLICATION
        || '{ "application_name": "local-dev", "application_uris": [ "localhost:3000" ] }';

    res.send(vcapApplication);
});

app.get('/ersjson/:version', function(req, res){
    //TODO Is this safe?
    res.redirect('/js/data/ers_vms_single_az_template-' + req.params['version'] + '.json')
});

app.get('/services/:service/versions', function(req, res){
    var matchingFiles = glob.sync('js/data/services/' + req.params['service']  + '-*.json');
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

app.get('/tile/:name/:version', function(req, res) {
    var filePath = '/js/data/services/' + req.params['name'] + "-" + req.params['version']+ ".json";
    res.contentType('application/json').redirect(filePath);
});

var port = process.env.PORT||3000;
console.log("Shekel:: " + "Starting App on port :" + port);

app.listen(process.env.PORT || 3000);
