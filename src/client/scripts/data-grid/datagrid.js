require('./custom-actions');
require('./custom-filter-sort');
var columnsMetadata = require('./metadata/sample-columns-metadata');


webix.ready(function(){
    var dataGrid = new DataGrid({
        id: 'projectsGrid',
        container: 'projectsGridContainer',
        columns: columnsMetadata,
        sortFields: [],
        dataSource: 'server/data',
        //width: 700,
        //height: 700,
        pageSize: 100,
        events:{
            onSelectChange: 'selectValue'
        }
    });

    resize([dataGrid]);
});

function resize(objects){
    for(var number in objects){
        webix.event(window, "resize", function () {
            objects[number].view.adjust();
            objects[number].dataTable.adjust();
        });
    }
}



class DataGrid{

    constructor(config) {
        this.id = config.id;
        this.dataTypeToFilterTypeMapping = {
            text: 'serverFilter',
            data: 'serverFilter',
            time: 'serverFilter',
            number: 'serverFilter',
            integer: 'serverFilter'
        };
        webix.pageSize = config.pageSize;
        var webixColumns = this.createWebixColumns(config.columns);
        var webixActionsGrid = {
            onCheck: function (row, column, value) {
                this.data.eachChild(row, function (item) {
                        item[column] = value;
                    })
            },
            onAfterLoad: function (row, column, value) {
                this.openAll();
            },
            onBeforeRender: function () {
                for (var key in webix.buttonsMap) {
                    var button = webix.buttonsMap[key];
                    this.on_click[button.class] = webix.actions[button.function];
                }

            },
            onAfterRender: function (){
                this.adjust();
            }
        };

        if(typeof config.width != 'undefined'){
            document.getElementById(config.container).style.width = config.width + "px";
        }
        else{
            document.getElementById(config.container).style.width = "100%";
        }
        if(typeof config.height != 'undefined'){
            document.getElementById(config.container).style.height = config.height + "px";
        }
        else{
            document.getElementById(config.container).style.height = "90%";
        }

        for(var event in config.events){
            webixActionsGrid[event] = webix.actions[config.events[event]];
        }
        var nameGrid = config.container + 'Grid';
        var namePaging = config.container + 'Paging';

        this.view = new webix.ui({
            container: config.container,
            rows:[
                {
                    template:'<div id="' + nameGrid + '"style="height: 100%" "></div>'
                },
                {
                    template:'<div id="' + namePaging + '"></div>',
                    autoheight:true
                }
            ]
        });
        this.dataTable = new webix.ui({
            container: nameGrid,
            view: "treetable",
            columns: webixColumns.columns,
            pager: {
                template: "{common.first()}{common.prev()}{common.pages()}{common.next()}{common.last()}",
                container: namePaging,
                size: config.pageSize,
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
            on: webixActionsGrid,
            scheme: {
                $group: webixColumns.idGroup,
                $sort:  webixColumns.idGroup
            },
            url: config.dataSource

        });
    }

    renderGroup(obj, common,a, b, currentNumber){
        if (obj.$group) {
            var result = common.treetable(obj, common) + " " + this.id +": " + obj.value + " ( " + obj.$count + " assets )";
            var freeItems = webix.pageSize - currentNumber;
            if(obj.open)
                if(freeItems < obj.$count )
                    result += " (Continues on the next page)";
            return result;
        }
        return obj[this.id];
    }

    renderButton(cellElement, cellInfo){
        var result = "";
        for(var number in webix.buttonsMap){
            var button = webix.buttonsMap[number];
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

    createWebixColumns(ARCHIBUSColumns){
        var webixColumns = [];
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
            for(var type in this.dataTypeToFilterTypeMapping){
                if(type === ARCHIBUSColumn.dataType){
                    filter = this.dataTypeToFilterTypeMapping[type];
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
                webix.buttonsMap = ARCHIBUSColumn.action;
                webixColumn.template = this.renderButton;
            }
            if(typeof ARCHIBUSColumn.groupBy != 'undefined'){
                idGroupBy = ARCHIBUSColumn.id;
                webixColumn.template = this.renderGroup;
            }
            if(typeof ARCHIBUSColumn.cssClass != 'undefined'){
                webixColumn.cssFormat = webix.actions[ARCHIBUSColumn.cssClass];
            }
            else{
                webixColumn.cssFormat = function (value, obj, t, y){
                    if (obj.ch1 && !obj.$group)
                        return "row-marked";
                    return "";
                };
            }

            webixColumns[index] = webixColumn;
            index++;
        }
        return {
            columns: webixColumns,
            idGroup: idGroupBy
        };
    }
}