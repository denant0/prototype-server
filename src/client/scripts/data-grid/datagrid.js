require('./custom-actions');

var DataGridLoad = require('./datagrid-load-data'),
    DataGridSort = require('./datagrid-sort'),
    DataGridEdit = require('./datagrid-edit'),
    DataGridGroups = require('./datagrid-groups');


class DataGrid {

    constructor (config) {
        var nameGrid = config.container + 'Grid',
            namePaging = config.container + 'Paging',
            nameFiltering = config.container + 'Filtering';

        webix.ARCHIBUS.data = {};
        webix.ARCHIBUS.data.collection = [];
        webix.ARCHIBUS.pageSize = config.pageSize;

        this._dataGridLoad = new DataGridLoad();
        this._dataGridSort = new DataGridSort();
        this._dataGridEdit = new DataGridEdit();
        this._dataGridGroups = new DataGridGroups();

        webix.protoUI ({
            name: 'customDataTable',
            $init: function (config) {
                this.___multisort = config.multisort;
                this._multisort_count = 0;
                if (this.___multisort) {
                    this._multisortMap = [];
                }
            },
            _custom_tab_handler: this._dataGridEdit.eventHandlerTab,
            _on_header_click: this._dataGridSort.eventHandlerHeaderClick,
            markSorting: this._dataGridSort.doStartSorting,
            doStartSingSorting: this._dataGridSort.doStartSingSorting,
            doStartMultiSorting: this._dataGridSort.doStartMultiSorting,
            doReLabelingSorting: this._dataGridSort.doReLabelingSorting,
            doRemoveColumn: this._dataGridSort.doRemoveColumn,
            addDivInColumnHeader: this._dataGridSort.addDivInColumnHeader,
            calculationColumnValue: this._dataGridGroups.calculationColumnValue
        }, webix.ui.treetable);
        if (!webix.env.touch && webix.ui.scrollSize)
            webix.CustomScroll.init();
        this.dataTypeToFilterTypeMapping = {
            text: 'serverFilter',
            date: 'serverFilter',
            time: 'serverFilter',
            number: 'serverFilter',
            integer: 'serverFilter',
            enum: 'serverSelectFilter'
        };
        this._configurationGridSize(config.container, config.width, config.height);

        this.view = new webix.ui({
            type: 'clean',
            css: config.style,
            container: config.container,
            rows:[
                {
                    type: 'header',
                    css: 'webix_header ' + config.style,
                    template: config.title
                },
                {
                    css: 'layoutFilter',
                    template: '<div id="' + nameFiltering + '"style="height: 100%" "></div>',
                    autoheight: true
                },
                {
                    template:'<div id="' + nameGrid + '"style="height: 100%" "></div>'
                },
                {
                    template:'<div id="' + namePaging + '"></div>',
                    autoheight:true
                }
            ]
        });
        this.dataTable = new webix.ui(this._createGridConfiguration(config));

        webix.ARCHIBUS.gridContainer = this.dataTable.getNode().attributes[2].nodeValue;
    }
    /*
     Customize the size the grid view depending on the set values in the config
     @container: the name container grid
     @width: the width container grid
     @height: the height container grid
     */
    _configurationGridSize (containerName, width, height) {
        if (width) {
            document.getElementById(containerName).style.width = width + "px";
        }
        else {
            document.getElementById(containerName).style.width = "100%";
        }
        if (height) {
            document.getElementById(containerName).style.height = height + "px";
        }
        else {
            document.getElementById(containerName).style.height = "90%";
        }
    }
    /*
     To form a configuration for the component webix.ui.treetable
		@config: custom configuration
     */
    _createGridConfiguration (config) {
        var gridColumns = this._createGridColumns(config),
            gridAction = this._configureGridActions(config);

        var gridName = config.container + 'Grid',
            pagingName = config.container + 'Paging';

        var gridConfiguration = {
            container: gridName,
            view: "customDataTable",
            css: config.style,
            columns: gridColumns.columns,
            pager: {
                template: "{common.first()}{common.prev()}{common.pages()}{common.next()}{common.last()}",
                container: pagingName,
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
            on: gridAction,
            url: config.dataSource,
            footer:true,
            navigation:true,
            tooltip:true
        };

        gridConfiguration.scheme = this._dataGridGroups.configureGroup(gridColumns.group.id, gridColumns.group.header);
        gridConfiguration.leftSplit = this._getLeftSplit(gridColumns.columns, config.lastLeftFixedColumn, config.editing);
        gridConfiguration.rightSplit = this._getRigthSplit(gridColumns.columns, config.firstRightFixedColumn);

        if (config.editing) {
            gridConfiguration.editable = true;
            gridConfiguration.editaction = "custom";
        }
        return gridConfiguration;
    }
    /*
     Customize the actions the grid view depending on the set function in the config
     @config: custom configuration
     */
    _configureGridActions (config) {
        var customGridEvents = config.events;
        var gridActions = {
            onCheck: this._eventCheckCheckbox,
            onAfterLoad: this._eventAfterLoad,
            onBeforeRender: this._eventBeforeRender,
            onAfterRender: this._eventAfterRender
        };
        for (var event in customGridEvents) {
            gridActions[event] = webix.actions[customGridEvents[event]];
        }
        if (config.editing) {
            gridActions['onAfterEditStop'] = this._dataGridEdit.eventAfterEditStop;
            gridActions['onUpdataData'] = this._dataGridLoad.doUpdataData;
            gridActions['onRecalculateTotalColumn'] = this._dataGridGroups.recalculateTotalColumn;
        }

        return gridActions;
    }
    /*
     To create a configuration list of columns for grid
     @config: custom configuration
     */
    _createGridColumns (config) {
        var ARCHIBUSColumns = config.columns;
        var gridColumns = [];
        var webixGroupBy = {};

        gridColumns[0] = this._configureCheckboxColumn(ARCHIBUSColumns);
        if (config.editing) {
            gridColumns[1] = {
                id: 'edit',
                header: "",
                width: 60,
                template:  this._dataGridEdit.renderEditColumn,
                cssFormat:  this.cssFormat
            };
        }
        var index = gridColumns.length;
        for (var i in ARCHIBUSColumns) {
            var ARCHIBUSColumn = ARCHIBUSColumns[i];
            var gridColumn = {};

            if (ARCHIBUSColumn.id) {
                gridColumn.id = ARCHIBUSColumn.id;
            }
            gridColumn.header = this._configureColumnHeader(ARCHIBUSColumn.title, ARCHIBUSColumn.dataType, ARCHIBUSColumn.action);
            gridColumn.template = this._dataGridGroups.renderColumnsCell;
            gridColumn.tooltip = this._renderTooltip;
            gridColumn = this._configureColumnStyle(gridColumn, ARCHIBUSColumn);
            gridColumn.renderGroupTotals =this._dataGridGroups.renderGroupTotals;
            
            if (config.editing) {
                gridColumn = this._dataGridEdit.configureColumnEdit(gridColumn, gridColumns, ARCHIBUSColumn.dataType, this._dataGridLoad);
            }
            if (ARCHIBUSColumn.width) {
                gridColumn.width = ARCHIBUSColumn.width;
            } else {
                gridColumn.adjust = "data";
            }
            if (ARCHIBUSColumn.action) {
                webix.ARCHIBUS.buttonsMap = ARCHIBUSColumn.action;
                gridColumn.template = this._renderActionButtonsColumn;
            } else {
                gridColumn.sort = "server";
            }
            if (ARCHIBUSColumn.groupBy) {
                gridColumn.template = this._dataGridGroups.renderColumnGroup;
                gridColumn.configureGroupHeaderStyle = this._dataGridGroups.configureGroupHeaderStyle;
                gridColumn.renderGroupTitle = this._dataGridGroups.renderGroupTitle;

                webixGroupBy.id =  ARCHIBUSColumn.id;
            }
            if (ARCHIBUSColumn.showTotals) {
                var configurationTotalGroup = this._dataGridGroups.configureTotalGroup(webixGroupBy, ARCHIBUSColumn);
                gridColumn.footer = configurationTotalGroup.footer;
                webixGroupBy = configurationTotalGroup.header;
            }
            else{
                gridColumn.footer = [{text:"", height: 20},{text:"", height: 20}];
            }
            gridColumns[index] = gridColumn;
            index++;
        }
        return {
            columns: gridColumns,
            group: webixGroupBy
        };
    }
    /*
     Do perform configuration settings for display checkboxes column
     @columns: configuration columns
     */
    _configureCheckboxColumn (columns) {
        var configureCheckbox = {
            id: "ch1",
            header: "",
            width: 40,
            template: "{common.checkbox()}",
            cssFormat:  this.cssFormat
        };

        var isCalcTotalGroup = false;
        for (var index in columns) {
            if (columns[index].showTotals) {
                isCalcTotalGroup = true;
                break;
            }
        }
        if (isCalcTotalGroup){
            configureCheckbox['footer'] = {text: '<div class="footerTitle"">TOTAL</div>'};
        }
        return configureCheckbox;
    }
    /*
     Customize the header column the grid view depending on the set values in the config
     @title: the name of the header
     @dataType: the type column
     @actions: the actions column
     */
    _configureColumnHeader (title, dataType, actions) {
        if (actions) {
            return title;
        }
        var filterView;
        for (var type in this.dataTypeToFilterTypeMapping) {
            if (type === dataType) {
                filterView = this.dataTypeToFilterTypeMapping[type];
            }
        }
        return [
            title
        ];
    }

    cssFormat (value, obj){
        if (obj.ch1 && obj.$group) {
            return 'rowGroupHeaderSelect';
        }
        if (obj.ch1 && !obj.$group) {
            return 'rowSelect';
        }
        if (!obj.ch1 && obj.$group) {
            return 'rowGroupHeader';
        }
        return "";
    }
    /*
     Customize the style column the grid view depending on the set values in the config
     @configColumn: the configuration of the current column
     @customConfigColumn: custom configuration
     */
    _configureColumnStyle (configGridColumn, customConfigColumn) {
        if (customConfigColumn.cssClass) {
            configGridColumn.cssFormat = webix.actions[customConfigColumn.cssClass];
        } else {
            configGridColumn.cssFormat =  this.cssFormat;
        }
        switch (customConfigColumn.dataType) {
            case 'number':
                configGridColumn.format = webix.i18n.numberFormat;
                configGridColumn.css = {"text-align":"right"};
                break;
            case 'integer':
                configGridColumn.css = {"text-align":"right" };
                break;
            case 'date':
                configGridColumn.format = webix.Date.dateToStr(customConfigColumn.dateTimeFormat);
                configGridColumn.map = "(date)#" + configGridColumn.id+"#";
                break;
        }
        return configGridColumn;
    }
	/*
	 Get the number of columns that want to split  the left side
		@columns: the configuration list columns
		@id: the ID of the last column that need to split 
		@isEdit: the flag edit
	*/
    _getLeftSplit (columns, id, isEdit) {
        var leftSplit = 1;
        if (isEdit) {
            leftSplit++;
        }
        if (id) {
            leftSplit = 1;
            for(var index = 0; index <columns.length;index++) {
                if(columns[index].id == id){
                    leftSplit = index + 1;
                    break;
                }
            }
        }
        return leftSplit;
    }
	/*
	 Get the number of columns that want to split  the rigth side
		@columns: the configuration list columns
		@id: the ID of the last column that need to split 
	*/
    _getRigthSplit (columns, id) {
        var rightSplit = 0;
        if (id) {
            rightSplit = 1;
            for(var index = 0; index <columns.length;index++) {
                if(columns[index].id == id){
                    rightSplit = columns.length - index;
                    break;
                }
            }
        }
        return rightSplit;
    }
    /*
     Do perform the formation of the action buttons in the column
     */
    _renderActionButtonsColumn (cellElement, cellInfo) {
        if (cellElement.$group) {
            return ' ';
        }
        var result = "";
        for (var number in webix.ARCHIBUS.buttonsMap) {
            var button = webix.ARCHIBUS.buttonsMap[number];
            var conditions = button.condition;
            for (var element in conditions) {
                var condition = conditions[element];
                if (cellElement[condition.column] == condition.value) {
                    result = result + "<img class='" + button.class + "' src='" + button.icon + "'/>"
                    break;
                }
            }
        }
        return result;
    }
    /*
     Do add tooltip to the header cell of the group
    */
    _renderTooltip (rowItem, rowInfo) {
        if (rowItem.$group) {
            for (var item in webix.ARCHIBUS.group.tooltip) {
                if (item == rowItem.id && webix.ARCHIBUS.group.tooltip[item]) {
                    return 'Continues on the next page';
                }
            }
        }
        return "";
    }
    /*
     Event of checkbox selection
     */
    _eventCheckCheckbox (row, column, value) {
        this.data.eachChild(row, function (item) {
            item[column] = value;
        })
    }
    /*
     Event occurs each time before the view is rendered
     */
    _eventBeforeRender () {
        if (webix.ARCHIBUS.buttonsMap) {
            for (var key in webix.ARCHIBUS.buttonsMap) {
                var button = webix.ARCHIBUS.buttonsMap[key];
                this.on_click[button.class] = webix.actions[button.function];
            }
        }
        if (webix.ARCHIBUS.editButtonMap) {
            for (var key in webix.ARCHIBUS.editButtonMap) {
                var button = webix.ARCHIBUS.editButtonMap[key];
                this.on_click[button.class] = button.function;
            }
        }
    }
    /*
     Event after data loading is complete
     */
    _eventAfterLoad (row, column, value) {
        this.openAll();
    }
    /*
     Event occurs each time after the view is rendered
     */
    _eventAfterRender () {
        this.adjust();
    }
}

module.exports = DataGrid;