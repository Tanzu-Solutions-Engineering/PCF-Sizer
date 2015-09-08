var express = require('express');
var app = express();

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

app.get('/services/:service/versions', vunction(req, res){
    res.send('[]')
});

app.listen(process.env.PORT || 3000);
