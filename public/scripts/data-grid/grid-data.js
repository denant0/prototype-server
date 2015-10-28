(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var columnsMetadata = require('./metadata/columns-metada');
var buttonsMetadata = require('./metadata/buttons-metadata');

webix.ready(function(){

    dtable = new webix.ui({
        container:"grid",
        view:"treetable",
        columns: columnsMetadata,
        pager:{
            template:"{common.first()}{common.prev()}{common.pages()}{common.next()}{common.last()}",
            container: 'paging',
            size: 100,
            group: 5,
            animate:{
                subtype:"in"
            }
        },
        select: "cell",
        multiselect: true,
        resizeColumn:true,
        spans: true,
        checkboxRefresh:true,
        on:{
            onSelectChange:function() {
                var id = dtable.getSelectedId(true);
                if (id.length != 0) {
                    var text = dtable.getItem(id)[id[0].column];
                    webix.message(text);
                    document.getElementById('select').innerHTML = text;
                }
            },
            onCheck:function(row, column, value){
                this.data.eachChild(row, function(item){
                    item[column] = value;
                })
            },
            onAfterLoad:function(row, column, value){
                this.openAll();
            },
            onBeforeRender: function(){
                for(var key in buttonsMetadata){
                    var button = buttonsMetadata[key];
                        this.on_click[button.class]= button.function;
                }
            },
            onDataRequest: function (id, callback, url) {
                var y =id;
            }
        },
        scheme:{
            $group: 'AssetType',
            $sort: 'AssetType'
        },
        url: "server/data"

    });

    webix.event(window, "resize", function(){dtable.adjust()});

});









},{"./metadata/buttons-metadata":2,"./metadata/columns-metada":4}],2:[function(require,module,exports){
var buttonsMetadata = [
    {
        icon: 'style/icons/cog_edit.png',
        class: 'editclass',
        function: function(){
            webix.message('You click button 1');
        },
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            }
        ]
    },{
        icon: 'style/icons/delete.gif',
        class: 'deleteclass',
        function: function(){
            webix.message('You click button 2');
        },
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            }
        ]
    },{
        icon: 'style/icons/add.gif',
        class: 'addclass',
        function: function(){
            webix.message('You click button 3');
        },
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            },
            {
                column: 'AssetType',
                value: 'eq'
            }
        ]
    },{
        icon: 'style/icons/information.png',
        class: 'infoclass',
        function: function(){
            webix.message('You click button 4');
        },
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            }
        ]
    }
];




module.exports = buttonsMetadata;



},{}],3:[function(require,module,exports){
var classStyle = {
    CountryCode:[
        {
            cellText: 'USA',
            classStyle: 'usa'
        },
        {
            cellText: 'ARG',
            classStyle: 'arg'
        },
        {
            cellText: 'MEX',
            classStyle: 'mex'
        },
        {
            cellText: 'BRA',
            classStyle: 'bra'
        },
        {
            cellText: 'CAN',
            classStyle: 'can'
        }
    ]
};

module.exports = classStyle;


},{}],4:[function(require,module,exports){
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
    for(element in currentEnumStyle){
        if(container == currentEnumStyle[element].cellText){
            return currentEnumStyle[element].classStyle;
        }
    }

}

function renderButton(cellElement, cellInfo){
    var result = "";
    for(number in buttonsMetadata){
        var button = buttonsMetadata[number];
        var conditions = button.condition;
        for(element in conditions){
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

var columnsMetadata = [
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


},{"./buttons-metadata":2,"./cell-style-metadata":3}]},{},[1])