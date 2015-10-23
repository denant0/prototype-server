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
    var query;
    if(typeof req.query.filter === 'undefined'){
        query = 'select * from AssetGrid ';
    }
    else{
        query = 'select * from AssetGrid WHERE ';
        var filter = req.query.filter;
        var flag = false;
        var index = 0;
        var queryArray = new Array();
        for(var key in filter){
            if(filter[key] != "" && filter[key] != 'null'){
                queryArray[index] =  key + ' like \'' + filter[key] + '%\'';
                index++;
                flag = true;
            }
        }
        if(index == 1){
            query += queryArray[0];
        }
        else{
            for(var i=0;i<index;i++){
                if(i == index-1)
                    query += queryArray[i];
                else
                    query += queryArray[i] + ' and ';
            }
        }
        if(!flag){
            query = 'select * from AssetGrid';
        }
        if(typeof req.query.sort != 'undefined'){
            var sort = req.query.sort;
            for(var key in sort){
                query += ' order by ' + key + ' ' + sort[key];
            }
            flag = true;
            console.log('sort');
        }
        if(!flag){
            query = 'select * from AssetGrid ';
        }
    }
    console.log(query);
    db.query(query).then(function (results) {
        res.send(results);
    });
});

app.listen(8000);