require('./custom-actions');

var DataGridLoad = require('./datagrid-load-data'),
    DataGridSort = require('./datagrid-sort'),
    DataGridEdit = require('./datagrid-edit'),
    DataGridGroups = require('./datagrid-groups');


class DataGrid {

    constructor (config) {
        webix.ARCHIBUS.data = {};
        webix.ARCHIBUS.data.collection = [];
        webix.ARCHIBUS.pageSize = config.pageSize;

        var nameGrid = config.container + 'Grid',
            namePaging = config.container + 'Paging';

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

        this.id = config.id;
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
        this.dataTable = new webix.ui(this._createGridConfiguration(config));
    }	
    /*
     To form a configuration for the component webix.ui.treetable
		@config: custom configuration
     */
    _createGridConfiguration (config) {
        var webixColumns = this._createColumns(config),
            webixActionsGrid = this._configureGridActions(config);

        var nameGrid = config.container + 'Grid',
            namePaging = config.container + 'Paging';

        var gridConfiguration = {
            container: nameGrid,
            view: "customDataTable",
            css:"my_style",
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

        gridConfiguration.scheme = this._dataGridGroups.configureGroup(webixColumns.group.id, webixColumns.group.header);
        gridConfiguration.leftSplit = this._getLeftSplit(webixColumns.columns, config.lastLeftFixedColumn, config.editing);
        gridConfiguration.rightSplit = this._getRigthSplit(webixColumns.columns, config.firstRightFixedColumn);

        if (config.editing) {
            gridConfiguration.editable = true;
            gridConfiguration.editaction = "custom";
        }
        return gridConfiguration;
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
     Customize the size the grid view depending on the set values in the config
		@container: the name container grid
		@width: the width container grid
		@height: the height container grid
     */
    _configurationGridSize (container, width, height) {
        if (width) {
            document.getElementById(container).style.width = width + "px";
        }
        else {
            document.getElementById(container).style.width = "100%";
        }
        if (height) {
            document.getElementById(container).style.height = height + "px";
        }
        else{
            document.getElementById(container).style.height = "90%";
        }
    }
    /*
     Customize the actions the grid view depending on the set function in the config
		@config: custom configuration
     */
    _configureGridActions (config) {
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

            },
            onAfterRender: function () {
                this.adjust();
            }
        };
        for (var event in events) {
            webixActionsGrid[event] = webix.actions[events[event]];
        }
        if (config.editing) {
            webixActionsGrid['onAfterEditStop'] = this._dataGridEdit.eventAfterEditStop;
            webixActionsGrid['onUpdataData'] = this._dataGridLoad.doUpdataData;
            webixActionsGrid['onRecalculateTotalColumn'] = this._dataGridGroups.recalculateTotalColumn;
        }

        return webixActionsGrid;
    }
    /*
     To create a configuration list of columns for grid
		@config: custom configuration
     */
    _createColumns (config) {
        var ARCHIBUSColumns = config.columns;
        var webixColumns = [];
        var webixGroupBy = {};


        webixColumns[0] = this._configureCheckboxColumn(ARCHIBUSColumns);
        if (config.editing) {
            webixColumns[1] = {
                id: 'edit',
                header: "",
                width: 60,
                template:  this._dataGridEdit.renderEditColumn
            };
        }
        var index = webixColumns.length;
        for (var numberColumn in ARCHIBUSColumns) {
            var ARCHIBUSColumn = ARCHIBUSColumns[numberColumn];
            var webixColumn = {};

            if (ARCHIBUSColumn.id) {
                webixColumn.id = ARCHIBUSColumn.id;
            }
            webixColumn.header = this._configureColumnHeader(ARCHIBUSColumn.title, ARCHIBUSColumn.dataType, ARCHIBUSColumn.action);
            webixColumn = this._configureColumnStyle(webixColumn, ARCHIBUSColumn.cssClass, ARCHIBUSColumn.dataType, ARCHIBUSColumn.dateTimeFormat);

            webixColumn.template = this._dataGridGroups.renderColumnsCell;
            webixColumn.tooltip = this._renderTooltip;
            if (config.editing) {
                webixColumn = this._dataGridEdit.addConfigurationEditColumn(webixColumn, webixColumns, ARCHIBUSColumn.dataType, this._dataGridLoad);
            }
            if (ARCHIBUSColumn.width) {
                webixColumn.width = ARCHIBUSColumn.width;
            } else {
                webixColumn.adjust = "data";
            }
            if (ARCHIBUSColumn.action) {
                webix.ARCHIBUS.buttonsMap = ARCHIBUSColumn.action;
                webixColumn.template = this._renderActionButtonsColumn;
            } else {
                webixColumn.sort = "server";
            }
            if (ARCHIBUSColumn.groupBy) {
                webixColumn.template = this._dataGridGroups.renderColumnGroup;
                webixGroupBy.id =  ARCHIBUSColumn.id;
            }
            if (ARCHIBUSColumn.showTotals) {
                var configurationTotalGroup = this._dataGridGroups.configureTotalGroup(webixGroupBy, ARCHIBUSColumn);
                webixColumn.footer = configurationTotalGroup.footer;
                webixGroupBy = configurationTotalGroup.header;
            }
            webixColumns[index] = webixColumn;
            index++;
        }
        return {
            columns: webixColumns,
            group: webixGroupBy
        };
    }
	/*
	Do perform configuration settings for display checkboxes column 
		@ARCHIBUSColumns: configuration columns
	*/
    _configureCheckboxColumn (ARCHIBUSColumns) {
        var configureCheckbox = {
            id: "ch1",
            header: "",
            width: 40,
            template: "{common.checkbox()}"
        };

        var isCalcTotalGroup = false;
        for (var index in ARCHIBUSColumns) {
            if (ARCHIBUSColumns[index].showTotals) {
                isCalcTotalGroup = true;
                break;
            }
        }
        if (isCalcTotalGroup){
            configureCheckbox['footer'] = {text:"Total:"};
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
            title,
            {content:filterView}
        ];
    }
    /*
     Customize the style column the grid view depending on the set values in the config
        @configColumn: the configuration of the current column
		@cssClass: the style column
		@dataType: the data type
		@dateFormat: the date format
     */
    _configureColumnStyle (configColumn, cssClass, dataType, dateFormat) {
        if (cssClass) {
            configColumn.cssFormat = webix.actions[cssClass];
        } else {
            configColumn.cssFormat =  function (value, obj) {
                if (obj.ch1 && !obj.$group)
                    return "row-marked";
                return "";
            };
        }
        switch (dataType) {
            case 'number':
                configColumn.format = webix.i18n.numberFormat;
                configColumn.css = {"text-align":"right" };
                break;
            case 'integer':
                configColumn.css = {"text-align":"right" };
                break;
            case 'date':
                configColumn.format = webix.Date.dateToStr(dateFormat);
                configColumn.map = "(date)#" + configColumn.id+"#";
                break;
        }
        return configColumn;
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
}

module.exports = DataGrid;