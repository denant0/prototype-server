var TextFilter = require('../data-grid/filters/text-filter'),
    SelectFilter = require('../data-grid/filters/select-filter'),
    NumericRangeFilter = require('../data-grid/filters/numeric-range-filter'),
    DateRangeFilter = require('../data-grid/filters/date-range-filter');


class DataGridFilter {

    constructor () {
        webix.ARCHIBUS.currentDisplayFilter = {};

        webix.protoUI ({
            name: 'filterPopup',
            show: this._doShowFilterView,
            _set_point: this._setAnchorPosition
        }, webix.ui.popup);

        webix.protoUI ({
            name: 'customFilterTable',
            _custom_tab_handler: function (tab, e) {
                return false;
            }
        }, webix.ui.datatable);

        this._registerFilter(new TextFilter());
        this._registerFilter(new SelectFilter());
        this._registerFilter(new NumericRangeFilter());
        this._registerFilter(new DateRangeFilter());
    }

    refreshWidthColumn(columnId) {
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

    afterFilter () {
        $$(webix.ARCHIBUS.filterContainer).editStop();
        if (webix.ARCHIBUS.currentDisplayFilter.id) {
            $$(webix.ARCHIBUS.filterContainer).editCell(webix.ARCHIBUS.currentDisplayFilter.row, webix.ARCHIBUS.currentDisplayFilter.id);
        }
    }

    _doShowFilterView(node, mode, point){
        if(!this.callEvent("onBeforeShow",arguments))
            return false;

        this._settings.hidden = false;
        this._viewobj.style.zIndex = (this._settings.zIndex||webix.ui.zIndex());
        if (this._settings.modal || this._modal){
            this._modal_set(true);
            this._modal = null; // hidden_setter handling
        }

        var pos, dx, dy;
        mode = mode || {};
        if (!mode.pos)
            mode.pos = this._settings.relative;

        //get position of source html node
        //we need to show popup which pointing to that node
        if (node){
            //if event was provided - get node info from it
            if (typeof node == "object" && !node.tagName){
                /*below logic is far from ideal*/
                if (node.target || node.srcElement){
                    pos = webix.html.pos(node);
                    dx = 20;
                    dy = 5;
                } else
                    pos = node;


            } else {
                node = webix.toNode(node);
                webix.assert(node,"Not existing target for window:show");
                pos = webix.html.offset(node);
            }

            //size of body, we need to fit popup inside
            var x = Math.max(window.innerWidth || 0, document.body.offsetWidth);
            var y = Math.max(window.innerHeight || 0, document.body.offsetHeight);

            //size of node, near which popup will be rendered
            dx = dx || node.offsetWidth  || 0;
            dy = dy || node.offsetHeight || 0;
            //size of popup element
            var size = this._last_size;

            var fin_x = pos.x;
            var fin_y = pos.y;
            var point_y=0;
            var point_x = 0;

            if (this._settings.autofit){
                var delta_x = 6; var delta_y=6; var delta_point = 6;

                //default pointer position - top
                point = "top";
                fin_y=0; fin_x = 0;
                //if we want to place menu at righ, but there is no place move it to left instead
                if (x - pos.x - dx < size[0] && mode.pos == "right")
                    mode.pos = "left";

                if (mode.pos == "right"){
                    fin_x = pos.x+delta_x+dx;
                    delta_y = -dy;
                    point = "left";
                    point_y = Math.round(pos.y+dy/2);
                    point_x = fin_x - delta_point;
                } else if (mode.pos == "left"){
                    fin_x = pos.x-delta_x-size[0]-1;
                    delta_y = -dy;
                    point = "right";
                    point_y = Math.round(pos.y+dy/2);
                    point_x = fin_x + size[0]+1;
                } else  {
                    //left border of screen
                    if (pos.x < 0){
                        fin_x = 0;
                        //popup exceed the right border of screen
                    } else if (x-pos.x > size[0]){
                        fin_x = pos.x; //aligned
                    } else{
                        fin_x = x-delta_x-size[0]; //not aligned
                    }

                    point_x = Math.round(pos.x+dx/2);
                    //when we have a small popup, point need to be rendered at center of popup
                    if (point_x > fin_x + size[0])
                        point_x = fin_x + size[0]/2;
                }

                //if height is not fixed - use default position
                if ((!size[1] || (y-dy-pos.y-delta_y > size[1])) && mode.pos != "top"){
                    //bottom
                    fin_y = dy+pos.y+delta_y - 4;
                    if (!point_y){
                        point = "top";
                        point_y = fin_y-delta_point;
                    }
                } else {
                    //top
                    fin_y = pos.y-delta_y - size[1];
                    if (fin_y < 0){
                        fin_y = 0;
                        //left|right point can be used, but there is no place for top point
                        if (point == "top") point = false;
                    } else if (!point_y){
                        point = "bottom";
                        fin_y --;
                        point_y = fin_y+size[1]+1;
                    }
                }
            }
            //anda
            var configGridCell = $$(webix.ARCHIBUS.filterContainer).getColumnConfig(webix.ARCHIBUS.currentDisplayFilter.id);
            fin_x = fin_x +(configGridCell.width - this.$width)/2;
            fin_y  = fin_y + $$(webix.ARCHIBUS.filterContainer).$height;
            //
            var deltax = (mode.x || 0);
            var deltay = (mode.y || 0);
            this.setPosition(fin_x+deltax, fin_y+deltay);
            if (this._set_point){
                if (point)
                    this._set_point(point,point_x+deltax, point_y+deltay);
                else
                    this._hide_point();
            }
        } else if (this._settings.position)
            this._setPosition();

        this._viewobj.style.display = "block";
        this._hide_timer = 1;
        webix.delay(function(){ this._hide_timer = 0; }, this, [], (webix.env.touch ? 400 : 100 ));

        this._render_hidden_views();
        if (this.config.autofocus){
            this._prev_focus = webix.UIManager.getFocus();
            webix.UIManager.setFocus(this);
        }

        if (-1 == webix.ui._popups.find(this))
            webix.ui._popups.push(this);

        this.callEvent("onShow",[]);
    }

    _setAnchorPosition (mode, left, top) {
        if (webix.ARCHIBUS.filterContainer) {
            var gridObject = $$(webix.ARCHIBUS.filterContainer);
            top = top + gridObject.$height;
        }
        this._hide_point();
        document.body.appendChild(this._point_element = webix.html.create("DIV",{ "class":"webix_point_"+mode },""));
        this._point_element.style.zIndex = webix.ui.zIndex();
        this._point_element.style.top = top+"px";
        this._point_element.style.left = left+"px";
    }

    _registerFilter (filter) {
        var configure = filter.configuration();
        webix.editors.$popup[configure.id] = configure.view;
    }

    _createGridConfiguration (config, nameFiltering) {
        var filterColumns = this._createGridColumns(config);
        var dataFilter = this._createGridData(config);
        var gridConfiguration = {
            container: nameFiltering,
            view: 'customFilterTable',
            css: 'styleFilterTable',
            header: false,
            scroll: false,
            columns: filterColumns,
            editable:true,
            editaction: 'custom',
            autoheight:true,
            on:{
                onItemClick: this._itemClick,
                onBeforeRender: this._beforeRender,
                onAfterEditStop: this._afterEditStop
            },
            onMouseMove:{},
            data: [dataFilter]
        };
        gridConfiguration.leftSplit = this._getLeftSplit(filterColumns, config.lastLeftFixedColumn, config.editing);
        gridConfiguration.rightSplit = this._getRigthSplit(filterColumns, config.firstRightFixedColumn);

        return gridConfiguration;
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
            var data = {};
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
        if (dataType) {
            switch (dataType) {
                case 'number':
                case 'integer':
                    configGridColumn.editor = 'numericRange';
                    break;
                case 'enum':
                    configGridColumn.editor = 'customSelect';
                    break;
                case 'date':
                    configGridColumn.editor = 'dateRange';
                    break;
                default:
                    configGridColumn.editor = 'customText';
                    break;
            }
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

    _itemClick (id, event, node)
    {
        var item = $$(webix.ARCHIBUS.filterContainer).getItem(id),
            type = '';
        if (item) {
            type = item[id.column].type;
            this.editStop();
            webix.ARCHIBUS.currentDisplayFilter = {id: id.column, row: id.row, type: type};
            this.editCell(id.row, id.column);
        }
    }

    _beforeRender () {
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
            if (item[cellElement.column].maxValue) {
                item[cellElement.column].maxValue = '';
            }
            filterGridObject.refresh();
            gridObject.filterByAll();
        };
    }

    _afterEditStop (state, editors) {
        var item = this.getItem(webix.ARCHIBUS.currentDisplayFilter.row);
        var newState = state.old;
        if (item) {
            if (state.value.min || state.value.max || state.value.min == '' || state.value.max == '') {
                newState.value = state.value.min;
                newState.maxValue = state.value.max;
            } else {
                newState.value = state.value;
            }
            item[webix.ARCHIBUS.currentDisplayFilter.id] = newState;
        }
    }

    _renderFilterValue (cellElement, cellInfo) {
        var result;
        var id = this.id;

        if (id == 'checkbox' || id == 'edit' || id == 'action') {
            result =  "";
        } else {
            if (cellElement[id].value) {
                result = '<div class="filterValue"><img class="filterCancelClass" src="style/icons/cansel.jpg" style="float:left;"/><div style="padding-left: 2px; float:left;">' + cellElement[id].value;
                if (cellElement[id].type == 'number' || cellElement[id].type == 'integer') {
                    if (cellElement[id].maxValue ) {
                        result += ' to ' + cellElement[id].maxValue;
                    } else {
                        result += ' to highest';
                    }
                }

                result += '</div></div>';
            } else {
                if (cellElement[id].maxValue) {
                    result = '<div class="filterValue">' +
                                '<img class="filterCancelClass" src="style/icons/cansel.jpg" style="float:left;"/>' +
                                '<div style="padding-left: 2px; float:left;"> ' +
                                    'lowest to' + cellElement[id].maxValue +
                                '</div>' +
                              '</div>';
                } else {
                    result = 'All values';
                }
            }
        }
        return result;
    }
}

module.exports = DataGridFilter;