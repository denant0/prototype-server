require('./custom-actions');

var DataGridPrototype = require('./classes/datagrid-prototype');

class DataGrid{

    constructor(config) {
        webix.ARCHIBUS.data = {};
        webix.ARCHIBUS.data.collection = [];
        webix.ARCHIBUS.pageSize = config.pageSize;

        var prototypeGrid = new DataGridPrototype(),
            nameGrid = config.container + 'Grid',
            namePaging = config.container + 'Paging';

        this.dataGridEdit = prototypeGrid.dataGridEdit;
        this.dataGridGroups = prototypeGrid.dataGridGroups;
        this.dataGridLoad = prototypeGrid.dataGridLoad;
        this.id = config.id;
        this.dataTypeToFilterTypeMapping = {
            text: 'serverFilter',
            date: 'serverFilter',
            time: 'serverFilter',
            number: 'serverFilter',
            integer: 'serverFilter',
            enum: 'serverSelectFilter'
        };
        this.configurationGridSize(config.container, config.width, config.height);

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
        this.dataTable = new webix.ui(this.createGridConfiguration(config));
    }	
    /*
     To form a configuration for the component webix.ui.treetable
		@config: custom configuration
     */
    createGridConfiguration(config){
        var webixColumns = this.createColumns(config),
            webixActionsGrid = this.configureGridActions(config);

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

        gridConfiguration.scheme = this.dataGridGroups.configureGroup(webixColumns.group.id, webixColumns.group.header);
        gridConfiguration.leftSplit = this.getLeftSplit(webixColumns.columns, config.lastLeftFixedColumn, config.editing);
        gridConfiguration.rightSplit = this.getRigthSplit(webixColumns.columns, config.firstRightFixedColumn);

        if(config.editing){
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
    getLeftSplit(columns, id, isEdit){

        var leftSplit = 1;
        if(isEdit)
            leftSplit++;

        if(id){
            leftSplit = 1;
            for(var index = 0; index <columns.length;index++){
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
    getRigthSplit(columns, id){
        var rightSplit = 0;
        if(id){
            rightSplit = 1;
            for(var index = 0; index <columns.length;index++){
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
    configurationGridSize(container, width, height){
        if(width){
            document.getElementById(container).style.width = width + "px";
        }
        else{
            document.getElementById(container).style.width = "100%";
        }
        if(height){
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
    configureGridActions(config){
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
                for (var key in webix.ARCHIBUS.buttonsMap) {
                    var button = webix.ARCHIBUS.buttonsMap[key];
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
            }
        };
        for(var event in events){
            webixActionsGrid[event] = webix.actions[events[event]];
        }
        if(config.editing){
            webixActionsGrid['onAfterEditStop'] = this.dataGridEdit.eventAfterEditStop;
        }

        return webixActionsGrid;
    }
    /*
     To create a configuration list of columns for grid
		@config: custom configuration
     */
    createColumns(config){
        var ARCHIBUSColumns = config.columns;
        var webixColumns = [];
        var webixGroupBy = {};


        webixColumns[0] = this.configureCheckboxColumn(ARCHIBUSColumns);
        if(config.editing)
            webixColumns[1] = {
                id: 'edit',
                header: "",
                width: 60,
                template:  this.dataGridEdit.renderEditColumn
            };


        var index = webixColumns.length;
        for(var numberColumn in ARCHIBUSColumns){
            var ARCHIBUSColumn = ARCHIBUSColumns[numberColumn];
            var webixColumn = {};

            if(ARCHIBUSColumn.id){
                webixColumn.id = ARCHIBUSColumn.id;
            }
            webixColumn.header = this.configureColumnHeader(ARCHIBUSColumn.title, ARCHIBUSColumn.dataType, ARCHIBUSColumn.action);
            webixColumn.cssFormat = this.configureColumnStyle(ARCHIBUSColumn.cssClass);
            webixColumn.template = this.dataGridGroups.renderColumnsCell;
            webixColumn.tooltip = this.renderTooltip;

            if(ARCHIBUSColumn.dataType){
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
                        this.dataGridLoad.doLoadCollectionFromServer(webixColumn.id, webixColumns);
                        break;
                }
            }else{
                ARCHIBUSColumn.dataType = 'String';
            }
            if(ARCHIBUSColumn.width){
                webixColumn.width = ARCHIBUSColumn.width;
            }
            else{
                webixColumn.adjust = "data";
            }
            if(ARCHIBUSColumn.action){
                webix.ARCHIBUS.buttonsMap = ARCHIBUSColumn.action;
                webixColumn.template = this.renderActionButtonsColumn;
            }
            else{
                webixColumn.sort = "server";
            }
            if(ARCHIBUSColumn.groupBy){
                webixColumn.template = this.dataGridGroups.renderColumnGroup;
                webixGroupBy.id =  ARCHIBUSColumn.id;
            }
            if(ARCHIBUSColumn.showTotals){
                var configurationTotalGroup = this.dataGridGroups.configureTotalGroup(webixGroupBy, ARCHIBUSColumn);
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
    configureCheckboxColumn(ARCHIBUSColumns){
        var configureCheckbox = {
            id: "ch1",
            header: "",
            width: 40,
            template: "{common.checkbox()}"
        };

        var isCalcTotalGroup = false;
        for(var index in ARCHIBUSColumns){
            if(ARCHIBUSColumns[index].showTotals){
                isCalcTotalGroup = true;
                break;
            }
        }
        if(isCalcTotalGroup)
            configureCheckbox['footer'] = {text:"Total:"};

        return configureCheckbox;
    }

    /*
     Customize the header column the grid view depending on the set values in the config
		@title: the name of the header
		@dataType: the type column
		@actions: the actions column
     */
    configureColumnHeader (title, dataType, actions){
        if(actions){
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
    /*
     Customize the style column the grid view depending on the set values in the config
		@cssClass: the style column 
     */
    configureColumnStyle(cssClass){
        if(cssClass){
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

    /*
     Do perform the formation of the action buttons in the column
     */
    renderActionButtonsColumn(cellElement, cellInfo){
        if(cellElement.$group){
            return ' ';
        }
        var result = "";
        for(var number in webix.ARCHIBUS.buttonsMap){
            var button = webix.ARCHIBUS.buttonsMap[number];
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


    renderTooltip(rowItem, rowInfo){
        if(rowItem.$group){
            for(var item in webix.ARCHIBUS.group.tooltip){
                if(item == rowItem.id && webix.ARCHIBUS.group.tooltip[item]){
                    return 'Continues on the next page';
                }
            }
        }
        return "";
    }
}

module.exports = DataGrid;