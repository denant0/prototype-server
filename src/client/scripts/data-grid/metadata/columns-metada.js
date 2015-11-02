var buttonsMetadata = require('./buttons-metadata');
var classStyle = require('./cell-style-metadata');

function status(value, obj, t, y){
    if (obj.ch1 && !obj.$group)
        return "row-marked";
    return "";
}

function cellColor(container, cellInfo, t,y){
    if (cellInfo.ch1 && ! cellInfo.$group) return "row-marked";
    var currentEnumStyle = classStyle[y];
    for(var element in currentEnumStyle){
        if(container == currentEnumStyle[element].cellText){
            return currentEnumStyle[element].classStyle;
        }
    }

}

function renderButton(cellElement, cellInfo){
    var result = "";
    for(var number in buttonsMetadata){
        var button = buttonsMetadata[number];
        var conditions = button.condition;
        for(var element in conditions){
            var condition = conditions[element];
            if(cellElement[condition.column] == condition.value){
                result = result + "<img class='" + button.class + "' src='" + button.icon + "'/>"
                break;
            }
        }
    }
    return result;
}

var dataIndex = {
    AssetType: 'AssetType',
    AssetStandard: 'AssetStandard',
    AssetStatus: 'AssetStatus',
    TitleDescription: 'TitleDescription',
    GeoRegionID: 'GeoRegionID',
    CountryCode: 'CountryCode',
    StateCode: 'StateCode',
    CityCode: 'CityCode',
    SiteCode: 'SiteCode',
    BuildingCode: 'BuildingCode',
    FloorCode: 'FloorCode',
    RoomCode: 'RoomCode',
    BusinessUnit: 'BusinessUnit',
    DivisionCode: 'DivisionCode',
    DepartmentCode: 'DepartmentCode',
    Data: 'Data'
};

var columnTitle = {
    AssetType: 'Asset Type',
    AssetStandard: 'Asset Standard',
    AssetStatus: 'Asset Status',
    TitleDescription: 'Title Description',
    GeoRegionID: 'Geo-Region ID',
    CountryCode: 'Country Code',
    StateCode: 'State Code',
    CityCode: 'City Code',
    SiteCode: 'Site Code',
    BuildingCode: 'Building Code',
    FloorCode: 'Floor Code',
    RoomCode: 'Room Code',
    BusinessUnit: 'Business Unit',
    DivisionCode: 'Division Code',
    DepartmentCode: 'Department Code',
    Data: 'Data'
};


function e (){
    return [
        {
            id: "ch1",
            header: "",
            width: 40,
            template: "{common.checkbox()}"
        },
        {
            id: dataIndex.AssetType,
            header: [columnTitle.AssetType,{content:"serverFilter"}],
            sort:"server",
            width: 200,
            template:function(obj, common,a, b, currentNumber){
                if (obj.$group) {
                    dtable.addSpan(obj.id, "AssetType", 17, 1, null, "hrow");
                    var result = common.treetable(obj, common) + "AssetType: " + obj.value + " ( " + obj.$count + " assets )";
                    var freeItems = 100 - currentNumber;
                    if(obj.open)
                        if(freeItems < obj.$count )
                            result += " (Continues on the next page)";
                    return result;
                }
                return obj.AssetType;
            },
            cssFormat:status
        }];
}


var columnsMetadata =  [
    {
        id: "ch1",
        header: "",
        width: 40,
        template: "{common.checkbox()}"
    },
    {
        id: dataIndex.AssetType,
        header: [columnTitle.AssetType,{content:"serverFilter"}],
        sort:"server",
        width: 200,
        template:function(obj, common,a, b, currentNumber){
            if (obj.$group) {
               // dtable.addSpan(obj.id, "AssetType", 17, 1, null, "hrow");
                var result = common.treetable(obj, common) + "AssetType: " + obj.value + " ( " + obj.$count + " assets )";
                var freeItems = 100 - currentNumber;
                if(obj.open)
                    if(freeItems < obj.$count )
                        result += " (Continues on the next page)";
                return result;
            }
            return obj.AssetType;
        },
        cssFormat:status
    },
    {
        header: [columnTitle.AssetStandard,{content:"serverFilter"}],
        id: dataIndex.AssetStandard,
        sort:"server",
        width: 125,
        cssFormat:status
    },
    {
        header: [columnTitle.AssetStatus,{content:"serverSelectFilter"}],
        id: dataIndex.AssetStatus,
        sort:"server",
        width: 125,
        cssFormat:status
    },
    {
        header: [columnTitle.TitleDescription,{content:"serverFilter"}],
        id: dataIndex.TitleDescription,
        sort:"server",
        width: 300,
        cssFormat:status
    },
    {
        header: [columnTitle.GeoRegionID,{content:"serverSelectFilter"}],
        id: dataIndex.GeoRegionID,
        sort:"server",
        width: 125,
        cssFormat:status
    },
    {
        header: [columnTitle.CountryCode,{content:"serverFilter"}],
        id: dataIndex.CountryCode,
        cssFormat:cellColor,
        sort:"server",
        width: 125
    },
    {
        header: [columnTitle.StateCode,{content:"serverFilter"}],
        id: dataIndex.StateCode,
        sort:"server",
        width: 125,
        cssFormat:status
    },
    {
        header: [columnTitle.CityCode,{content:"serverFilter"}],
        id: dataIndex.CityCode,
        sort:"server",
        width: 125,
        cssFormat:status
    },
    {
        header: [columnTitle.SiteCode,{content:"serverFilter"}],
        id: dataIndex.SiteCode,
        sort:"server",
        width: 125,
        cssFormat:status
    },
    {
        header: [columnTitle.BuildingCode,{content:"serverFilter"}],
        id: dataIndex.BuildingCode,
        sort:"server",
        width: 125,
        cssFormat:status
    },
    {
        header: [columnTitle.FloorCode,{content:"serverFilter"}],
        id: dataIndex.FloorCode,
        sort:"server",
        width: 125,
        cssFormat:status
    },
    {
        header: [columnTitle.RoomCode,{content:"serverFilter"}],
        id: dataIndex.RoomCode,
        sort:"server",
        width: 125,
        cssFormat:status
    },
    {
        header: [columnTitle.BusinessUnit,{content:"serverFilter"}],
        id: dataIndex.BusinessUnit,
        sort:"server",
        width: 125,
        cssFormat:status
    },
    {
        header: [columnTitle.DivisionCode,{content:"serverFilter"}],
        id: dataIndex.DivisionCode,
        sort:"server",
        width: 125,
        cssFormat:status
    },
    {
        header: [columnTitle.DepartmentCode,{content:"serverFilter"}],
        id: dataIndex.DepartmentCode,
        sort:"server",
        width: 125,
        cssFormat:status
    },
    {
        header: [columnTitle.Data,{content:"datepickerFilter"}],
        id: dataIndex.Data,
        sort:"server",
        width: 125,
        cssFormat:status
    },
    {
        template:renderButton,
        width: 200,
        cssFormat:status
    }
];







module.exports = columnsMetadata;
