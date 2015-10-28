var express = require('express'),
    path = require('path'),
    app = express(),
    dataBaseServer = require('./src/server/database/create-sample-database');

/*
 Database
 */
var db = dataBaseServer.use({
    name: 'grid',
    username: 'root',
    password: '1111'
});


app.use(express.static(path.join(__dirname, '/public')));
app.use(express.bodyParser());
/*
 Processing the request /server/data
 */
app.get('/server/data', function(req, res){
    var query;
    if(typeof req.query.filter === 'undefined'){
        query = 'select * from AssetGrid ';
    }
    else{
        query = 'select * from AssetGrid WHERE ';
        query = getRequestFilter(req.query.filter, query);
        query = getRequestSorting(req.query.sort, query);
        if(query == ""){
            query = 'select * from AssetGrid ';
        }
    }
    console.log(query);
    db.query(query).then(function (results) {
        res.send(results);
    });
});

app.listen(8000);
/*
 To build the query to filter the data
    @param filter: object with data to filter
    @param startQuery: start request
* */
function getRequestFilter(filter, startQuery){
    var query = startQuery;
    var index = 0;
    var queryArray = new Array();
    for(var key in filter){
        if(filter[key] != "" && filter[key] != 'null'){
            queryArray[index] =  key + ' like \'' + filter[key] + '%\'';
            index++;
        }
    }
    if(index == 0){
        return "";
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
    return query;
}
/*
 To build the query to sort the data
    @param sort: object with data to sort
    @param startQuery: start request
 */
function getRequestSorting(sort, startQuery){
    var query = startQuery;
    if(query == ""){
        query = 'select * from AssetGrid';
    }
    if(typeof sort != 'undefined'){
        for(var key in sort){
            query += ' order by ' + key + ' ' + sort[key];
        }
    }
    return query;
}