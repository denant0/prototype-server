class DataGridFilter {

    constructor () {
        webix.ARCHIBUS.currentDisplayFilter = {};
        this._equalsList = ['', 'least', 'anyway','highest'];
        webix.ui({
            view: 'popup',
            css: 'customFilterView',
            id: 'customFilterView',
            autoheight: true,
            padding: 1,
            on: {
                "onHide": function (){
                    webix.ARCHIBUS.currentDisplayFilter = {};
                }
            },
            body: {
                css: 'customFilterView',
                template: function () {
                    switch (webix.ARCHIBUS.currentDisplayFilter.type) {
                        case 'enum':
                            return this.renderSelectFilter();
                        case 'text':
                            return this.renderTextFilter();
                        case 'date':
                            return "future";
                        case 'integer':
                        case 'number':
                            return this.renderNumberFilter();
                    }
                },
                autoheight: true,
                borderless: true,
                data: [{}],
                equalsList: this._equalsList,
                renderSelectFilter: this._renderSelectFilter,
                renderTextFilter: this._renderTextFIlter,
                renderNumberFilter: this._renderNumberFilter
            }
        });
    }

    _renderSelectFilter () {
        var result = '<div class="ARCHIBUS_select_filter"><select id="customFilter">';
        for (var index in webix.ARCHIBUS.data.collection) {
            if (webix.ARCHIBUS.currentDisplayFilter.id == webix.ARCHIBUS.data.collection[index].id) {
                var collection = webix.ARCHIBUS.data.collection[index].value;
                for (var indexCollection in collection) {
                    result += '<option>'+ collection[indexCollection].value +'</option>';
                }
                break;
            }
        }
        result += '</select></div>';
        return result;
    }

    _renderTextFIlter () {
        return '<div class="ARCHIBUS_filter">' +
                    '<input id="customFilter" type="text" >' +
                '</div>';
    }

    _renderNumberFilter () {
        var result = '<div class="ARCHIBUS_number_filter">' +
                        '<input id="customFilter" type="text">' +
                        '<div>' +
                            'to' +
                        '</div>' +
                        '<select id="customSelectEquals">';
        for(var index in this.equalsList) {
            result += '<option>'+ this.equalsList[index] +'</option>';
        }

        result += '</select></div>';
        return result;

    }

    refreshWidthColumn (columnId) {
        var gridFilter = $$(webix.ARCHIBUS.filterContainer),
            configurationColumn = this.getColumnConfig(columnId);
        gridFilter.setColumnWidth(columnId, configurationColumn.width);
        gridFilter.refresh();
    }

    refreshWidthColumns () {
        var gridFilter = $$(webix.ARCHIBUS.filterContainer);
        this.eachColumn(function(columnId){
            var configurationColumn = this.getColumnConfig(columnId);
            gridFilter.setColumnWidth(columnId, configurationColumn.width);
        });
        gridFilter.refresh();
    }

    setPositionSctoll (position) {
        $$(webix.ARCHIBUS.filterContainer).scrollTo(position.x, position.y);
    }

    getFilteringView (config, nameFiltering) {
        var table = new webix.ui(this._createGridConfiguration(config, nameFiltering));
        webix.ARCHIBUS.filterContainer = table.getNode().attributes[2].nodeValue;
        return table;
    }

    _createGridConfiguration (config, nameFiltering) {
        var filterColumns = this._createGridColumns(config);
        var dataFilter = this._createGridData(config);
        var gridConfiguration = {
            container: nameFiltering,
            view: 'datatable',
            header: false,
            scroll: false,
            columns: filterColumns,
            autoheight:true,
            on:{
                onMouseMove:function(id, event, node){
                    var item = $$(webix.ARCHIBUS.filterContainer).getItem(id),
                        type = item[id.column].type;

                    webix.ARCHIBUS.currentDisplayFilter = {id: id.column, type: type};
                    this.callEvent('onCreateFilterView', [event.target, id.column]);
                    this.callEvent('onRegisterFilter', [type, id.row, id.column, this]);
                },
                onBeforeRender: function () {
                    this.on_click['filterCancelClass'] = function (event,cellElement) {
                        var gridObject = $$(webix.ARCHIBUS.gridContainer);
                        var filterGridObject = $$(webix.ARCHIBUS.filterContainer);
                        gridObject.registerFilter(
                            "",
                            { columnId: cellElement.column },
                            {
                                getValue:function(node){ return node;  },
                                $server: true
                            }
                        );
                        webix.ARCHIBUS.currentDisplayFilter = {};
                        var item = filterGridObject.getItem(cellElement.row);
                        item[cellElement.column].value = '';
                        if (item[cellElement.column].equal) {
                            item[cellElement.column].equal = '';
                        }
                        filterGridObject.refresh();
                        gridObject.filterByAll();
                    };
                },
                onCreateFilterView: this._createFilterView,
                onRegisterFilter: this._registerFilter,
                onRegisterTextFilter: this._registerTextFilter,
                onRegisterSelectFilter: this._registerSelectFilter,
                onRegisterNumberFilter: this._registerNumberFilter
            },
            onMouseMove:{},
            data: [dataFilter]
        };
        gridConfiguration.leftSplit = this._getLeftSplit(filterColumns, config.lastLeftFixedColumn, config.editing);
        gridConfiguration.rightSplit = this._getRigthSplit(filterColumns, config.firstRightFixedColumn);

        return gridConfiguration;
    }

    _registerFilter (type,rowId, columnId, view) {
        switch (type) {
            case 'text':
                view.callEvent('onRegisterTextFilter', [rowId, columnId]);
                break;
            case 'enum':
                view.callEvent('onRegisterSelectFilter', [rowId, columnId]);
                break;
            case 'number':
            case 'integer':
                view.callEvent('onRegisterNumberFilter', [rowId, columnId]);
                break;
        }
    }

    _registerTextFilter (row, column) {
        var node = document.getElementById("customFilter");
        var item = $$(webix.ARCHIBUS.filterContainer).getItem(row);
        if (item[column].value) {
            node.value = item[column].value;
        }
        $$(webix.ARCHIBUS.gridContainer).registerFilter(
            node.value,
            { columnId: column },
            {
                getValue:function(node){ return node;  },
                $server: true

            }
        );
        node.focus();
        node.onkeyup = function () {
            var item = $$(webix.ARCHIBUS.filterContainer).getItem(row);
            item[column].value =  this.value;
            $$(webix.ARCHIBUS.filterContainer).refresh();
            $$(webix.ARCHIBUS.gridContainer).filterByAll();
        };
    }

    _registerSelectFilter (row, column) {
        var node = document.getElementById("customFilter");
        var item = $$(webix.ARCHIBUS.filterContainer).getItem(row);
        if (item[column].value) {
            node.value = item[column].value;
        }
        $$(webix.ARCHIBUS.gridContainer).registerFilter(
            node.value,
            { columnId: column },
            {
                getValue:function(node){ return node;  },
                $server: true
            }
        );
        node.onchange  = function () {
            var item = $$(webix.ARCHIBUS.filterContainer).getItem(row);
            item[column].value =  this.value;
            $$(webix.ARCHIBUS.filterContainer).refresh();
            $$(webix.ARCHIBUS.gridContainer).filterByAll();
        };
    }

    _registerNumberFilter (row, column) {
        var nodeValue = document.getElementById("customFilter");
        var nodeEquals = document.getElementById("customSelectEquals");

        var item = $$(webix.ARCHIBUS.filterContainer).getItem(row);
        if (item[column].value) {
            nodeValue.value = item[column].value;
        }
        if (item[column].equal) {
            nodeEquals.value = item[column].equal;
        }
        $$(webix.ARCHIBUS.gridContainer).registerFilter(
            {value: nodeValue.value, equal: nodeEquals.value},
            { columnId: column },
            {
                getValue:function(node){ webix.message(node.equal); return node.value; },
                $server: true
            }
        );

        nodeEquals.onchange  = function () {
            var item = $$(webix.ARCHIBUS.filterContainer).getItem(row);
            item[column].equal =  this.value;
            $$(webix.ARCHIBUS.filterContainer).refresh();
            $$(webix.ARCHIBUS.gridContainer).filterByAll();
        };

        nodeValue.focus();
        nodeValue.onkeyup = function () {
            var item = $$(webix.ARCHIBUS.filterContainer).getItem(row);
            item[column].value =  this.value;
            $$(webix.ARCHIBUS.filterContainer).refresh();
            $$(webix.ARCHIBUS.gridContainer).filterByAll();
        };
    }

    _createFilterView (node, column) {
        var filterView = $$("customFilterView"),
            body = filterView.getBody(),
            configGridCell = $$(webix.ARCHIBUS.filterContainer).getColumnConfig(column);

        filterView.show(node);
        switch (webix.ARCHIBUS.currentDisplayFilter.type) {
            case 'enum':
            case 'date':
            case 'text':
                body.config.width = 100;
                break;
            case 'number':
            case 'integer':
                body.config.width = 200;
                break;
        }
        filterView.config.left += (configGridCell.width - body.config.width)/2;
        body.refresh();
    }

    _createGridColumns (config) {
        var ARCHIBUSColumns = config.columns;
        var gridFilterColumns = [];
        var index = 0;

        gridFilterColumns[index++] = this._configureGridColumn('checkbox');
        if (config.editing) {
            gridFilterColumns[index++] = this._configureGridColumn('edit');
        }

        for (var number in ARCHIBUSColumns) {
            var column = ARCHIBUSColumns[number];
            gridFilterColumns[index++] = this._configureGridColumn(column.id, column.dataType);
        }
        return gridFilterColumns;
    }

    _createGridData (config) {
        var ARCHIBUSColumns = config.columns;
        var gridData = {};

        for (var number in ARCHIBUSColumns) {
            var column = ARCHIBUSColumns[number];
            var data = {}

            data.type = column.dataType;
            gridData[column.id] = data;

        }
        return gridData;
    }

    _configureGridColumn (id, dataType) {
        var configGridColumn = {};
        configGridColumn.id = id;
        configGridColumn.dataType = dataType;
        configGridColumn.css = 'filterCell';
        configGridColumn.template = this. _renderFilterValue;
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

    _renderFilterValue (cellElement, cellInfo) {
        var result;
        var id = this.id;

        if (id == 'checkbox' || id == 'edit' || id == 'action') {
            result =  "";
        } else {
            if (cellElement[id].value) {
                result = '<div class="filterValue"><img class="filterCancelClass" src="style/icons/cansel.jpg" style="float:left;"/><div style="padding-left: 2px; float:left;">' + cellElement[id].value;
                if (cellElement[id].equal) {
                    result += ' to ' + cellElement[id].equal;
                }
                result += '</div></div>';

            } else {
                result = 'All values';
            }
        }

        if (webix.ARCHIBUS.gridContainer && id == webix.ARCHIBUS.currentDisplayFilter.id) {
            var gridObject = $$(webix.ARCHIBUS.filterContainer);
            gridObject.callEvent('onCreateFilterView', [this.node, id]);
            gridObject.callEvent('onRegisterFilter', [webix.ARCHIBUS.currentDisplayFilter.type, cellElement.id, id, gridObject]);
        }
        return result;
    }
}


module.exports = DataGridFilter;
