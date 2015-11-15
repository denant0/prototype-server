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
        webix.event(window, "resize", function (event) {
            objects[number].view.adjust();
            objects[number].dataTable.adjust();
        });
    }
}


webix.protoUI({
    name: 'customDataTable',
    $init:function(config){
        this.___multisort = config.multisort;
        this._multisort_isDelete = false;
        this._multisort_count = 0;
        if(this.___multisort){
            this._multisortMap = [];
        }
    },
    _on_header_click:function(column){
        var col = this.getColumnConfig(column);
        if (!col.sort) return;

        var order = 'asc';
        if(typeof this.___multisort == 'undefined'  || !this.___multisort){
            if (col.id == this._last_sorted)
                order = this._last_order == "asc" ? "desc" : "asc";
        }
        else{
            for(var number in this._multisortMap){
                if(this._multisortMap[number].id == column){
                    order = this._multisortMap[number].dir == "asc" ? "desc" : "asc";
                    break;
                }
            }
        }


        this._sort(col.id, order, col.sort);
    },
    markSorting:function(column, order){
        if(typeof this.___multisort != 'undefined'  && this.___multisort){
            this.markMultiSorting(column,order);
        }
        else{
            this.markSingSorting(column,order);
        }
    },
    markSingSorting: function(column, order){
        if (!this._sort_sign)
            this._sort_sign = webix.html.create("DIV");
        webix.html.remove(this._sort_sign);

        if (order){
            var cell = this._get_header_cell(this.getColumnIndex(column));
            if (cell){
                this._sort_sign.className = "webix_ss_sort_"+order;
                cell.style.position = "relative";
                cell.appendChild(this._sort_sign);
            }
            this._last_sorted = column;
            this._last_order = order;
        } else {
            this._last_sorted = this._last_order = null;
        }
    },
    markMultiSorting: function(column, order){

        if(this.markMultiSorting_isAddedItem()){
            this._multisortMap[0] = {
                id: column,
                dir: order,
                html: '',
                onClick: 0
            };
            this.createMarkSorting(0, column, order, true);
        }
        else{
            if(this._multisort_isDelete){
                if(this._multisort_count == 1){
                    this._multisort_count = 0;
                    this._multisort_isDelete = false;
                    this._last_order = '';
                    for(var number in this._multisortMap)
                        this.createMarkSorting(number, this._multisortMap[number].id, this._multisortMap[number].dir, false);
                }
                else{
                    this._multisort_count++;
                }
            }
            else{
                var isAdded = true;
                for(var number in this._multisortMap){
                    if(this._multisortMap[number].id != column){
                        this.createMarkSorting(number, this._multisortMap[number].id, this._multisortMap[number].dir, false);
                    }
                    else{
                        isAdded = false;
                        this._multisortMap[number].dir = order;
                        this._multisortMap[number].onClick++;
                        this.createMarkSorting(number, column, order, true);
                    }
                }
                if(isAdded){
                    this._multisortMap[this._multisortMap.length] = {
                        id: column,
                        dir: order,
                        html: '',
                        onClick: 0
                    };
                    this.createMarkSorting(this._multisortMap.length - 1, column, order, true);
                }
                else{
                    var numberDelete = -1;
                    for(var number in this._multisortMap){
                        if(this._multisortMap[number].onClick == 6){
                            numberDelete = number;
                            break;
                        }
                    }

                    if(numberDelete != -1){
                        //webix.html.remove(this._multisortMap[numberDelete].html);
                        this._multisortMap.splice(numberDelete,1);
                        this._multisort_isDelete = true;
                    }
                }
            }
        }

    },
    markMultiSorting_isAddedItem: function(){
        if(this._multisortMap.length == 0 && !this._multisort_isDelete )
            return true;

        return false;
    },

    createHtmlMarkSotring: function(order){
        var htmlElement = webix.html.create("DIV");
        if (order){
            htmlElement.className = "webix_ss_sort_"+order;
        }
        return htmlElement;
    },
    createMarkSorting: function(index, column, order, isAddLast){

        webix.html.remove(this._multisortMap[index].html);
            this._multisortMap[index].html = this.createHtmlMarkSotring(order);



        if (order){
            var cell = this._get_header_cell(this.getColumnIndex(column));
            if (cell){
                cell.style.position = "relative";
                cell.appendChild(this._multisortMap[index].html);
            }
            if(isAddLast) {
                this._last_sorted = column;
                this._last_order = order;
            }
        }
        else {
            if(isAddLast) {
                this._last_sorted = this._last_order = null;
            }
        }
    },
    _sort:function(col_id, direction, type){
        direction = direction || "asc";
        this.markSorting(col_id, direction);


        if (type == "server"){
            this.loadNext(-1, 0, {
                "before":function(){
                    var url = this.data.url;
                    this.clearAll();
                    this.data.url = url;
                }
            }, 0, 1);
        } else {
            if (type == "text"){
                this.data.each(function(obj){ obj.$text = this.getText(obj.id, col_id); }, this);
                type="string"; col_id = "$text";
            }

            if (typeof type == "function")
                this.data.sort(type, direction);
            else
                this.data.sort(col_id, direction, type || "string");
        }
    }
},webix.ui.treetable);


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
            view: "customDataTable",
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
            multisort: true,
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