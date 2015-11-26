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
       // height: 700,
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

        if(this._multisortMap.length == 0 && !this._multisort_isDelete){
            this._multisortMap[0] = {
                id: column,
                dir: order,
                html: '',
                onClick: 0,
                numberInQuery: 1
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
                    var element = this._multisortMap[number];
                    if(element.id != column){
                        this.createMarkSorting(number, element.id, element.dir, false);
                    }
                    else{
                        isAdded = false;
                        this._multisortMap[number].dir = order;
                        this._multisortMap[number].onClick++;
                        this._multisortMap[number].numberInQuery = 1;
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
    },
    mapGroupsCells:function(startrow, startcol, numrows, numcols, callback) {
        if (startrow === null && this.data.order.length > 0) startrow = this.data.order[0];
        if (startcol === null) startcol = this.columnId(0);
        if (numrows === null) numrows = this.data.order.length;
        if (numcols === null) numcols = this._settings.columns.length;

        if (!this.exists(startrow)) return;
        startrow = this.getIndexById(startrow);
        startcol = this.getColumnIndex(startcol);
        if (startcol === null) return;

        for (var i = 0; i < numrows && (startrow + i) < this.data.order.length; i++) {
            var row_ind = startrow + i;
            var row_id = this.data.order[row_ind];
            var item = this.getItem(row_id);
            var col_id = this.columnId(numcols);
            for (var j = 0; j < numcols && (startcol + j) < this._settings.columns.length; j++) {
                var col_ind = startcol + j;
                var col_id = this.columnId(col_ind);
                var flag = true;
                for(var num_mas in webix.groupTotalLine){
                    if(col_id == webix.groupTotalLine[num_mas].id){
                        callback(item[webix.groupTotalLine[num_mas].id+"Sum"]);
                        flag = false;
                    }
                }
                if(flag){
                    item[col_id] = callback(item[col_id], row_id, col_id, i, j);
                }

            }
        }
    }
},webix.ui.treetable,webix.PagingAbility);

webix.editors.$popup = {
    text:{
        view:"popup",
        body:{view:"textarea", width:250, height:50}
    }
};


class DataGrid{

    constructor(config) {
        this.id = config.id;
        this.dataTypeToFilterTypeMapping = {
            text: 'serverFilter',
            date: 'serverFilter',
            time: 'serverFilter',
            number: 'serverFilter',
            integer: 'serverFilter',
            enum: 'serverSelectFilter'
        };
        webix.pageSize = config.pageSize;
        var webixColumns = this.createWebixColumns(config.columns);
        var webixActionsGrid = this.configurationActionsGrid(config.events);
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
        var webixColumns = this.createWebixColumns(config.columns);
        var webixActionsGrid = this.configurationActionsGrid(config.events);

        var nameGrid = config.container + 'Grid';
        var namePaging = config.container + 'Paging';

        var configGrid = {
            container: nameGrid,
            view: "customDataTable",
           //view: "datatable",
            columns: webixColumns.columns,
            leftSplit: 1,
            //datafetch: 120,
            //loadahead: 100,
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
            editable:true,
            editaction: "custom",
            url: config.dataSource,

            footer:true
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
            //configGroup.$group.row =  webixColumns.group.id;
            configGrid.scheme = configGroup;
        }

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

    configurationActionsGrid(events){
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
            },
            onItemClick: function(id, event){
                if(typeof webix.ARCHIBUS.editRows != 'undefined'){
                    if(id.row == webix.ARCHIBUS.editRows){
                        this.editCell(id.row, id.column);
                    }
                }
            }
        };
        for(var event in events){
            webixActionsGrid[event] = webix.actions[events[event]];
        }
        return webixActionsGrid;
    }

    renderGroup(obj, common, value, b, currentNumber){
        if (obj.$group) {
            var count = obj.$count;
            var result = common.treetable(obj, common) + " " + this.id +": " + obj.value + " ( " + count + " assets )";
            var freeItems = webix.pageSize - currentNumber;
            if(obj.open)
                if(freeItems < obj.$count )
                    result += " (Continues on the next page)";
            if(typeof webix.groupTotalLine !='undefined' ){
                result += '<span style="float: right;">';
                for(var i in webix.groupTotalLine) {
                    if (webix.groupTotalLine[i].type == 'number'){
                        result += webix.groupTotalLine[i].title + ": " + webix.i18n.numberFormat(obj[webix.groupTotalLine[i].id+"Sum"]) + " ";
                    }
                    else
                        result += webix.groupTotalLine[i].title + ": " + obj[webix.groupTotalLine[i].id+"Sum"] + "      ";
                }
                result += "</span>";
            }

            return result;
        }

        return value;
    }

    renderButton(cellElement, cellInfo){
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

    createWebixColumns(ARCHIBUSColumns){
        var webixColumns = [];
        var webixGroupBy = {};

        webixColumns[0] = {
            id: "ch1",
            header: "",
            width: 40,
            template: "{common.checkbox()}",
            footer:{text:"Total:"}
        };
        var index = 1;
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
                        break;
                    case 'integer':
                        webixColumn.editor = 'text';
                        break;
                    case 'date':
                        //webixColumn.format = webix.Date.dateToStr("%m/%d/%y");
                        webixColumn.editor = 'date';
                        break;
                    case 'text':
                        webixColumn.editor = 'popup';

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
            webixColumn.template = function(cellElement, cellInfo, cellValue){
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

            if(this.existsField(ARCHIBUSColumn.width)){
                webixColumn.width = ARCHIBUSColumn.width;
            }
            else{
                webixColumn.adjust = "data";
            }
            if(this.existsField(ARCHIBUSColumn.action)){
                webix.buttonsMap = ARCHIBUSColumn.action;
                webixColumn.template = this.renderButton;
            }
            else{
                webixColumn.sort = "server";
            }
            if(this.existsField(ARCHIBUSColumn.groupBy)){
                webixColumn.template = this.renderGroup;
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

}

webix.ui.datafilter.sumTotalGroup = {
    getValue:function(node){ return node.firstChild.innerHTML; },
    setValue: function(){},
    refresh:function(master, node, value){
        var result = 0;
        master.mapGroupsCells(null, value.columnId, null, 1, function(value){
            value = value*1;
            if (!isNaN(value))
                result+=value;
            return value;
        });

        if (value.format)
            result = value.format(result);
        if (value.template)
            result = value.template({value:result});

        node.firstChild.innerHTML = result;
    },
    trackCells:true,
    render:function(master, config) {
        if (config.template)
            config.template = webix.template(config.template);
        return "";
    }
};