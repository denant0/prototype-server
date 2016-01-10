var buttonMetadata = require('./sample-buttons-metadata');


var ARCHIBUSColumns = [
    {
        id: 'AssetType',
        title: 'Asset Type',
        groupBy: true,
        sortBy: 'asc', // or 'desc'
        dataType: 'enum'
    },
    {
        id: 'cost_purchase',
        title: 'Purchase Cost',
        dataType: 'number',
        showTotals: true
    },
    {
        id: 'quantity_mtbf',
        title: 'Mean Time Between Failures',
        dataType: 'integer',
        showTotals: true
    },
    {
        id: 'AssetStatus',
        title: 'Asset Status',
        dataType: 'enum'
    },
    {
        id: 'TitleDescription',
        title: 'Title Description',
        dataType: 'text'
    },
    {
        id: 'GeoRegionID',
        title: 'Geo-RegionID',
        dataType: 'text'
    },
    {
        id: 'CountryCode',
        title: 'Country Code',
        cssClass: 'cssClassCountryCode',
        dataType: 'enum'
    },
    {
        id: 'StateCode',
        title: 'State Code',
        dataType: 'text'
    },
    {
        id: 'CityCode',
        title: 'City Code',
        dataType: 'text'
    },
    {
        id: 'SiteCode',
        title: 'Site Code',
        dataType: 'text'
    },
    {
        id: 'Date',
        title: 'Date',
        dataType: 'date',
        dateTimeFormat: '%m/%d/%y'
    },
    {
        id: 'BuildingCode',
        title: 'Building Code',
        dataType: 'text'
    },
    {
        id: 'FloorCode',
        title: 'Floor Code',
        dataType: 'text'
    },
    {
        id: 'RoomCode',
        title: 'Room Code',
        dataType: 'text'
    },
    {
        id: 'BusinessUnit',
        title: 'Business Unit',
        dataType: 'text'
    },
    {
        id: 'DivisionCode',
        title: 'Division Code',
        dataType: 'text'
    },
    {
        id: 'DepartmentCode',
        title: 'Department Code',
        dataType: 'text'
    },
    {
        id: 'action',
        title: 'Action',
        width: 100,
        action: buttonMetadata
    }
];






module.exports = ARCHIBUSColumns;
