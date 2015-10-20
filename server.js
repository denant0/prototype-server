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



app.get('/server/data', function(req, res){
    console.log(req.query);
    console.log(req.query.filter);
    if(typeof req.query.filter === 'undefined'){
        console.log("load data");
        db.query('select * from AssetGrid ').then(function (results) {

            res.send(results);
        });
    }
    else{
        var keys = Object.keys(req.query.filter);
        console.log(keys);
        for(var i=0;i<keys.length;i++){
           if(req.query.filter[keys[i]] != '' && req.query.filter[keys[i]] != null){
               console.log(req.query.filter[keys[i]]);
            }
        }
    }



});

app.listen(8000);