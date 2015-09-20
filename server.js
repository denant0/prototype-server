var express = require('express');
var path = require('path');
var app = express();


var server = require('./src/server/database/create-sample-database');
var db = server.use({
    name: 'grid',
    username: 'root',
    password: '1111'
});


app.use(express.static(path.join(__dirname, '/public')));
app.use(express.bodyParser());



app.get('/data', function(req, res){

    db.query('select from AssetGrid', {
        limit: 1000
    }).then(function (results){
        res.send(results);
    });
});

app.listen(8000);