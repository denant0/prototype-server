

webix.ready(function(){
    var d = new DataGrid(ARCHIBUSConfig);
    webix.event(window, "resize", function(){d.dtable.adjust()});
});

class DataGrid{

    constructor(config) {
        this.id = config.id;
        var webixColumns = createWebixColumns(config.columns);
        webix.buttonsMetadata = webixColumns.action;

            this.dtable = new webix.ui({
                container: config.container,
                view: "treetable",
                columns: webixColumns.columns,
                pager: {
                    template: "{common.first()}{common.prev()}{common.pages()}{common.next()}{common.last()}",
                    container: 'paging',
                    size: 100,
                    group: 5,
                    animate: {
                        subtype: "in"
                    }
                },
                select: "cell",
                multiselect: true,
                resizeColumn: true,
                spans: true,
                checkboxRefresh: true,
                on: {
                    onSelectChange: function (a,b,c) {
                        var id = this.getSelectedId(true);
                        if (id.length != 0) {
                            var text = this.getItem(id)[id[0].column];
                            webix.message(text);
                            document.getElementById('select').innerHTML = text;
                        }
                    },
                    onCheck: function (row, column, value) {
                        this.data.eachChild(row, function (item) {
                            item[column] = value;
                        })
                    },
                    onAfterLoad: function (row, column, value) {
                        this.openAll();
                    },
                    onBeforeRender: function () {
                        for (var key in webix.buttonsMetadata) {
                            var button = webix.buttonsMetadata[key];
                            this.on_click[button.class] = button.function;
                        }
                    }
                },
                scheme: {
                    $group: webixColumns.idGroup,
                    $sort:  webixColumns.idGroup
                },
                url: config.dataSource

            });
    }
}

function renderGroup(obj, common,a, b, currentNumber){
    if (obj.$group) {
        var d=webix;
        //this.addSpan(obj.id, this.id, 17, 1, null, "hrow");
        var result = common.treetable(obj, common) + " " + this.id +": " + obj.value + " ( " + obj.$count + " assets )";
        var freeItems = 100 - currentNumber;
        if(obj.open)
            if(freeItems < obj.$count )
                result += " (Continues on the next page)";
        return result;
    }
    return obj[this.id];
}

function renderButton(cellElement, cellInfo){
    var result = "";
    for(var number in webix.buttonsMetadata){
        var button = webix.buttonsMetadata[number];
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

function createWebixColumns(ARCHIBUSColumns){
    var webixColumns = new Array();
    var buttonAction;
    var idGroupBy;
    webixColumns[0] = {
        id: "ch1",
        header: "",
        width: 40,
        template: "{common.checkbox()}"
    };
    var index = 1;
    for(var numberColumn in ARCHIBUSColumns){
        var ARCHIBUSColumn = ARCHIBUSColumns[numberColumn];
        var webixColumn = {};
        var filter;

        webixColumn.id = ARCHIBUSColumn.id;
        for(var type in ARCHIBUSDataType){
            if(type === ARCHIBUSColumn.dataType){
                filter = ARCHIBUSDataType[type];
            }
        }
        webixColumn.header = [
            ARCHIBUSColumn.title,
            {content:filter}
        ];
        webixColumn.sort = "server";
        if(typeof ARCHIBUSColumn.width != 'undefined'){
            webixColumn.width = ARCHIBUSColumn.width;
        }
        else{
            webixColumn.adjust = "data";
        }

        if(typeof ARCHIBUSColumn.action != 'undefined'){
            buttonAction = ARCHIBUSColumn.action;
            webixColumn.template = renderButton;
        }
        if(typeof ARCHIBUSColumn.groupBy != 'undefined'){
            idGroupBy = ARCHIBUSColumn.id;
            webixColumn.template = renderGroup;
        }
        webixColumns[index] = webixColumn;
        index++;
    }
    return {
        columns: webixColumns,
        action: buttonAction,
        idGroup: idGroupBy
    };
}

var ARCHIBUSColumns = [
    {
        id: 'AssetType',
        title: 'Asset Type',
        groupBy: true,
        sortBy: 'asc', // or 'desc'
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'AssetStandard',
        title: 'Asset Standard',
        width: 200,
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'AssetStatus',
        title: 'Asset Status',
        width: 200,
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'TitleDescription',
        title: 'Title Description',
        width: 200,
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'GeoRegionID',
        title: 'Geo-RegionID',
        width: 200,
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'CountryCode',
        title: 'Country Code',
        width: 200,
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'StateCode',
        title: 'State Code',
        width: 200,
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'CityCode',
        title: 'City Code',
        width: 200,
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'SiteCode',
        title: 'Site Code',
        width: 200,
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'BuildingCode',
        title: 'Building Code',
        width: 200,
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'FloorCode',
        title: 'Floor Code',
        width: 200,
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'RoomCode',
        title: 'Room Code',
        width: 200,
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'BusinessUnit',
        title: 'Business Unit',
        width: 200,
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'DivisionCode',
        title: 'Division Code',
        width: 200,
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'DepartmentCode',
        title: 'Department Code',
        width: 200,
        cssClass: '',
        dataType: 'text'
    },
    {
        id: 'Data',
        title: 'Data',
        width: 200,
        cssClass: '',
        dataType: 'data'
    },
    {
        title: 'Action',
        width: 200,
        action: [
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
        ]


    }
];
var ARCHIBUSConfig = {
    id: 'projectsGrid',
    container: 'projectsGridContainer',
    columns: ARCHIBUSColumns,
    sortFields: [],
    dataSource: 'server/data',
    events: [],
    width: 800,
    height: 400
};



var ARCHIBUSDataType = {
    text: 'serverFilter',
    data: 'serverFilter',
    time: 'serverFilter',
    number: 'serverFilter',
    integer: 'serverFilter'
};







