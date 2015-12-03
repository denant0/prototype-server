require('./custom-actions');

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
                body:{ view:"calendar", icons:true, weekNumber:true, timepicker:true }
            }
        };
        if(!webix.ui.datafilter.sumTotalGroup){
            webix.ui.datafilter.sumTotalGroup =
            {
                getValue:function(node){ return node.firstChild.innerHTML; },
                setValue: function(){},
                refresh:function(master, node, value){
                    var result = 0;
                    master.mapGroupsCells(null, value.columnId, null, 1, function(value){
                        value = value*1;
                        if (!isNaN(value))
                            result += value;

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

        }
        if(!webix.ui.customDataTable) {
            webix.protoUI({
                name: 'customDataTable',
                $init: function (config) {
                    this.___multisort = config.multisort;
                    this._multisort_isDelete = false;
                    this._multisort_count = 0;
                    if (this.___multisort) {
                        this._multisortMap = [];
                    }
                },
                _custom_tab_handler: this.tabHhandler,
                _on_header_click: this.headerClick,
                markSorting: this.markSorting,
                markSingSorting: this.markSingSorting,
                markMultiSorting: this.markMultiSorting,
                createHtmlMarkSotring: this.createHtmlMarkSotring,
                createMarkSorting: this.createMarkSorting,
                mapGroupsCells: this.calculationCellValue
            }, webix.ui.treetable);

            webix.TreeDataLoader._loadNextA = this.treeLoadData;
            webix.TreeDataLoader._feed_commonA = this.treeFeedCommon;
            webix.TreeDataLoader._feed_callback = this.treeFeedCallback;
            webix.TreeDataLoader._onLoad = this.treeOnLoad;

            webix.DataState = {
                getState: this.getStateDataGrid
            };
        }

        webix.ARCHIBUS.editRows = [];
        webix.ARCHIBUS.group = {};
        webix.ARCHIBUS.group.tooltip = {};
        webix.ARCHIBUS.data = {};
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
        webix.ARCHIBUS.data.collection = [];
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
            webixColumn.header = this.createColumnHeader(ARCHIBUSColumn.title, ARCHIBUSColumn.dataType, ARCHIBUSColumn.action);
            webixColumn.cssFormat = this.createColumnCssFormat(ARCHIBUSColumn.cssClass);
            webixColumn.template = this.templateColumnsCell;
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
                        webix.ARCHIBUS.data.collection[webix.ARCHIBUS.data.collection.length] = webixColumn.id;
                        webix.ajax().post("server/data/prop",  {id: webixColumn.id}, function(response) {
                            var obj = JSON.parse(response);
                            var collection = [];
                            collection[collection.length] = {id: "", value: ""};
                            var id;
                            for(var index in webix.ARCHIBUS.data.collection){
                                for(var indexObj in obj){
                                    var element = obj[indexObj];
                                    for(var item in element){
                                        if(webix.ARCHIBUS.data.collection[index] == item){
                                            id = item;
                                            break;
                                        }
                                    }
                                }
                            }

                            for(var index in obj){
                                collection[collection.length] = {id: obj[index][id], value: obj[index][id]};
                            }

                            for(var index in webixColumns){
                                if(webixColumns[index].id == id){
                                    var collectionHeader = collection.slice();
                                    var collectionEdit = collection.slice();
                                    collectionEdit.splice(0,1);
                                    webixColumns[index].collection = collectionEdit;
                                    webixColumns[index].header[1].options = collectionHeader;

                                }
                            }
                        });
                        break;
                }
            }else{
                ARCHIBUSColumn.dataType = 'String';
            }

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

    markSorting(column, order){
        if(typeof this.___multisort != 'undefined'  && this.___multisort){
            this.markMultiSorting(column,order);
        }
        else{
            this.markSingSorting(column,order);
        }
    }

    markSingSorting(column, order){
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
    }

    markMultiSorting(column, order){

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
                        if(this._multisortMap[number].onClick == 2){
                            numberDelete = number;
                            break;
                        }
                    }
                    if(numberDelete != -1){
                        webix.html.remove(this._multisortMap[numberDelete].html);
                        this._multisortMap.splice(numberDelete,1);
                        this._multisort_isDelete = false;
                    }
                }
            }
        }
    }

    createHtmlMarkSotring(order){
        var htmlElement = webix.html.create("DIV");
        if (order){
            htmlElement.className = "webix_ss_sort_"+order;
        }
        return htmlElement;
    }

    createMarkSorting(index, column, order, isAddLast){
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
    }

    tabHhandler(tab, e){
        if (this._settings.editable && !this._in_edit_mode){
            //if we have focus in some custom input inside of datatable
            if (e.target && e.target.tagName == "INPUT") return true;

            var selection = this.getSelectedId(true);
            if (selection.length == 1){
                return false;
            }
        }
        return true;
    }

    headerClick(column){
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
    }

    calculationCellValue(startrow, startcol, numrows, numcols, callback) {
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


    treeLoadData(count, start, callback, url, now){
        var config = this._settings;
        if (config.datathrottle && !now){
            if (this._throttle_request)
                window.clearTimeout(this._throttle_request);
            this._throttle_request = webix.delay(function(){
                this.loadNext(count, start, callback, url, true);
            },this, 0, config.datathrottle);
            return;
        }

        if (!start && start !== 0) start = this.count();
        if (!count)
            count = config.datafetch || this.count();

        this.data.url = this.data.url || url;
        if (this.callEvent("onDataRequest", [start,count,callback,url]) && this.data.url)
            this.data.feed.call(this, start, count, callback);
    };

    treeFeedCommon(from, count, callback){
        var url = this.data.url;
        if (from<0) from = 0;
        var final_callback = [
            this._feed_callback,
            callback
        ];
        if (url && typeof url != "string"){
            var details = { from:from, count:count };
            if (this.getState){
                var state = this.getState();
                details.sort = state.sort;
                details.filter = state.filter;
            }

            this.load(url, final_callback, details);
        } else {
            var finalurl = url+((url.indexOf("?")==-1)?"?":"&")+(this.count()?("continue=true"):"");
            if (count != -1)
                finalurl += "&count="+count;
            if (from)
                finalurl += "&start="+from;

            if (this.getState){
                var state = this.getState();
                if (state.sort){
                    if(typeof this.___multisort != 'undefined'  && this.___multisort){
                        for (var key in state.sort)
                            finalurl += "&sort["+state.sort[key].id+"]="+state.sort[key].dir;
                    }
                    else{
                        finalurl += "&sort["+state.sort.id+"]="+state.sort.dir;
                    }

                }

                if (state.filter)
                    for (var key in state.filter)
                        finalurl +="&filter["+key+"]="+state.filter[key];
            }
            this.load(finalurl, final_callback);
        }
    }

    treeFeedCallback(){
        //after loading check if we have some ignored requests
        var temp = this._load_count;
        var last = this._feed_last;
        this._load_count = false;
        if (typeof temp =="object" && (temp[0]!=last[0] || temp[1]!=last[1]))
            this.data.feed.apply(this, temp);	//load last ignored request
    }

    treeOnLoad(text,xml,loader){
        var data;
        if (loader === -1)
            data = this.data.driver.toObject(xml);
        else {
            //ignore data loading command if data was reloaded
            this._ajax_queue.remove(loader);
            data = this.data.driver.toObject(text,xml);
        }

        if (data)
            this.data._parse(data);
        else
            return this._onLoadError(text, xml, loader);

        //data loaded, view rendered, call onready handler
        this._call_onready();

        this.callEvent("onAfterLoad",[]);
        this.waitData.resolve();
    }


    getStateDataGrid(){
        var cols_n = this.config.columns.length;
        var columns = this.config.columns;
        var settings = {
            ids:[],
            size:[],
            select:this.getSelectedId(true),
            scroll:this.getScrollState(),
            sort: this._multisortMap
        };
        for(var i = 0; i < cols_n; i++){
            settings.ids.push(columns[i].id);
            settings.size.push(columns[i].width);
        }
        if(typeof this.___multisort == 'undefined'  || !this.___multisort){
            if(this._last_sorted) {
                settings.sort = {
                    id: this._last_sorted,
                    dir: this._last_order
                };
            }
        }
        if (this._filter_elements) {
            var filter = {};
            var any_filter = 0;
            for (var key in this._filter_elements) {
                if (this._hidden_column_hash[key]) continue;

                var f = this._filter_elements[key];
                f[1].value = filter[key] = f[2].getValue(f[0]);
                any_filter = 1;
            }
            if (any_filter)
                settings.filter=filter;
        }

        settings.hidden = [];
        for (var key in this._hidden_column_hash)
            settings.hidden.push(key);

        return settings;
    }
}