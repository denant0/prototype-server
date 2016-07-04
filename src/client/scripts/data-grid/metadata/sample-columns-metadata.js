var buttonMetadata = require('./sample-buttons-metadata');


var ARCHIBUSColumns = [
    {
        id: 'AssetType',
        title: 'Asset Type',
        groupBy: true,
        sortBy: 'asc',
        dataType: 'enum'
    },
    {
        id: 'cost_purchase',
        title: 'Purchase Cost',
        dataType: 'number',
        showTotals: true,
        //groupText: 'Purchase Cost',
        //batch: 'cost'
    },
    {
        id: 'quantity_mtbf',
        title: 'Mean Time Between Failures',
        dataType: 'integer',
        showTotals: true,
        //groupCol: 'cost'
    },
    {
        id: 'AssetStatus',
        title: 'Asset Status',
        dataType: 'enum',
        //groupCol: 'cost'
    },
    {
        id: 'TitleDescription',
        title: 'Title Description',
        dataType: 'text'
    },
    {
        id: 'GeoRegionID',
        title: 'Geo-RegionID',
        dataType: 'text',
        groupText: 'Code',
        batch: 'code'
    },
    {
        id: 'CountryCode',
        title: 'Country Code',
        cssClass: 'cssClassCountryCode',
        dataType: 'enum',
        groupCol: 'code'
    },
    {
        id: 'StateCode',
        title: 'State Code',
        dataType: 'text',
        groupCol: 'code'
    },
    {
        id: 'CityCode',
        title: 'City Code',
        dataType: 'text',
        groupCol: 'code'
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
        id: 'BusinessUnit',
        title: 'Business Unit',
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
