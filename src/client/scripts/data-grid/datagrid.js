require('./custom-actions');
require('./custom-filter-sort');
require('./custom-prototype-grid');
require('./custom-function-calc');

var columnsMetadata = require('./metadata/sample-columns-metadata');

webix.ready(function(){
    var dataGrid = new DataGrid({
        id: 'projectsGrid',
        container: 'projectsGridContainer',
        columns: columnsMetadata,
        sortFields: [],
        dataSource: 'server/data',
        //width: 700,
       // height: 700,
        pageSize: 100,
        events:{
            onSelectChange: 'selectValue'
        },
        editing: true,
        firstRightFixedColumn: 'Action',
        lastLeftFixedColumn: 'quantity_mtbf'
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


class DataGrid{

    constructor(config) {
        webix.UIManager.tabControl = true;
        webix.editors.$popup = {
            text:{
                view:"popup",
                body:{view:"textarea", width:250, height:50}
            },
            date:{
                view:"popup",
                body:{ view:"datepicker", icons:true, weekNumber:true, timepicker:true }
            }
        };
        webix.ARCHIBUS.editRows = [];
        webix.ARCHIBUS.group = {};
        webix.ARCHIBUS.group.tooltip = {};
        this.id = config.id;
        this.dataTypeToFilterTypeMapping = {
            text: 'serverFilter',
            date: 'serverFilter',
            time: 'serverFilter',
            number: 'serverFilter',
            integer: 'serverFilter',
            enum: 'serverSelectFilter'
        };
        webix.ARCHIBUS.pageSize = config.pageSize;
        this.configurationSizeGrid(config.container, config.width, config.height);

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

        var configGrid  = this.confiturationGrid(config);
        this.dataTable = new webix.ui(configGrid);
    }

    confiturationGrid(config){
        var webixColumns = this.createWebixColumns(config);
        var webixActionsGrid = this.configurationActionsGrid(config);

        var nameGrid = config.container + 'Grid';
        var namePaging = config.container + 'Paging';

        var leftSplit = 1;
        var rightSplit = 1;

        var configGrid = {
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
            checkboxRefresh: true,
            on: webixActionsGrid,
            url: config.dataSource,
            footer:true,
            navigation:true,
            tooltip:true
    };

        var configGroup = {
            $group: {}
        };

        if(this.existsField(webixColumns.group.id)){
            configGroup.$group.by = webixColumns.group.id;
            configGrid.scheme = configGroup;
        }
        if(this.existsField(webixColumns.group.footer)){
            configGroup.$group.map = {};
            webix.groupTotalLine = webixColumns.group.footer;
            for(var i in webix.groupTotalLine){
                configGroup.$group.map[webix.groupTotalLine[i].id + 'Sum'] = [webix.groupTotalLine[i].id, 'sum'];
            }
            configGrid.scheme = configGroup;
        }

        if(this.existsField(config.editing)){
            if(config.editing){
                configGrid.editable = true;
                configGrid.editaction = "custom";
                configGrid.editMath = true;
                leftSplit++;
            }
        }
        if(this.existsField(config.lastLeftFixedColumn)){
            leftSplit = 1;
            for(var index = 0; index <webixColumns.columns.length;index++){
                if(webixColumns.columns[index].id == config.lastLeftFixedColumn){
                    leftSplit = index + 1;
                    break;
                }
            }
        }
        if(this.existsField(config.firstRightFixedColumn)){
            for(var index = 0; index <webixColumns.columns.length;index++){
                if(webixColumns.columns[index].id == config.firstRightFixedColumn){
                    rightSplit = webixColumns.columns.length - index;
                    break;
                }
            }
            configGrid.rightSplit = rightSplit;
        }
        configGrid.leftSplit = leftSplit;
        return configGrid;
    }

    configurationSizeGrid(container, width, height){
        if(typeof width != 'undefined'){
            document.getElementById(container).style.width = width + "px";
        }
        else{
            document.getElementById(container).style.width = "100%";
        }
        if(typeof height != 'undefined'){
            document.getElementById(container).style.height = height + "px";
        }
        else{
            document.getElementById(container).style.height = "90%";
        }
    }

    configurationActionsGrid(config){
        var events = config.events;
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

                if(typeof webix.ARCHIBUS.editButtonMap != 'undefined'){
                    for (var key in webix.ARCHIBUS.editButtonMap) {
                        var button = webix.ARCHIBUS.editButtonMap[key];
                        this.on_click[button.class] = button.function;
                    }
                }

            },
            onAfterRender: function (){
                this.adjust();
            },
            onItemClick: function(id, event){
                if(typeof webix.ARCHIBUS.editRows != 'undefined'){
                    for(var index in  webix.ARCHIBUS.editRows){
                        var editRow = webix.ARCHIBUS.editRows[index];
                        if(editRow.id == id.row){
                            this.editCell(id.row, id.column);
                        }
                    }
                }
            },
            onAfterEditStop: function(state, editor, ignoreUpdate){
                if(state.value != state.old){
                    for(var index in  webix.ARCHIBUS.editRows){
                        var editRow = webix.ARCHIBUS.editRows[index];
                        if(editRow.id == editor.row){
                            var idAdd = true;
                            for(var obj in webix.ARCHIBUS.editRows[index].data){
                                if(obj == editor.column){
                                    idAdd = false;
                                    break;
                                }
                            }
                            if(idAdd)
                                webix.ARCHIBUS.editRows[index].data[editor.column] = state.old;
                            break;
                        }
                    }
                }

                for(var index in webix.groupTotalLine){
                    var id = webix.groupTotalLine[index].id;
                    if (editor.column == id){
                        var row = editor.row;
                        var childs = this.data.getBranch( this.getParentId(row) );
                        var sum = 0;
                        for (var i=0; i<childs.length; i++)
                        {
                            var item = childs[i];
                            sum += item[id]*1;
                        }
                        var idRowParent = this.getParentId(row);
                        var parent = this.getItem(idRowParent);

                        parent[id + 'Sum'] = sum;
                        this.refresh(idRowParent);
                        break;
                    }
                }
            },
            onTouchStart: function(obj){
                var t = 0;
            }
        };
        for(var event in events){
            webixActionsGrid[event] = webix.actions[events[event]];
        }
        return webixActionsGrid;
    }

    createWebixColumns(config){
        var ARCHIBUSColumns = config.columns;
        var webixColumns = [];
        var webixGroupBy = {};

        webixColumns[0] = {
            id: "ch1",
            header: "",
            width: 40,
            template: "{common.checkbox()}",
            footer:{text:"Total:"}
        };
        if(this.existsField(config.editing)) {
            if (config.editing) {
                webix.ARCHIBUS.editButtonMap = [
                    {
                        class: 'editStartClass',
                        function: function(event,object,cell,d){
                            var isFocus = true;
                            this.eachColumn(
                                function (columnId){
                                    this.addCellCss(object.row,columnId,"row-edited");
                                    var config = this.getColumnConfig(columnId);
                                    if(typeof config.editor != 'undefined' && isFocus){
                                        this.editCell(object.row, columnId);
                                        isFocus = false;
                                    }
                                }
                            );
                            webix.ARCHIBUS.editRows[webix.ARCHIBUS.editRows.length] = {
                                id: object.row,
                                data: {}
                            }
                        }
                    },
                    {
                        class: 'editSuccessClass',
                        function: function(event,object,cell,d){
                            this.editStop();
                            for(var index in  webix.ARCHIBUS.editRows){
                                var editRow = webix.ARCHIBUS.editRows[index];
                                if(editRow.id == object.row){
                                    this.eachColumn(
                                        function (columnId){
                                            this.removeCellCss(editRow.id,columnId,"row-edited");
                                        }
                                    );
                                    webix.ARCHIBUS.editRows.splice(index,1);
                                    webix.ajax().post("server/data/save",  this.getItem(object.row), function(response) {
                                        webix.message(response.status);
                                    });
                                    this.refresh();
                                    break;
                                }
                            }

                        }
                    },
                    {
                        class: 'editCancelClass',
                        function: function(event,object,cell,d){
                            this.editStop();
                            for(var index in  webix.ARCHIBUS.editRows){
                                var editRow = webix.ARCHIBUS.editRows[index];
                                if(editRow.id == object.row){
                                    this.eachColumn(
                                        function (columnId){
                                            this.removeCellCss(editRow.id,columnId,"row-edited");
                                        }
                                    );
                                    var dataRow = this.getItem(object.row);
                                    for(var index in editRow.data){
                                        dataRow[index] = editRow.data[index];
                                    }
                                    this.updateItem(object.row, dataRow);
                                    webix.ARCHIBUS.editRows.splice(index,1);
                                    break;
                                }
                            }

                            for(var index in webix.groupTotalLine){
                                var id = webix.groupTotalLine[index].id;
                                this.eachColumn(
                                    function (columnId){
                                        if (columnId == id){
                                            var row = object.row;
                                            var childs = this.data.getBranch( this.getParentId(row) );
                                            var sum = 0;
                                            for (var i=0; i<childs.length; i++)
                                            {
                                                var item = childs[i];
                                                sum += item[id]*1;
                                            }
                                            var idRowParent = this.getParentId(row);
                                            var parent = this.getItem(idRowParent);

                                            parent[id + 'Sum'] = sum;
                                            this.refresh(idRowParent);

                                        }
                                    }
                                );

                            }
                        }
                    }
                ];

                webixColumns[1] = {
                    id: 'edit',
                    header: "",
                    width: 60,
                    template: this.templateEditColumn
                };
            }
        }
        var index = webixColumns.length;
        for(var numberColumn in ARCHIBUSColumns){
            var ARCHIBUSColumn = ARCHIBUSColumns[numberColumn];
            var webixColumn = {};
            if(this.existsField(ARCHIBUSColumn.id)){
                webixColumn.id = ARCHIBUSColumn.id;
            }
            if(this.existsField(ARCHIBUSColumn.dataType)){
                switch (ARCHIBUSColumn.dataType){
                    case 'number': webixColumn.format = webix.i18n.numberFormat;
                        webixColumn.editor = 'text';
                        webixColumn.css = {"text-align":"right" };
                        break;
                    case 'integer':
                        webixColumn.editor = 'text';
                        webixColumn.css = {"text-align":"right" };

                        break;
                    case 'date':
                        webixColumn.format = webix.Date.dateToStr("%m/%d/%y");
                        webixColumn.editor = 'date';
                        webixColumn.map = "(date)#" + webixColumn.id+"#";
                        break;
                    case 'text':
                        webixColumn.editor = 'text';

                        break;
                    case 'enum':
                        webixColumn.editor = 'combo';
                        webixColumn.collection = [
                            {id: 'USA', value:"USA"},
                            {id: 'BRA', value:"BRA"},
                            {id: 'CAN', value:"CAN"},
                            {id: 'MEX', value:"MEX"},
                            {id: 'ARG', value:"ARG"}
                        ];
                }
            }else{
                ARCHIBUSColumn.dataType = 'String';
            }
            webixColumn.header = this.createColumnHeader(ARCHIBUSColumn.title, ARCHIBUSColumn.dataType, ARCHIBUSColumn.action);
            webixColumn.cssFormat = this.createColumnCssFormat(ARCHIBUSColumn.cssClass);
            webixColumn.template = this.templateColumnsCell;
            webixColumn.tooltip = function(rowItem, rowInfo, a, b, c){
                if(rowItem.$group){
                    for(var item in webix.ARCHIBUS.group.tooltip){
                        if(item == rowItem.id && webix.ARCHIBUS.group.tooltip[item]){
                            return 'Continues on the next page';
                        }
                    }
                }
                return "";
            }

            if(this.existsField(ARCHIBUSColumn.width)){
                webixColumn.width = ARCHIBUSColumn.width;
            }
            else{
                webixColumn.adjust = "data";
            }
            if(this.existsField(ARCHIBUSColumn.action)){
                webix.buttonsMap = ARCHIBUSColumn.action;
                webixColumn.template = this.templateActionButtonsColumn;
            }
            else{
                webixColumn.sort = "server";
            }
            if(this.existsField(ARCHIBUSColumn.groupBy)){
                webixColumn.template = this.templateGroupColumn;
                webixGroupBy.id =  ARCHIBUSColumn.id;

            }
            if(this.existsField(ARCHIBUSColumn.showTotals)){
                webixColumn.footer = { content:"sumTotalGroup" };
                if(!this.existsField(webixGroupBy.footer)){
                    webixGroupBy.footer = [];
                }
                var i = webixGroupBy.footer.length;
                webixGroupBy.footer[i] = {};
                webixGroupBy.footer[i].id = ARCHIBUSColumn.id;
                webixGroupBy.footer[i].title = ARCHIBUSColumn.title;
                webixGroupBy.footer[i].type = ARCHIBUSColumn.dataType;

            }
            webixColumns[index] = webixColumn;
            index++;
        }
        return {
            columns: webixColumns,
            group: webixGroupBy
        };
    }

    existsField(field){
        return typeof field != 'undefined'
    }

    createColumnHeader (title, dataType, action){
        if(this.existsField(action)){
            return title;
        }
        var filterView;
        for(var type in this.dataTypeToFilterTypeMapping){
            if(type === dataType){
                filterView = this.dataTypeToFilterTypeMapping[type];
            }
        }
        return [
            title,
            {content:filterView}
        ];
    }

    createColumnCssFormat(cssClass){
        if(this.existsField(cssClass)){
            return webix.actions[cssClass];
        }
        else{
            return function (value, obj, t, y){
                if (obj.ch1 && !obj.$group)
                    return "row-marked";
                return "";
            };
        }
    }

    templateGroupColumn(cellElement, cellInfo, cellValue, b, rowNumber){
        if (cellElement.$group) {
            var count = cellElement.$count;
            var result = cellInfo.treetable(cellElement, cellInfo) + " " + this.id +": " + cellElement.value + " ( " + count + " assets )";
            var freeItems = webix.ARCHIBUS.pageSize - rowNumber;
            if(cellElement.open)
                if(freeItems < cellElement.$count )
                    webix.ARCHIBUS.group.tooltip[cellElement.id] = true;
                else
                    webix.ARCHIBUS.group.tooltip[cellElement.id] = false;
            else
                webix.ARCHIBUS.group.tooltip[cellElement.id] = false;

            if(typeof webix.groupTotalLine !='undefined' ){
                result += '<span style="float: right;">';
                for(var i in webix.groupTotalLine) {
                    if (webix.groupTotalLine[i].type == 'number'){
                        result += webix.groupTotalLine[i].title + ": " + webix.i18n.numberFormat(cellElement[webix.groupTotalLine[i].id+"Sum"]) + " ";
                    }
                    else
                        result += webix.groupTotalLine[i].title + ": " + cellElement[webix.groupTotalLine[i].id+"Sum"] + "      ";
                }
                result += "</span>";
            }
            return result;
        }

        return cellValue;
    }

    templateActionButtonsColumn(cellElement, cellInfo){
        if(cellElement.$group){
            return ' ';
        }
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

    templateEditColumn(cellElement, cellInfo){
        if(cellElement.$group){
            return ' ';
        }
        var result = "";
        var isEdit = true;
        for(var index in webix.ARCHIBUS.editRows){
            if(webix.ARCHIBUS.editRows[index].id == cellElement.id){
                return "<img class='editSuccessClass' src='style/icons/success.png'/><img class='editCancelClass' src='style/icons/delete.gif'/>";
            }
        }
        return "<img class='editStartClass' src='style/icons/cog_edit.png'/>";
    }

    templateColumnsCell(cellElement, cellInfo, cellValue){
        if(cellElement.$group){
            var result = "<span>";
            for(var i in webix.groupTotalLine) {
                if(webix.groupTotalLine[i].id == this.id){
                    if (webix.groupTotalLine[i].type == 'number'){
                        result += "Total: " + webix.i18n.numberFormat(cellElement[webix.groupTotalLine[i].id+"Sum"]);
                    }

                    else
                        result += "Total: " + cellElement[webix.groupTotalLine[i].id+"Sum"];
                }

            }
            result += "</span>";
            return result;
        }
        return cellValue;
    }
}