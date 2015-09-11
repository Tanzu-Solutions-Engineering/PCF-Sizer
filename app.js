var express = require('express');
var app = express();
var glob = require('glob');

app.use(express.static('.'));

app.get('/buildnumber', function(req, res) {
    var vcapApplication = process.env.VCAP_APPLICATION
        || '{ "application_name": "local-dev", "application_uris": [ "localhost:3000" ] }';

    res.send(vcapApplication);
});

app.get('/ersjson/:version', function(req, res){
    //TODO Is this safe?
    res.redirect('/js/data/ers_vms_single_az_template-' + req.param('version') + '.json')
});

app.get('/services/:service/versions', function(req, res){
    var matchingFiles = glob.sync('js/data/services/' + req.param('service')  + '-*.json');
    var versions = [];
    matchingFiles.forEach(function(file) {
        versions.push(file.split('-')[1].replace('.json', ''));
    });
    res.send(versions)
});

app.listen(process.env.PORT || 3000);
