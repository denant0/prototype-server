var buttonMetadata = require('./sample-buttons-metadata');


var ARCHIBUSColumns = [
    {
        id: 'AssetType',
        title: 'Asset Type',
        groupBy: true,
        sortBy: 'asc', // or 'desc'
        dataType: 'text'
    },
    {
        id: 'cost_purchase',
        title: 'Purchase Cost',
        width: 200,
        dataType: 'number',
        showTotals: true
    },
    {
        id: 'quantity_mtbf',
        title: 'Mean Time Between Failures',
        width: 200,
        dataType: 'integer',
        showTotals: true
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
        cssClass: 'cssClassCountryCode',
        dataType: 'enum'
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
        id: 'Date',
        title: 'Date',
        width: 200,
        dataType: 'date',
        dateTimeFormat: ''
    },
    {
        title: 'Action',
        width: 200,
        action: buttonMetadata
    }
];






module.exports = ARCHIBUSColumns;
