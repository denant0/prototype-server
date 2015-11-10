var buttonMetadata = require('./sample-buttons-metadata');
var classStyle = require('./sample-cell-style-metadata');

var ARCHIBUSColumns = [
    {
        id: 'AssetType',
        title: 'Asset Type',
        groupBy: true,
        sortBy: 'asc', // or 'desc'
        dataType: 'text'
    },
    {
        id: 'AssetStandard',
        title: 'Asset Standard',
        width: 200,
        dataType: 'text'
    },
    {
        id: 'AssetStatus',
        title: 'Asset Status',
        width: 200,
        dataType: 'text'
    },
    {
        id: 'TitleDescription',
        title: 'Title Description',
        width: 200,
        dataType: 'text'
    },
    {
        id: 'GeoRegionID',
        title: 'Geo-RegionID',
        width: 200,
        dataType: 'text'
    },
    {
        id: 'CountryCode',
        title: 'Country Code',
        width: 200,
        cssClass: function (container, cellInfo, t,y){
            if (cellInfo.ch1 && ! cellInfo.$group) return "row-marked";
            var currentEnumStyle = classStyle[y];
            for(var element in currentEnumStyle){
                if(container == currentEnumStyle[element].cellText){
                    return currentEnumStyle[element].classStyle;
                }
            }
        },
        dataType: 'text'
    },
    {
        id: 'StateCode',
        title: 'State Code',
        width: 200,
        dataType: 'text'
    },
    {
        id: 'CityCode',
        title: 'City Code',
        width: 200,
        dataType: 'text'
    },
    {
        id: 'SiteCode',
        title: 'Site Code',
        width: 200,
        dataType: 'text'
    },
    {
        id: 'BuildingCode',
        title: 'Building Code',
        width: 200,
        dataType: 'text'
    },
    {
        id: 'FloorCode',
        title: 'Floor Code',
        width: 200,
        dataType: 'text'
    },
    {
        id: 'RoomCode',
        title: 'Room Code',
        width: 200,
        dataType: 'text'
    },
    {
        id: 'BusinessUnit',
        title: 'Business Unit',
        width: 200,
        dataType: 'text'
    },
    {
        id: 'DivisionCode',
        title: 'Division Code',
        width: 200,
        dataType: 'text'
    },
    {
        id: 'DepartmentCode',
        title: 'Department Code',
        width: 200,
        dataType: 'text'
    },
    {
        id: 'Data',
        title: 'Data',
        width: 200,
        dataType: 'data'
    },
    {
        title: 'Action',
        width: 200,
        action: buttonMetadata
    }
];






module.exports = ARCHIBUSColumns;
