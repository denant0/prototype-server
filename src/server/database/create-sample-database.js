var OrientDB = require('orientjs');
var data = require('../sample-data/sample-data-assets');

var server = OrientDB({
    host: 'localhost',
    port: 2424,
    username: 'root',
    password: '1111'
});



var isCraeteGridDatabase = false;
server.list()
    .then(function (dbs) {
        for(var i=0;i<dbs.length;i++)
        {
            if(dbs[i].name == 'grid')
            {
                isCraeteGridDatabase = true;

            }
            console.log(dbs[i].name);
        }
        if(isCraeteGridDatabase)
        {
        }
        else
        {
            server.create({
                name: 'grid',
                type: 'graph',
                storage: 'plocal'
            })
                .then(function (db) {
                    console.log('Created a database');
                    db.class.create('AssetGrid')
                        .then(function (assetClass) {
                            console.log('Created classes: ' + assetClass.name);

                            assetClass.property.create([{
                                name: 'AssetType',
                                type: 'String'
                            }, {
                                name: 'AssetStandard',
                                type: 'String'
                            }, {
                                name: 'AssetStatus',
                                type: 'String'
                            }, {
                                name: 'TitleDescription',
                                type: 'String'
                            }, {
                                name: 'GeoRegionID',
                                type: 'String'
                            }, {
                                name: 'CountryCode',
                                type: 'String'
                            }, {
                                name: 'StateCode',
                                type: 'String'
                            }, {
                                name: 'CityCode',
                                type: 'String'
                            }, {
                                name: 'SiteCode',
                                type: 'String'
                            }, {
                                name: 'BuildingCode',
                                type: 'String'
                            }, {
                                name: 'FloorCode',
                                type: 'String'
                            }, {
                                name: 'RoomCode',
                                type: 'String'
                            }, {
                                name: 'BusinessUnit',
                                type: 'String'
                            }, {
                                name: 'DivisionCode',
                                type: 'String'
                            }, {
                                name: 'DepartmentCode',
                                type: 'String'
                            }, {
                                name: 'Date',
                                type: 'String'
                            }, {
                                name: 'cost_purchase',
                                type: 'Integer'
                            }, {
                                name: 'quantity_mtbf',
                                type: 'Integer'
                            }, {
                                name: 'idData',
                                type: 'String'
                            }]).then(function () {console.log('Property created.'); console.log('End create database.');});


                            assetClass.create(data)
                                .then(function (record) {
                                    console.log('Created record');
                                });

                        });
                });
        }

        console.log('There are ' + dbs.length + ' databases on the server.');
    });

module.exports = server;
