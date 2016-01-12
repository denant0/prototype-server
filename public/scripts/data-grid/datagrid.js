"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _typeof(obj) { return typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);throw new Error("Cannot find module '" + o + "'");
            }var f = n[o] = { exports: {} };t[o][0].call(f.exports, function (e) {
                var n = t[o][1][e];return s(n ? n : e);
            }, f, f.exports, e, t, n, r);
        }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) s(r[o]);return s;
})({ 1: [function (require, module, exports) {
        var classStyle = require('./metadata/sample-cell-style-metadata');
        webix.ARCHIBUS = {};

        /*
         Map of customGridEvents used in the grid user
         */
        webix.actions = {
            selectValue: function selectValue() {
                var id = this.getSelectedId(true);
                if (id.length != 0) {
                    var text = this.getItem(id)[id[0].column];
                    webix.message(text);
                }
            },
            clickCell: function clickCell(id, event) {
                if (typeof webix.ARCHIBUS.editRows != 'undefined') {
                    for (var index in webix.ARCHIBUS.editRows) {
                        var editRow = webix.ARCHIBUS.editRows[index];
                        if (editRow.id == id.row) {
                            this.editCell(id.row, id.column);
                        }
                    }
                }
            },
            buttonClick1: function buttonClick1(event, object, cell) {
                webix.message('You click button 1');
            },
            buttonClick2: function buttonClick2(event, object, cell) {
                webix.message('You click button 2');
            },
            buttonClick3: function buttonClick3(event, object, cell) {
                webix.message('You click button 3');
            },
            buttonClick4: function buttonClick4() {
                webix.message('You click button 4');
            },
            cssClassCountryCode: function cssClassCountryCode(container, cellInfo, t, y) {
                if (cellInfo.checkbox && cellInfo.$group) {
                    return 'rowGroupHeaderSelect';
                }
                if (!cellInfo.checkbox && cellInfo.$group) {
                    return 'rowGroupHeader';
                }

                var currentEnumStyle = classStyle[y];
                for (var element in currentEnumStyle) {
                    if (container == currentEnumStyle[element].cellText) {
                        return currentEnumStyle[element].classStyle;
                    }
                }
            }
        };
    }, { "./metadata/sample-cell-style-metadata": 13 }], 2: [function (require, module, exports) {
        /*
        The class responsible for editing
        */

        var DataGridEdit = (function () {
            function DataGridEdit() {
                _classCallCheck(this, DataGridEdit);

                webix.editors.$popup = {
                    text: {
                        view: 'popup',
                        body: {
                            view: 'textarea',
                            width: 250,
                            height: 50
                        }
                    },
                    date: {
                        view: 'popup',
                        body: {
                            view: 'calendar',
                            icons: true,
                            weekNumber: true,
                            timepicker: true
                        }
                    }
                };
                webix.ARCHIBUS.editRows = [];
                webix.ARCHIBUS.editButtonMap = [{
                    class: 'editStartClass',
                    function: this.eventEditStart
                }, {
                    class: 'editSuccessClass',
                    function: this.eventEditSuccess
                }, {
                    class: 'editCancelClass',
                    function: this.eventEditCancel
                }];
            }

            /*
             Do add editing options in the configuration column
                @configCurrentColumn: the configuration of the current column
                @configColumns: the configuration of all columns filled
                @dataType: the data type
                @loadClass: class manages the loading of data
             */

            _createClass(DataGridEdit, [{
                key: "configureColumnEdit",
                value: function configureColumnEdit(configCurrentColumn, configColumns, dataType, loadClass) {
                    if (dataType) {
                        switch (dataType) {
                            case 'number':
                                configCurrentColumn.editor = 'popup';
                                break;
                            case 'integer':
                                configCurrentColumn.editor = 'text';
                                break;
                            case 'date':
                                configCurrentColumn.editor = 'date';
                                break;
                            case 'text':
                                configCurrentColumn.editor = 'text';
                                break;
                            case 'enum':
                                configCurrentColumn.editor = 'combo';
                                var length = webix.ARCHIBUS.data.collection.length;
                                webix.ARCHIBUS.data.collection[length] = {};
                                webix.ARCHIBUS.data.collection[length].id = configCurrentColumn.id;
                                loadClass.doLoadCollectionFromServer(configCurrentColumn.id, configColumns);
                                break;
                        }
                    }
                    return configCurrentColumn;
                }

                /*
                 Handling the click event on the button "Start editing"
                */

            }, {
                key: "eventEditStart",
                value: function eventEditStart(event, object, cell) {
                    var isFocus = true;
                    webix.UIManager.tabControl = true;
                    this.addRowCss(object.row, 'rowEdited');
                    this.eachColumn(function (columnId) {
                        var config = this.getColumnConfig(columnId);
                        if (typeof config.editor != 'undefined' && isFocus) {
                            this.editCell(object.row, columnId);
                            isFocus = false;
                        }
                    });
                    webix.ARCHIBUS.editRows[webix.ARCHIBUS.editRows.length] = {
                        id: object.row,
                        data: {}
                    };
                }

                /*
                 Handling the click event on the button "Successful edit"
                */

            }, {
                key: "eventEditSuccess",
                value: function eventEditSuccess(event, object, cell) {
                    webix.UIManager.tabControl = false;
                    this.editStop();
                    for (var index in webix.ARCHIBUS.editRows) {
                        var editRow = webix.ARCHIBUS.editRows[index];
                        if (editRow.id == object.row) {
                            this.removeRowCss(editRow.id, 'rowEdited');
                            webix.ARCHIBUS.editRows.splice(index, 1);
                            this.callEvent("onUpdataData", [this.getItem(object.row)]);
                            this.refresh();
                            break;
                        }
                    }
                }

                /*
                 Handling the click event on the button "Cancel edit"
                */

            }, {
                key: "eventEditCancel",
                value: function eventEditCancel(event, object, cell) {
                    webix.UIManager.tabControl = false;
                    this.editStop();
                    for (var i in webix.ARCHIBUS.editRows) {
                        var editRow = webix.ARCHIBUS.editRows[i];
                        if (editRow.id == object.row) {
                            this.removeRowCss(editRow.id, 'rowEdited');
                            var dataRow = this.getItem(object.row);
                            for (var index in editRow.data) {
                                dataRow[index] = editRow.data[index];
                            }
                            this.updateItem(object.row, dataRow);
                            webix.ARCHIBUS.editRows.splice(i, 1);
                            break;
                        }
                    }
                    this.eachColumn(function (columnId) {
                        this.callEvent('onRecalculateTotalColumn', [object.row, columnId]);
                    });
                }

                /*
                 Handling customGridEvents after have finished editing
                */

            }, {
                key: "eventAfterEditStop",
                value: function eventAfterEditStop(state, editor, ignoreUpdate) {
                    if (state.value != state.old) {
                        for (var index in webix.ARCHIBUS.editRows) {
                            var editRow = webix.ARCHIBUS.editRows[index];
                            if (editRow.id == editor.row) {
                                var idAdd = true;
                                for (var obj in webix.ARCHIBUS.editRows[index].data) {
                                    if (obj == editor.column) {
                                        idAdd = false;
                                        break;
                                    }
                                }
                                if (idAdd) {
                                    webix.ARCHIBUS.editRows[index].data[editor.column] = state.old;
                                }
                                break;
                            }
                        }
                    }
                    this.callEvent('onRecalculateTotalColumn', [editor.row, editor.column]);
                }

                /*
                 Handling the keyboard event "Tab"
                 */

            }, {
                key: "eventHandlerTab",
                value: function eventHandlerTab(tab, e) {
                    if (this._settings.editable && !this._in_edit_mode) {
                        if (e.target && e.target.tagName == "INPUT") {
                            return true;
                        }

                        var selection = this.getSelectedId(true);
                        if (selection.length == 1) {
                            return false;
                        }
                    }
                    return true;
                }

                /*
                 Do perform the formation of the action buttons edits in the column
                 */

            }, {
                key: "renderEditColumn",
                value: function renderEditColumn(cellElement, cellInfo) {
                    if (cellElement.$group) {
                        return ' ';
                    }
                    var result = "";
                    for (var index in webix.ARCHIBUS.editRows) {
                        if (webix.ARCHIBUS.editRows[index].id == cellElement.id) {
                            return "<img class='editSuccessClass' src='style/icons/success.png'/><img class='editCancelClass' src='style/icons/cansel.jpg'/>";
                        }
                    }
                    return "<img class='editStartClass' src='style/icons/edit.jpg'/>";
                }
            }]);

            return DataGridEdit;
        })();

        module.exports = DataGridEdit;
    }, {}], 3: [function (require, module, exports) {
        var TextFilter = require('../data-grid/filters/text-filter'),
            SelectFilter = require('../data-grid/filters/select-filter'),
            NumericRangeFilter = require('../data-grid/filters/numeric-range-filter'),
            DateRangeFilter = require('../data-grid/filters/date-range-filter');

        var DataGridFilter = (function () {
            function DataGridFilter() {
                _classCallCheck(this, DataGridFilter);

                webix.ARCHIBUS.currentDisplayFilter = {};

                webix.protoUI({
                    name: 'filterPopup',
                    show: this._doShowFilterView,
                    _set_point: this._setAnchorPosition
                }, webix.ui.popup);

                webix.protoUI({
                    name: 'customFilterTable',
                    _custom_tab_handler: function _custom_tab_handler(tab, e) {
                        return false;
                    }
                }, webix.ui.datatable);

                this._registerFilter(new TextFilter());
                this._registerFilter(new SelectFilter());
                this._registerFilter(new NumericRangeFilter());
                new DateRangeFilter();
                //this._registerFilter(new DateRangeFilter());
            }

            _createClass(DataGridFilter, [{
                key: "refreshWidthColumn",
                value: function refreshWidthColumn(columnId) {
                    var gridFilter = $$(webix.ARCHIBUS.filterContainer),
                        configurationColumn = this.getColumnConfig(columnId);
                    gridFilter.setColumnWidth(columnId, configurationColumn.width);
                    gridFilter.refresh();
                }
            }, {
                key: "refreshWidthColumns",
                value: function refreshWidthColumns() {
                    var gridFilter = $$(webix.ARCHIBUS.filterContainer);
                    this.eachColumn(function (columnId) {
                        var configurationColumn = this.getColumnConfig(columnId);
                        gridFilter.setColumnWidth(columnId, configurationColumn.width);
                    });
                    gridFilter.refresh();
                }
            }, {
                key: "setPositionSctoll",
                value: function setPositionSctoll(position) {
                    $$(webix.ARCHIBUS.filterContainer).scrollTo(position.x, position.y);
                }
            }, {
                key: "getFilteringView",
                value: function getFilteringView(config, nameFiltering) {
                    var table = new webix.ui(this._createGridConfiguration(config, nameFiltering));
                    return table;
                }
            }, {
                key: "afterFilter",
                value: function afterFilter() {
                    $$(webix.ARCHIBUS.filterContainer).editStop();
                    if (webix.ARCHIBUS.currentDisplayFilter.id) {
                        if (webix.ARCHIBUS.currentDisplayFilter.type == 'date') {
                            var targer = $$(webix.ARCHIBUS.filterContainer).getItemNode({ row: webix.ARCHIBUS.currentDisplayFilter.row, column: webix.ARCHIBUS.currentDisplayFilter.id });
                            $$("dataRangeFilter").show(targer);
                        } else {
                            $$(webix.ARCHIBUS.filterContainer).editCell(webix.ARCHIBUS.currentDisplayFilter.row, webix.ARCHIBUS.currentDisplayFilter.id);
                        }
                    }
                }
            }, {
                key: "_doShowFilterView",
                value: function _doShowFilterView(node, mode, point) {
                    if (!this.callEvent("onBeforeShow", arguments)) return false;

                    this._settings.hidden = false;
                    this._viewobj.style.zIndex = this._settings.zIndex || webix.ui.zIndex();
                    if (this._settings.modal || this._modal) {
                        this._modal_set(true);
                        this._modal = null; // hidden_setter handling
                    }

                    var pos, dx, dy;
                    mode = mode || {};
                    if (!mode.pos) mode.pos = this._settings.relative;

                    //get position of source html node
                    //we need to show popup which pointing to that node
                    if (node) {
                        //if event was provided - get node info from it
                        if ((typeof node === "undefined" ? "undefined" : _typeof(node)) == "object" && !node.tagName) {
                            /*below logic is far from ideal*/
                            if (node.target || node.srcElement) {
                                pos = webix.html.pos(node);
                                dx = 20;
                                dy = 5;
                            } else pos = node;
                        } else {
                            node = webix.toNode(node);
                            webix.assert(node, "Not existing target for window:show");
                            pos = webix.html.offset(node);
                        }

                        //size of body, we need to fit popup inside
                        var x = Math.max(window.innerWidth || 0, document.body.offsetWidth);
                        var y = Math.max(window.innerHeight || 0, document.body.offsetHeight);

                        //size of node, near which popup will be rendered
                        dx = dx || node.offsetWidth || 0;
                        dy = dy || node.offsetHeight || 0;
                        //size of popup element
                        var size = this._last_size;

                        var fin_x = pos.x;
                        var fin_y = pos.y;
                        var point_y = 0;
                        var point_x = 0;

                        if (this._settings.autofit) {
                            var delta_x = 6;var delta_y = 6;var delta_point = 6;

                            //default pointer position - top
                            point = "top";
                            fin_y = 0;fin_x = 0;
                            //if we want to place menu at righ, but there is no place move it to left instead
                            if (x - pos.x - dx < size[0] && mode.pos == "right") mode.pos = "left";

                            if (mode.pos == "right") {
                                fin_x = pos.x + delta_x + dx;
                                delta_y = -dy;
                                point = "left";
                                point_y = Math.round(pos.y + dy / 2);
                                point_x = fin_x - delta_point;
                            } else if (mode.pos == "left") {
                                fin_x = pos.x - delta_x - size[0] - 1;
                                delta_y = -dy;
                                point = "right";
                                point_y = Math.round(pos.y + dy / 2);
                                point_x = fin_x + size[0] + 1;
                            } else {
                                //left border of screen
                                if (pos.x < 0) {
                                    fin_x = 0;
                                    //popup exceed the right border of screen
                                } else if (x - pos.x > size[0]) {
                                        fin_x = pos.x; //aligned
                                    } else {
                                            fin_x = x - delta_x - size[0]; //not aligned
                                        }

                                point_x = Math.round(pos.x + dx / 2);
                                //when we have a small popup, point need to be rendered at center of popup
                                if (point_x > fin_x + size[0]) point_x = fin_x + size[0] / 2;
                            }

                            //if height is not fixed - use default position
                            if ((!size[1] || y - dy - pos.y - delta_y > size[1]) && mode.pos != "top") {
                                //bottom
                                fin_y = dy + pos.y + delta_y - 4;
                                if (!point_y) {
                                    point = "top";
                                    point_y = fin_y - delta_point;
                                }
                            } else {
                                //top
                                fin_y = pos.y - delta_y - size[1];
                                if (fin_y < 0) {
                                    fin_y = 0;
                                    //left|right point can be used, but there is no place for top point
                                    if (point == "top") point = false;
                                } else if (!point_y) {
                                    point = "bottom";
                                    fin_y--;
                                    point_y = fin_y + size[1] + 1;
                                }
                            }
                        }
                        //anda
                        var configGridCell = $$(webix.ARCHIBUS.filterContainer).getColumnConfig(webix.ARCHIBUS.currentDisplayFilter.id);
                        fin_x = fin_x + (configGridCell.width - this.$width) / 2;
                        fin_y = fin_y + $$(webix.ARCHIBUS.filterContainer).$height;
                        //
                        var deltax = mode.x || 0;
                        var deltay = mode.y || 0;
                        this.setPosition(fin_x + deltax, fin_y + deltay);
                        if (this._set_point) {
                            if (point) this._set_point(point, point_x + deltax, point_y + deltay);else this._hide_point();
                        }
                    } else if (this._settings.position) this._setPosition();

                    this._viewobj.style.display = "block";
                    this._hide_timer = 1;
                    webix.delay(function () {
                        this._hide_timer = 0;
                    }, this, [], webix.env.touch ? 400 : 100);

                    this._render_hidden_views();
                    if (this.config.autofocus) {
                        this._prev_focus = webix.UIManager.getFocus();
                        webix.UIManager.setFocus(this);
                    }

                    if (-1 == webix.ui._popups.find(this)) webix.ui._popups.push(this);

                    this.callEvent("onShow", []);
                }
            }, {
                key: "_setAnchorPosition",
                value: function _setAnchorPosition(mode, left, top) {
                    if (webix.ARCHIBUS.filterContainer) {
                        var gridObject = $$(webix.ARCHIBUS.filterContainer);
                        top = top + gridObject.$height;
                    }
                    this._hide_point();
                    document.body.appendChild(this._point_element = webix.html.create("DIV", { "class": "webix_point_" + mode }, ""));
                    this._point_element.style.zIndex = webix.ui.zIndex();
                    this._point_element.style.top = top + "px";
                    this._point_element.style.left = left + "px";
                }
            }, {
                key: "_registerFilter",
                value: function _registerFilter(filter) {
                    var configure = filter.configuration();
                    webix.editors.$popup[configure.id] = configure.view;
                }
            }, {
                key: "_createGridConfiguration",
                value: function _createGridConfiguration(config, nameFiltering) {
                    var filterColumns = this._createGridColumns(config);
                    var dataFilter = this._createGridData(config);
                    var gridConfiguration = {
                        container: nameFiltering,
                        view: 'customFilterTable',
                        css: 'styleFilterTable',
                        header: false,
                        scroll: false,
                        columns: filterColumns,
                        editable: true,
                        editaction: 'custom',
                        autoheight: true,
                        on: {
                            onItemClick: this._itemClick,
                            onBeforeRender: this._beforeRender,
                            onAfterEditStop: this._afterEditStop
                        },
                        onMouseMove: {},
                        data: [dataFilter]
                    };
                    gridConfiguration.leftSplit = this._getLeftSplit(filterColumns, config.lastLeftFixedColumn, config.editing);
                    gridConfiguration.rightSplit = this._getRigthSplit(filterColumns, config.firstRightFixedColumn);

                    return gridConfiguration;
                }
            }, {
                key: "_createGridColumns",
                value: function _createGridColumns(config) {
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
            }, {
                key: "_createGridData",
                value: function _createGridData(config) {
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
            }, {
                key: "_configureGridColumn",
                value: function _configureGridColumn(id, dataType) {
                    var configGridColumn = {};
                    configGridColumn.id = id;
                    configGridColumn.dataType = dataType;
                    configGridColumn.css = 'styleFilterTableCell';
                    configGridColumn.template = this._renderFilterValue;
                    if (dataType) {
                        switch (dataType) {
                            case 'number':
                            case 'integer':
                                configGridColumn.editor = 'numericRange';
                                break;
                            case 'enum':
                                configGridColumn.editor = 'customSelect';
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

            }, {
                key: "_getLeftSplit",
                value: function _getLeftSplit(columns, id, isEdit) {
                    var leftSplit = 1;
                    if (isEdit) {
                        leftSplit++;
                    }
                    if (id) {
                        leftSplit = 1;
                        for (var index = 0; index < columns.length; index++) {
                            if (columns[index].id == id) {
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

            }, {
                key: "_getRigthSplit",
                value: function _getRigthSplit(columns, id) {
                    var rightSplit = 0;
                    if (id) {
                        rightSplit = 1;
                        for (var index = 0; index < columns.length; index++) {
                            if (columns[index].id == id) {
                                rightSplit = columns.length - index;
                                break;
                            }
                        }
                    }
                    return rightSplit;
                }
            }, {
                key: "_itemClick",
                value: function _itemClick(id, event, node) {
                    var item = $$(webix.ARCHIBUS.filterContainer).getItem(id),
                        type = '';
                    if (item) {
                        type = item[id.column].type;
                        this.editStop();
                        webix.ARCHIBUS.currentDisplayFilter = { id: id.column, row: id.row, type: type };
                        if (type == 'date') {
                            $$("dataRangeFilter").show(event.target);
                        } else {
                            this.editCell(id.row, id.column);
                        }
                    }
                }
            }, {
                key: "_beforeRender",
                value: function _beforeRender() {
                    this.on_click['filterCancelClass'] = function (event, cellElement) {
                        var gridObject = $$(webix.ARCHIBUS.gridContainer);
                        var filterGridObject = $$(webix.ARCHIBUS.filterContainer);
                        gridObject.registerFilter("", { columnId: cellElement.column }, {
                            getValue: function getValue(node) {
                                return node;
                            },
                            $server: true
                        });
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
            }, {
                key: "_afterEditStop",
                value: function _afterEditStop(state, editors) {
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
            }, {
                key: "_renderFilterValue",
                value: function _renderFilterValue(cellElement, cellInfo) {
                    var result;
                    var id = this.id;

                    if (id == 'checkbox' || id == 'edit' || id == 'action') {
                        result = "";
                    } else {
                        if (cellElement[id].value) {
                            result = '<div class="filterValue"><img class="filterCancelClass" src="style/icons/cansel.jpg" style="float:left;"/><div style="padding-left: 2px; float:left;">' + cellElement[id].value;
                            if (cellElement[id].type == 'number' || cellElement[id].type == 'integer') {
                                if (cellElement[id].maxValue) {
                                    result += ' to ' + cellElement[id].maxValue;
                                } else {
                                    result += ' to highest';
                                }
                            }

                            result += '</div></div>';
                        } else {
                            if (cellElement[id].maxValue) {
                                result = '<div class="filterValue">' + '<img class="filterCancelClass" src="style/icons/cansel.jpg" style="float:left;"/>' + '<div style="padding-left: 2px; float:left;"> ' + 'lowest to' + cellElement[id].maxValue + '</div>' + '</div>';
                            } else {
                                result = 'All values';
                            }
                        }
                    }
                    return result;
                }
            }]);

            return DataGridFilter;
        })();

        module.exports = DataGridFilter;
    }, { "../data-grid/filters/date-range-filter": 8, "../data-grid/filters/numeric-range-filter": 9, "../data-grid/filters/select-filter": 10, "../data-grid/filters/text-filter": 11 }], 4: [function (require, module, exports) {
        /*
        The class responsible for the grouping of data
        */

        var DataGridGroups = (function () {
            function DataGridGroups() {
                _classCallCheck(this, DataGridGroups);

                webix.ARCHIBUS.group = {};
                webix.ARCHIBUS.group.tooltip = {};

                webix.ui.datafilter.sumTotalGroup = {
                    getValue: function getValue(node) {
                        return node.firstChild.innerHTML;
                    },
                    setValue: function setValue() {},
                    refresh: function refresh(master, node, value) {
                        var result = 0;
                        master.calculationColumnValue(null, value.columnId, null, 1, function (value) {
                            value = value * 1;
                            if (!isNaN(value)) {
                                result += value;
                            }

                            return value;
                        });

                        if (value.format) {
                            result = value.format(result);
                        }
                        if (value.template) {
                            result = value.template({ value: result });
                        }
                        var configColumn = master.getColumnConfig(value.columnId);
                        configColumn.footer[0].heigth = 40;
                        node.firstChild.innerHTML = '<div class="groupTitleFirst">' + result + '</div>';
                    },
                    trackCells: true,
                    render: function render(master, config) {
                        if (config.template) {
                            config.template = webix.template(config.template);
                        }
                        return "";
                    }
                };
            }
            /*
            Do perform the configuration of the grid to group the data
            	@groupId: the ID of the column by which want to group data
            	@groupHeader: column IDs for which want to calculate the total amount
            */

            _createClass(DataGridGroups, [{
                key: "configureGroup",
                value: function configureGroup(groupId, groupHeader) {
                    var configurationGroup = {
                        $group: {}
                    };

                    if (groupId) {
                        configurationGroup.$group.by = groupId;
                    }
                    if (groupHeader) {
                        configurationGroup.$group.map = {};
                        webix.ARCHIBUS.group.groupTotalLine = groupHeader;
                        for (var i in groupHeader) {
                            configurationGroup.$group.map[groupHeader[i].id + 'Sum'] = [groupHeader[i].id, 'sum'];
                        }
                    }
                    return configurationGroup;
                }
                /*
                Do perform the configuration columns to display the total amount of column data
                @webixGroupBy: configuration columns to display the total amount of column data
                @ARCHIBUSColumn: the configuration column 
                */

            }, {
                key: "configureTotalGroup",
                value: function configureTotalGroup(webixGroupBy, ARCHIBUSColumn) {
                    var configurationTotalGroup = webixGroupBy;

                    if (!configurationTotalGroup.header) {
                        configurationTotalGroup.header = [];
                    }
                    var index = configurationTotalGroup.header.length;
                    configurationTotalGroup.header[index] = {};
                    configurationTotalGroup.header[index].id = ARCHIBUSColumn.id;
                    configurationTotalGroup.header[index].title = ARCHIBUSColumn.title;
                    configurationTotalGroup.header[index].type = ARCHIBUSColumn.dataType;

                    return {
                        footer: [{ content: "sumTotalGroup", height: 20 }, { text: ARCHIBUSColumn.title, height: 20 }],
                        header: configurationTotalGroup
                    };
                }
                /*
                 Do perform the formation of column for groups
                 */

            }, {
                key: "renderColumnGroup",
                value: function renderColumnGroup(cellElement, cellInfo, cellValue, b, rowNumber) {
                    var result;
                    if (cellElement.$group) {
                        result = this.renderGroupTitle(cellElement, cellInfo);
                        var freeItems = webix.ARCHIBUS.pageSize - rowNumber;
                        if (cellElement.open) {
                            if (freeItems < cellElement.$count) {
                                webix.ARCHIBUS.group.tooltip[cellElement.id] = true;
                            } else {
                                webix.ARCHIBUS.group.tooltip[cellElement.id] = false;
                            }
                        } else {
                            webix.ARCHIBUS.group.tooltip[cellElement.id] = false;
                        }
                    } else {
                        result = cellValue;
                    }
                    this.configureGroupHeaderStyle(cellElement);
                    return result;
                }
                /*
                 Customize the style header group row
                 */

            }, {
                key: "configureGroupHeaderStyle",
                value: function configureGroupHeaderStyle(cellElement) {
                    var gridObject = $$(webix.ARCHIBUS.gridContainer);

                    if (cellElement.$group) {
                        gridObject.setRowHeight(cellElement.id, 40);
                    } else {
                        var cellCheckbox = gridObject.getItemNode({ row: cellElement.id, column: 'checkbox' });
                        if (cellCheckbox) {
                            var styleBorderBottom;
                            var nextRowId = gridObject.getNextId(cellElement.id, 1);
                            var pattern = "0$";
                            var isAddStyle = true;
                            if (typeof nextRowId != 'string') {
                                isAddStyle = false;
                            } else {
                                for (var i = 0, length = pattern.length; i < length; i += 1) {
                                    var p = pattern[i];
                                    var s = nextRowId[i];
                                    if (p !== s) {
                                        isAddStyle = false;
                                        break;
                                    }
                                }
                            }

                            if (isAddStyle) {
                                styleBorderBottom = '1px solid #E4EDF9';
                            } else {
                                styleBorderBottom = 'none';
                            }

                            cellCheckbox.style.borderBottom = styleBorderBottom;
                        }
                    }
                }
                /*
                 Do perform the formation of header for groups
                 */

            }, {
                key: "renderGroupTitle",
                value: function renderGroupTitle(cellElement, cellInfo) {
                    var count = cellElement.$count;
                    return '<div class="groupTitleFirst">' + cellInfo.treetable(cellElement, cellInfo) + " " + cellElement.value + '</div>' + '<div class="groupTitleSecond">' + count + " assets" + '</div>';
                }
                /*
                 Do perform the formation of the cell in the column
                 */

            }, {
                key: "renderColumnsCell",
                value: function renderColumnsCell(cellElement, cellInfo, cellValue) {
                    var result = "";
                    if (cellElement.$group) {
                        for (var i in webix.ARCHIBUS.group.groupTotalLine) {
                            if (webix.ARCHIBUS.group.groupTotalLine[i].id == this.id) {
                                if (webix.ARCHIBUS.group.groupTotalLine[i].type == 'number') {
                                    var value = webix.i18n.numberFormat(cellElement[webix.ARCHIBUS.group.groupTotalLine[i].id + "Sum"]);
                                    result = this.renderGroupTotals(value);
                                } else {
                                    var value = cellElement[webix.ARCHIBUS.group.groupTotalLine[i].id + "Sum"];
                                    result = this.renderGroupTotals(value);
                                }
                            }
                        }
                    } else {
                        result = cellValue;
                    }

                    return result;
                }
                /*
                 Do perform the formation of header totals for groups
                 */

            }, {
                key: "renderGroupTotals",
                value: function renderGroupTotals(value) {
                    return '<div class="groupTitleFirst">' + value + '</div>' + '<div class="groupTitleSecond">' + 'Total' + '</div>';
                }
                /*
                 Do perform calculations on data in column
                 */

            }, {
                key: "calculationColumnValue",
                value: function calculationColumnValue(startrow, startcol, numrows, numcols, callback) {
                    if (startrow === null && this.data.order.length > 0) {
                        startrow = this.data.order[0];
                    }
                    if (startcol === null) {
                        startcol = this.columnId(0);
                    }
                    if (numrows === null) {
                        numrows = this.data.order.length;
                    }
                    if (numcols === null) {
                        numcols = this._settings.columns.length;
                    }

                    if (!this.exists(startrow)) {
                        return;
                    }
                    startrow = this.getIndexById(startrow);
                    startcol = this.getColumnIndex(startcol);
                    if (startcol === null) {
                        return;
                    }

                    for (var i = 0; i < numrows && startrow + i < this.data.order.length; i++) {
                        var row_ind = startrow + i;
                        var row_id = this.data.order[row_ind];
                        var item = this.getItem(row_id);
                        var col_id = this.columnId(numcols);
                        for (var j = 0; j < numcols && startcol + j < this._settings.columns.length; j++) {
                            var col_ind = startcol + j;
                            var col_id = this.columnId(col_ind);
                            var flag = true;
                            for (var num_mas in webix.ARCHIBUS.group.groupTotalLine) {
                                if (col_id == webix.ARCHIBUS.group.groupTotalLine[num_mas].id) {
                                    callback(item[webix.ARCHIBUS.group.groupTotalLine[num_mas].id + "Sum"]);
                                    flag = false;
                                }
                            }
                            if (flag) {
                                item[col_id] = callback(item[col_id], row_id, col_id, i, j);
                            }
                        }
                    }
                }
                /*
                 Recalculate the total column
                    @row: the grid row
                    @column: the grid column
                 */

            }, {
                key: "recalculateTotalColumn",
                value: function recalculateTotalColumn(row, column) {
                    for (var index in webix.ARCHIBUS.group.groupTotalLine) {
                        var id = webix.ARCHIBUS.group.groupTotalLine[index].id;
                        if (column == id) {
                            var childs = this.data.getBranch(this.getParentId(row));
                            var sum = 0;
                            for (var i = 0; i < childs.length; i++) {
                                var item = childs[i];
                                sum += item[id] * 1;
                            }
                            var idRowParent = this.getParentId(row);
                            var parent = this.getItem(idRowParent);
                            parent[id + 'Sum'] = sum;
                            this.refresh(idRowParent);
                            break;
                        }
                    }
                }
            }]);

            return DataGridGroups;
        })();

        module.exports = DataGridGroups;
    }, {}], 5: [function (require, module, exports) {
        var DataGridLoad = (function () {
            function DataGridLoad() {
                _classCallCheck(this, DataGridLoad);

                webix.TreeDataLoader._loadNextA = this.doLoadData;
                webix.TreeDataLoader._feed_commonA = this.createUrlAndLoadData;
                webix.TreeDataLoader._feed_callback = this.doCheckExistenceData;
                webix.TreeDataLoader._onLoad = this.parseData;

                webix.DataState = {
                    getState: this.getStateGridData
                };
            }
            /*
             Do load data
             */

            _createClass(DataGridLoad, [{
                key: "doLoadData",
                value: function doLoadData(count, start, callback, url, now) {
                    var config = this._settings;
                    if (config.datathrottle && !now) {
                        if (this._throttle_request) {
                            window.clearTimeout(this._throttle_request);
                        }
                        this._throttle_request = webix.delay(function () {
                            this.loadNext(count, start, callback, url, true);
                        }, this, 0, config.datathrottle);
                        return;
                    }

                    if (!start && start !== 0) {
                        start = this.count();
                    }
                    if (!count) {
                        count = config.datafetch || this.count();
                    }

                    this.data.url = this.data.url || url;
                    if (this.callEvent("onDataRequest", [start, count, callback, url]) && this.data.url) {
                        this.data.feed.call(this, start, count, callback);
                    }
                }
                /*
                 Do perform the query on the server and load the data from the response from the server
                 */

            }, {
                key: "createUrlAndLoadData",
                value: function createUrlAndLoadData(from, count, callback) {
                    var url = this.data.url;
                    if (from < 0) {
                        from = 0;
                    }
                    var final_callback = [this._feed_callback, callback];
                    if (url && typeof url != "string") {
                        var details = { from: from, count: count };
                        if (this.getState) {
                            var state = this.getState();
                            details.sort = state.sort;
                            details.filter = state.filter;
                        }

                        this.load(url, final_callback, details);
                    } else {
                        var finalurl = url + (url.indexOf("?") == -1 ? "?" : "&") + (this.count() ? "continue=true" : "");
                        if (count != -1) {
                            finalurl += "&count=" + count;
                        }
                        if (from) {
                            finalurl += "&start=" + from;
                        }

                        if (this.getState) {
                            var state = this.getState();
                            if (state.sort) {
                                if (typeof this.___multisort != 'undefined' && this.___multisort) {
                                    for (var key in state.sort) {
                                        finalurl += "&sort[" + state.sort[key].id + "]=" + state.sort[key].dir;
                                    }
                                } else {
                                    finalurl += "&sort[" + state.sort.id + "]=" + state.sort.dir;
                                }
                            }
                            if (state.filter) {
                                for (var key in state.filter) {
                                    finalurl += "&filters[" + key + "]=" + state.filter[key];
                                }
                            }
                        }
                        this.load(finalurl, final_callback);
                    }
                }
                /*
                 Do check for data loading
                 */

            }, {
                key: "doCheckExistenceData",
                value: function doCheckExistenceData() {
                    //after loading check if we have some ignored requests
                    var temp = this._load_count;
                    var last = this._feed_last;
                    this._load_count = false;
                    if ((typeof temp === "undefined" ? "undefined" : _typeof(temp)) == "object" && (temp[0] != last[0] || temp[1] != last[1])) {
                        this.data.feed.apply(this, temp); //load last ignored request
                    }
                }
                /*
                 Do parse the loaded data
                 */

            }, {
                key: "parseData",
                value: function parseData(text, xml, loader) {
                    var data;
                    if (loader === -1) {
                        data = this.data.driver.toObject(xml);
                    } else {
                        //ignore data loading command if data was reloaded
                        this._ajax_queue.remove(loader);
                        data = this.data.driver.toObject(text, xml);
                    }
                    if (data) {
                        this.data._parse(data);
                    } else {
                        return this._onLoadError(text, xml, loader);
                    }
                    //data loaded, view rendered, call onready handler
                    this._call_onready();
                    this.callEvent("onAfterLoad", []);
                    this.waitData.resolve();
                }
                /*
                 Obtain the configuration status of the data grid
                 */

            }, {
                key: "getStateGridData",
                value: function getStateGridData() {
                    var cols_n = this.config.columns.length;
                    var columns = this.config.columns;
                    var settings = {
                        ids: [],
                        size: [],
                        select: this.getSelectedId(true),
                        scroll: this.getScrollState(),
                        sort: this._multisortMap
                    };
                    for (var i = 0; i < cols_n; i++) {
                        settings.ids.push(columns[i].id);
                        settings.size.push(columns[i].width);
                    }
                    if (typeof this.___multisort == 'undefined' || !this.___multisort) {
                        if (this._last_sorted) {
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
                            if (this._hidden_column_hash[key]) {
                                continue;
                            }

                            var f = this._filter_elements[key];
                            f[1].value = filter[key] = f[2].getValue(f[0]);
                            any_filter = 1;
                        }
                        if (any_filter) {
                            settings.filter = filter;
                        }
                    }

                    settings.hidden = [];
                    for (var key in this._hidden_column_hash) {
                        settings.hidden.push(key);
                    }
                    return settings;
                }

                /*
                Do loading collections from the server
                	@currentId: the column ID for which to load the collection
                	@columns: the configuration list columns
                */

            }, {
                key: "doLoadCollectionFromServer",
                value: function doLoadCollectionFromServer(currentId, columns) {
                    webix.ajax().post("server/data/prop", { id: currentId }, function (response) {
                        var obj = JSON.parse(response);
                        var collection = [];
                        collection[collection.length] = { id: "", value: "" };
                        var id;
                        var idIndex;
                        for (var index in webix.ARCHIBUS.data.collection) {
                            for (var indexObj in obj) {
                                var element = obj[indexObj];
                                for (var item in element) {
                                    if (webix.ARCHIBUS.data.collection[index].id == item) {
                                        id = item;
                                        idIndex = index;
                                        break;
                                    }
                                }
                            }
                        }

                        for (var index in obj) {
                            collection[collection.length] = { id: obj[index][id], value: obj[index][id] };
                        }
                        var collectionEdit;
                        for (var index in columns) {
                            if (columns[index].id == id) {
                                var collectionEdit = collection.slice();
                                collectionEdit.splice(0, 1);
                                columns[index].collection = collectionEdit;
                            }
                        }
                        webix.ARCHIBUS.data.collection[idIndex].value = collectionEdit;
                    });
                }

                /*
                 Do update data on the server
                    @data: data for load
                 */

            }, {
                key: "doUpdataData",
                value: function doUpdataData(data) {
                    webix.ajax().post("server/data/save", data, function (response) {
                        webix.message(response.status);
                    });
                }
            }]);

            return DataGridLoad;
        })();

        ;

        module.exports = DataGridLoad;
    }, {}], 6: [function (require, module, exports) {
        var DataGridSort = (function () {
            function DataGridSort() {
                _classCallCheck(this, DataGridSort);
            }
            /*
             Do perform the formation of the object data to sort and display the marker sorting
            @column: column configuration
            @order: the sort order
             */

            _createClass(DataGridSort, [{
                key: "doStartSorting",
                value: function doStartSorting(column, order) {
                    if (typeof this.___multisort != 'undefined' && this.___multisort) {
                        this.doStartMultiSorting(column, order);
                    } else {
                        this.doStartSingSorting(column, order);
                    }
                }
                /*
                 To perform a single sorting
                @column: column configuration
                @order: the sort order
                 */

            }, {
                key: "doStartSingSorting",
                value: function doStartSingSorting(column, order) {
                    if (!this._sort_sign) {
                        this._sort_sign = webix.html.create("DIV");
                    }
                    webix.html.remove(this._sort_sign);

                    if (order) {
                        var cell = this._get_header_cell(this.getColumnIndex(column));
                        if (cell) {
                            this._sort_sign.className = "webix_ss_sort_" + order;
                            cell.style.position = "relative";
                            cell.appendChild(this._sort_sign);
                        }
                        this._last_sorted = column;
                        this._last_order = order;
                    } else {
                        this._last_sorted = this._last_order = null;
                    }
                }
                /*
                 To perform a multi sorting
                @column: column configuration
                @order: the sort order
                 */

            }, {
                key: "doStartMultiSorting",
                value: function doStartMultiSorting(column, order) {
                    if (webix.ARCHIBUS.sort) {
                        if (this._multisortMap.length == 0 && !this._multisort_isDelete) {
                            this._multisortMap[0] = {
                                id: column,
                                dir: order,
                                html: '',
                                onClick: 0
                            };
                            this.doReLabelingSorting(0, column, order, true);
                        } else {
                            var isAdded = true;
                            for (var number in this._multisortMap) {
                                var element = this._multisortMap[number];
                                if (element.id != column) {
                                    this.doReLabelingSorting(number, element.id, element.dir, false);
                                } else {
                                    isAdded = false;
                                    this._multisortMap[number].dir = order;
                                    this._multisortMap[number].onClick++;
                                    this.doReLabelingSorting(number, column, order, true);
                                }
                            }
                            if (isAdded) {
                                this._multisortMap[this._multisortMap.length] = {
                                    id: column,
                                    dir: order,
                                    html: '',
                                    onClick: 0
                                };
                                this.doReLabelingSorting(this._multisortMap.length - 1, column, order, true);
                            } else {
                                this.doRemoveColumn();
                            }
                        }
                    }
                    webix.ARCHIBUS.sort = false;
                }
                /*
                 Do remove a column from sort
                 */

            }, {
                key: "doRemoveColumn",
                value: function doRemoveColumn() {
                    var numberDelete = -1;
                    for (var number in this._multisortMap) {
                        if (this._multisortMap[number].onClick == 2) {
                            numberDelete = number;
                            break;
                        }
                    }
                    if (numberDelete != -1) {
                        var columnIndex = this.getColumnIndex(this._multisortMap[numberDelete].id);

                        var cell = this._get_header_cell(columnIndex);
                        if (cell) {
                            cell.style.backgroundColor = '';
                        }
                        webix.html.remove(this._multisortMap[numberDelete].html);
                        this._multisortMap.splice(numberDelete, 1);
                    }
                }
                /*
                 Do add the <div> element for marking the position of the sorting
                @order: the sort order
                 */

            }, {
                key: "addDivInColumnHeader",
                value: function addDivInColumnHeader(order) {
                    var htmlElement = webix.html.create("DIV");
                    if (order) {
                        htmlElement.className = "webix_ss_sort_" + order;
                    }
                    return htmlElement;
                }
                /*
                 Do add action in the <div> element for marking the position of the sorting
                @index: the index in the data array of multisort
                @column: column configuration
                @order: the sort order
                @isAddLast: clicking on the last element
                 */

            }, {
                key: "doReLabelingSorting",
                value: function doReLabelingSorting(index, column, order, isAddLast) {
                    webix.html.remove(this._multisortMap[index].html);
                    this._multisortMap[index].html = this.addDivInColumnHeader(order);
                    if (order) {
                        var cell = this._get_header_cell(this.getColumnIndex(column));
                        if (cell) {
                            cell.style.position = 'relative';
                            cell.style.backgroundColor = '#61A6F7';
                            cell.appendChild(this._multisortMap[index].html);
                        }
                        if (isAddLast) {
                            this._last_sorted = column;
                            this._last_order = order;
                        }
                    } else {
                        if (isAddLast) {
                            this._last_sorted = this._last_order = null;
                        }
                    }
                }
                /*
                 Event handling clicking on the column header
                @column: column configuration
                 */

            }, {
                key: "eventHandlerHeaderClick",
                value: function eventHandlerHeaderClick(column) {
                    webix.ARCHIBUS.sort = true;
                    var col = this.getColumnConfig(column);
                    if (!col.sort) {
                        return;
                    }

                    var order = 'asc';
                    if (typeof this.___multisort == 'undefined' || !this.___multisort) {
                        if (col.id == this._last_sorted) {
                            order = this._last_order == "asc" ? "desc" : "asc";
                        }
                    } else {
                        for (var number in this._multisortMap) {
                            if (this._multisortMap[number].id == column) {
                                order = this._multisortMap[number].dir == "asc" ? "desc" : "asc";
                                break;
                            }
                        }
                    }
                    this._sort(col.id, order, col.sort);
                }
            }]);

            return DataGridSort;
        })();

        module.exports = DataGridSort;
    }, {}], 7: [function (require, module, exports) {
        require('./custom-actions');

        var DataGridLoad = require('./datagrid-load-data'),
            DataGridSort = require('./datagrid-sort'),
            DataGridEdit = require('./datagrid-edit'),
            DataGridGroups = require('./datagrid-groups'),
            DataGridFilter = require('./datagrid-filter');

        var DataGrid = (function () {
            function DataGrid(config) {
                _classCallCheck(this, DataGrid);

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
                this._dataGridFilter = new DataGridFilter();

                webix.protoUI({
                    name: 'customDataTable',
                    $init: function $init(config) {
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
                if (!webix.env.touch && webix.ui.scrollSize) {
                    webix.CustomScroll.init();
                }
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
                    css: config.style + ' styleLayoutDataGrid',
                    container: config.container,
                    padding: 0,
                    rows: [{
                        type: 'header',
                        css: 'webix_header styleLayoutHeader ' + config.style,
                        template: config.title
                    }, {
                        css: 'styleLayoutFilter',
                        template: '<div id="' + nameFiltering + '"style="height: 100%" "></div>',
                        autoheight: true
                    }, {
                        css: 'styleLayoutDataGrid',
                        template: '<div id="' + nameGrid + '"style="height: 100%" "></div>'
                    }, {
                        css: 'styleLayoutPager',
                        template: '<div id="' + namePaging + '"></div>',
                        autoheight: true
                    }]
                });
                this.dataTable = new webix.ui(this._createGridConfiguration(config));
                this.filterTable = this._dataGridFilter.getFilteringView(config, nameFiltering);
                if (this._isInternetExplorer() == -1) {
                    webix.ARCHIBUS.gridContainer = this.dataTable.getNode().attributes[2].nodeValue;
                    webix.ARCHIBUS.filterContainer = this.filterTable.getNode().attributes[2].nodeValue;
                } else {
                    webix.ARCHIBUS.gridContainer = this.dataTable.getNode().attributes[3].nodeValue;
                    webix.ARCHIBUS.filterContainer = this.filterTable.getNode().attributes[3].nodeValue;
                }
            }

            _createClass(DataGrid, [{
                key: "_isInternetExplorer",
                value: function _isInternetExplorer() {
                    var rv = -1;
                    if (navigator.appName == 'Microsoft Internet Explorer') {
                        var ua = navigator.userAgent;
                        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                        if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
                    } else if (navigator.appName == 'Netscape') {
                        var ua = navigator.userAgent;
                        var re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
                        if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
                    }
                    return rv;
                }
                /*
                 Customize the size the grid view depending on the set values in the config
                 @container: the name container grid
                 @width: the width container grid
                 @height: the height container grid
                 */

            }, {
                key: "_configurationGridSize",
                value: function _configurationGridSize(containerName, width, height) {
                    if (width) {
                        document.getElementById(containerName).style.width = width + "px";
                    } else {
                        document.getElementById(containerName).style.width = "100%";
                    }
                    if (height) {
                        document.getElementById(containerName).style.height = height + "px";
                    } else {
                        document.getElementById(containerName).style.height = "90%";
                    }
                }
                /*
                 To form a configuration for the component webix.ui.treetable
                @config: custom configuration
                 */

            }, {
                key: "_createGridConfiguration",
                value: function _createGridConfiguration(config) {

                    var gridColumns = this._createGridColumns(config),
                        gridAction = this._configureGridActions(config);

                    var gridName = config.container + 'Grid',
                        pagingName = config.container + 'Paging';

                    var gridConfiguration = {
                        container: gridName,
                        view: "customDataTable",
                        css: 'styleDataGrid',
                        columns: gridColumns.columns,
                        pager: {
                            css: 'stylePager',
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
                        footer: true,
                        navigation: true,
                        tooltip: true
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

            }, {
                key: "_configureGridActions",
                value: function _configureGridActions(config) {
                    var customGridEvents = config.events;
                    var gridActions = {
                        onCheck: this._checkCheckbox,
                        onAfterLoad: this._afterLoad,
                        onBeforeRender: this._beforeRender,
                        onAfterRender: this._afterRender,
                        onBeforeSelect: this._beforeSelect,
                        onAfterScroll: this._afterScroll,
                        onColumnResize: this._columnResize,
                        onAfterFilter: this._dataGridFilter.afterFilter
                    };

                    for (var event in customGridEvents) {
                        gridActions[event] = webix.actions[customGridEvents[event]];
                    }
                    if (config.editing) {
                        gridActions['onAfterEditStop'] = this._dataGridEdit.eventAfterEditStop;
                        gridActions['onUpdataData'] = this._dataGridLoad.doUpdataData;
                        gridActions['onRecalculateTotalColumn'] = this._dataGridGroups.recalculateTotalColumn;
                    }
                    gridActions['onStartWith'] = this._startWith;
                    gridActions['onRefreshWidthColumnsFilterTable'] = this._dataGridFilter.refreshWidthColumns;
                    gridActions['onRefreshWidthColumnFilterTable'] = this._dataGridFilter.refreshWidthColumn;
                    gridActions['onSetPositionScrollFilterTable'] = this._dataGridFilter.setPositionSctoll;

                    return gridActions;
                }
                /*
                 To create a configuration list of columns for grid
                 @config: custom configuration
                 */

            }, {
                key: "_createGridColumns",
                value: function _createGridColumns(config) {
                    var ARCHIBUSColumns = config.columns;
                    var gridColumns = [];
                    var webixGroupBy = {};

                    gridColumns[0] = this._configureCheckboxColumn(ARCHIBUSColumns);
                    if (config.editing) {
                        gridColumns[1] = {
                            id: 'edit',
                            header: "",
                            width: 60,
                            template: this._dataGridEdit.renderEditColumn,
                            cssFormat: this._configureColumnClassCss
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
                        gridColumn.renderGroupTotals = this._dataGridGroups.renderGroupTotals;

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

                            webixGroupBy.id = ARCHIBUSColumn.id;
                        }
                        if (ARCHIBUSColumn.showTotals) {
                            var configurationTotalGroup = this._dataGridGroups.configureTotalGroup(webixGroupBy, ARCHIBUSColumn);
                            gridColumn.footer = configurationTotalGroup.footer;
                            webixGroupBy = configurationTotalGroup.header;
                        } else {
                            if (i == ARCHIBUSColumns.length - 1) {
                                gridColumn.footer = [{ text: "", height: 20 }, { text: "", height: 20 }];
                            } else {
                                gridColumn.footer = [{ text: "", height: 20 }, { text: "", height: 20 }];
                            }
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

            }, {
                key: "_configureCheckboxColumn",
                value: function _configureCheckboxColumn(columns) {
                    var configureCheckbox = {
                        id: "checkbox",
                        header: "",
                        width: 40,
                        template: "{common.checkbox()}",
                        cssFormat: this._configureColumnClassCss
                    };

                    var isCalcTotalGroup = false;
                    for (var index in columns) {
                        if (columns[index].showTotals) {
                            isCalcTotalGroup = true;
                            break;
                        }
                    }
                    if (isCalcTotalGroup) {
                        configureCheckbox['footer'] = { text: '<div class="footerTitle"">TOTAL</div>' };
                    }
                    return configureCheckbox;
                }
                /*
                 Customize the header column the grid view depending on the set values in the config
                 @title: the name of the header
                 @dataType: the type column
                 @actions: the actions column
                 */

            }, {
                key: "_configureColumnHeader",
                value: function _configureColumnHeader(title, dataType, actions) {
                    if (actions) {
                        return title;
                    }
                    var filterView;
                    for (var type in this.dataTypeToFilterTypeMapping) {
                        if (type === dataType) {
                            filterView = this.dataTypeToFilterTypeMapping[type];
                        }
                    }
                    return [title];
                }

                /*
                 Customize the column style class to the grid view depending on user actions
                 */

            }, {
                key: "_configureColumnClassCss",
                value: function _configureColumnClassCss(value, obj) {
                    if (obj.checkbox && obj.$group) {
                        return 'rowGroupHeaderSelect';
                    }
                    if (obj.checkbox && !obj.$group) {
                        return 'rowSelect';
                    }
                    if (!obj.checkbox && obj.$group) {
                        return 'rowGroupHeader';
                    }
                    return "";
                }
                /*
                 Customize the style column the grid view depending on the set values in the config
                 @configColumn: the configuration of the current column
                 @customConfigColumn: custom configuration
                 */

            }, {
                key: "_configureColumnStyle",
                value: function _configureColumnStyle(configGridColumn, customConfigColumn) {
                    if (customConfigColumn.cssClass) {
                        configGridColumn.cssFormat = webix.actions[customConfigColumn.cssClass];
                    } else {
                        configGridColumn.cssFormat = this._configureColumnClassCss;
                    }
                    switch (customConfigColumn.dataType) {
                        case 'number':
                            configGridColumn.format = webix.i18n.numberFormat;
                            configGridColumn.css = { "text-align": "right" };
                            break;
                        case 'integer':
                            configGridColumn.css = { "text-align": "right" };
                            break;
                        case 'date':
                            configGridColumn.format = webix.Date.dateToStr(customConfigColumn.dateTimeFormat);
                            configGridColumn.map = "(date)#" + configGridColumn.id + "#";
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

            }, {
                key: "_getLeftSplit",
                value: function _getLeftSplit(columns, id, isEdit) {
                    var leftSplit = 1;
                    if (isEdit) {
                        leftSplit++;
                    }
                    if (id) {
                        leftSplit = 1;
                        for (var index = 0; index < columns.length; index++) {
                            if (columns[index].id == id) {
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

            }, {
                key: "_getRigthSplit",
                value: function _getRigthSplit(columns, id) {
                    var rightSplit = 0;
                    if (id) {
                        rightSplit = 1;
                        for (var index = 0; index < columns.length; index++) {
                            if (columns[index].id == id) {
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

            }, {
                key: "_renderActionButtonsColumn",
                value: function _renderActionButtonsColumn(cellElement, cellInfo) {
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
                                result = result + "<img class='" + button.class + "' src='" + button.icon + "'/>";
                                break;
                            }
                        }
                    }
                    return result;
                }
                /*
                 Do add tooltip to the header cell of the group
                */

            }, {
                key: "_renderTooltip",
                value: function _renderTooltip(rowItem, rowInfo) {
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

            }, {
                key: "_checkCheckbox",
                value: function _checkCheckbox(row, column, value) {
                    this.data.eachChild(row, function (item) {
                        item[column] = value;
                    });
                }
                /*
                 Event occurs each time before the view is rendered
                 */

            }, {
                key: "_beforeRender",
                value: function _beforeRender() {
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

            }, {
                key: "_afterLoad",
                value: function _afterLoad(row, column, value) {
                    this.openAll();
                    this.callEvent('onRefreshWidthColumnsFilterTable', []);
                }
                /*
                 Event occurs each time after the view is rendered
                 */

            }, {
                key: "_afterRender",
                value: function _afterRender() {
                    this.adjust();
                }
                /*
                 Event occurs each time before the selecting item
                 */

            }, {
                key: "_beforeSelect",
                value: function _beforeSelect(data, preserve) {
                    if (this.callEvent("onStartWith", [data.row, "0$"]) || data.column == 'action' || data.column == 'edit' || data.column == 'checkbox') {
                        return false;
                    }
                }
            }, {
                key: "_afterScroll",
                value: function _afterScroll() {
                    var position = this.getScrollState();
                    this.callEvent('onSetPositionScrollFilterTable', [position]);
                }
            }, {
                key: "_columnResize",
                value: function _columnResize(columnId) {
                    this.callEvent('onRefreshWidthColumnFilterTable', [columnId]);
                }
                /*
                 Event to check if the given string with the specified prefix
                 */

            }, {
                key: "_startWith",
                value: function _startWith(string, prefix) {
                    if (typeof string != 'string') {
                        return false;
                    } else {
                        for (var i = 0, length = prefix.length; i < length; i += 1) {
                            var p = prefix[i];
                            var s = string[i];
                            if (p !== s) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
            }]);

            return DataGrid;
        })();

        module.exports = DataGrid;
    }, { "./custom-actions": 1, "./datagrid-edit": 2, "./datagrid-filter": 3, "./datagrid-groups": 4, "./datagrid-load-data": 5, "./datagrid-sort": 6 }], 8: [function (require, module, exports) {
        var DateRangeFilter = (function () {
            function DateRangeFilter() {
                _classCallCheck(this, DateRangeFilter);

                webix.ui({
                    view: 'filterPopup',
                    css: 'styleDataRangeFilter',
                    relative: 'top',
                    id: 'dataRangeFilter',
                    body: {
                        cols: [{
                            view: 'datepicker',
                            css: 'styleMinDateInput',
                            placeholder: 'oldest',
                            on: {
                                onChange: this._changeMinValueFilter
                            }
                        }, {
                            template: 'to',
                            width: 20,
                            css: 'styleString'
                        }, {
                            view: 'datepicker',
                            placeholder: 'newest',
                            css: 'styleMaxDateInput',
                            on: {
                                onChange: this._changeMaxValueFilter
                            }
                        }]
                    }
                });
            }

            _createClass(DateRangeFilter, [{
                key: "_changeMinValueFilter",
                value: function _changeMinValueFilter(newValue, oldValue) {
                    var gridObject = $$(webix.ARCHIBUS.filterContainer);
                    var item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row);
                    if (newValue || newValue == '') {
                        item[webix.ARCHIBUS.currentDisplayFilter.id].value = newValue;
                    }
                    $$(webix.ARCHIBUS.gridContainer).registerFilter(item[webix.ARCHIBUS.currentDisplayFilter.id], { columnId: webix.ARCHIBUS.currentDisplayFilter.id }, {
                        $server: true,
                        getValue: function getValue(node) {
                            var query = '';
                            if (node.value) {
                                query = '{"type": "date", "min": "' + node.value + '"}';
                            }
                            if (node.maxValue) {
                                query = '{"type": "date", "max": "' + node.maxValue + '"}';
                            }
                            if (node.value && node.maxValue) {
                                query = '{"type": "date", "min": "' + node.value + '", "max": "' + node.maxValue + '"}';
                            }
                            return query;
                        }
                    });
                    $$(webix.ARCHIBUS.gridContainer).filterByAll();
                    gridObject.refresh();
                }
            }, {
                key: "_changeMaxValueFilter",
                value: function _changeMaxValueFilter(newValue, oldValue) {
                    var gridObject = $$(webix.ARCHIBUS.filterContainer);
                    var item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row);
                    if (newValue || newValue == '') {
                        item[webix.ARCHIBUS.currentDisplayFilter.id].maxValue = newValue;
                    }
                    $$(webix.ARCHIBUS.gridContainer).registerFilter(item[webix.ARCHIBUS.currentDisplayFilter.id], { columnId: webix.ARCHIBUS.currentDisplayFilter.id }, {
                        $server: true,
                        getValue: function getValue(node) {
                            var query = '';
                            if (node.value) {
                                query = '{"type": "date", "min": "' + node.value + '"}';
                            }
                            if (node.maxValue) {
                                query = '{"type": "date", "max": "' + node.maxValue + '"}';
                            }
                            if (node.value && node.maxValue) {
                                query = '{"type": "date", "min": "' + node.value + '", "max": "' + node.maxValue + '"}';
                            }
                            return query;
                        }
                    });
                    $$(webix.ARCHIBUS.gridContainer).filterByAll();
                    gridObject.refresh();
                }
            }]);

            return DateRangeFilter;
        })();

        module.exports = DateRangeFilter;
    }, {}], 9: [function (require, module, exports) {
        var NumericRangeFilter = (function () {
            function NumericRangeFilter() {
                _classCallCheck(this, NumericRangeFilter);

                webix.editors.numericRange = webix.extend({
                    popupType: 'numericRange',
                    focus: function focus() {
                        var gridObject = $$(webix.ARCHIBUS.filterContainer),
                            item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row),
                            data = item[webix.ARCHIBUS.currentDisplayFilter.id];
                        if (data.value) {
                            this.getInputNode().getChildViews()[2].focus();
                            if (data.value && data.maxValue) {
                                this.getInputNode().getChildViews()[0].focus();
                            }
                        } else {
                            this.getInputNode().getChildViews()[0].focus();
                        }
                    },
                    getValue: function getValue() {
                        var minInput = this.getInputNode().getChildViews()[0].getValue();
                        var maxInput = this.getInputNode().getChildViews()[2].getValue();
                        return { min: minInput || '', max: maxInput || '' };
                    },
                    setValue: function setValue(value) {
                        var displayMinValue = '',
                            displayMaxValue = '';
                        var gridObject = $$(webix.ARCHIBUS.filterContainer),
                            item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row),
                            data = item[webix.ARCHIBUS.currentDisplayFilter.id];
                        if (data.value) {
                            displayMinValue = data.value;
                        }
                        if (data.maxValue) {
                            displayMaxValue = data.maxValue;
                        }
                        this.getPopup().show(this.node);
                        var minInput = this.getInputNode().getChildViews()[0];
                        var maxInput = this.getInputNode().getChildViews()[2];
                        minInput.setValue(displayMinValue);
                        maxInput.setValue(displayMaxValue);
                    },
                    getInputNode: function getInputNode() {
                        return this.getPopup().getChildViews()[0];
                    },
                    popupInit: function popupInit(popup) {
                        popup.getChildViews()[0].attachEvent("onSelect", function (value) {
                            webix.callEvent("onEditEnd", [value]);
                        });
                    }
                }, webix.editors.popup);
            }

            _createClass(NumericRangeFilter, [{
                key: "configuration",
                value: function configuration() {
                    var configurationView = {
                        view: "filterPopup",
                        relative: 'top',
                        id: 'numericRangeView',
                        css: 'styleNumericRangeFilter',
                        body: {
                            cols: [{
                                view: "text",
                                id: 'customFilter',
                                css: 'styleMinInput',
                                placeholder: 'lowest',
                                width: 70,
                                height: 30,
                                tabFocus: true,
                                on: {
                                    onChange: this._changeMinValueFilter,
                                    onKeyPress: function onKeyPress(code, e) {
                                        if (code == 13) {
                                            var newValue = e.currentTarget.activeElement.value;
                                            this.callEvent('onChange', [newValue]);
                                        }
                                    }
                                }
                            }, {
                                template: 'to',
                                width: 20,
                                css: 'styleString'
                            }, {
                                view: "text",
                                id: 'customFilter1',
                                css: 'styleMaxInput',
                                placeholder: 'highest',
                                width: 70,
                                height: 30,
                                tabFocus: true,
                                on: {
                                    onChange: this._changeMaxValueFilter,
                                    onKeyPress: function onKeyPress(code, e) {
                                        if (code == 13) {
                                            var newValue = e.currentTarget.activeElement.value;
                                            this.callEvent('onChange', [newValue]);
                                        }
                                    }
                                }
                            }]
                        }
                    };

                    return {
                        id: 'numericRange',
                        view: configurationView
                    };
                }
            }, {
                key: "_changeMinValueFilter",
                value: function _changeMinValueFilter(newValue, oldValue) {
                    var gridObject = $$(webix.ARCHIBUS.filterContainer),
                        item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row),
                        data = item[webix.ARCHIBUS.currentDisplayFilter.id];

                    if (newValue || newValue == '') {
                        data.value = newValue;
                        $$(webix.ARCHIBUS.gridContainer).registerFilter(item[webix.ARCHIBUS.currentDisplayFilter.id], { columnId: webix.ARCHIBUS.currentDisplayFilter.id }, {
                            $server: true,
                            getValue: function getValue(node) {
                                var query = '';
                                if (node.value) {
                                    query = '{"type": "number", "min": "' + node.value + '"}';
                                }
                                if (node.maxValue) {
                                    query = '{"type": "number", "max": "' + node.maxValue + '"}';
                                }
                                if (node.value && node.maxValue) {
                                    query = '{"type": "number", "min": "' + node.value + '", "max": "' + node.maxValue + '"}';
                                }
                                return query;
                            }
                        });
                        $$(webix.ARCHIBUS.gridContainer).filterByAll();
                        gridObject.refresh();
                    }
                }
            }, {
                key: "_changeMaxValueFilter",
                value: function _changeMaxValueFilter(newValue, oldValue) {
                    var gridObject = $$(webix.ARCHIBUS.filterContainer),
                        item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row),
                        data = item[webix.ARCHIBUS.currentDisplayFilter.id];

                    if (newValue || newValue == '') {
                        data.maxValue = newValue;
                        $$(webix.ARCHIBUS.gridContainer).registerFilter(item[webix.ARCHIBUS.currentDisplayFilter.id], { columnId: webix.ARCHIBUS.currentDisplayFilter.id }, {
                            $server: true,
                            getValue: function getValue(node) {
                                var query = '';
                                if (node.value) {
                                    query = '{"type": "number", "min": "' + node.value + '"}';
                                }
                                if (node.maxValue) {
                                    query = '{"type": "number", "max": "' + node.maxValue + '"}';
                                }
                                if (node.value && node.maxValue) {
                                    query = '{"type": "number", "min": "' + node.value + '", "max": "' + node.maxValue + '"}';
                                }
                                return query;
                            }
                        });
                        $$(webix.ARCHIBUS.gridContainer).filterByAll();
                        gridObject.refresh();
                    }
                }
            }]);

            return NumericRangeFilter;
        })();

        module.exports = NumericRangeFilter;
    }, {}], 10: [function (require, module, exports) {
        var SelectFilter = (function () {
            function SelectFilter() {
                _classCallCheck(this, SelectFilter);

                webix.editors.customSelect = webix.extend({
                    popupType: "customSelect",
                    focus: function focus() {
                        this.getInputNode(this.node).focus();
                    },
                    getValue: function getValue() {
                        return this.getInputNode().getValue() || "";
                    },
                    setValue: function setValue(value) {
                        var displayValue = '';
                        var gridObject = $$(webix.ARCHIBUS.filterContainer);
                        var item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row);
                        if (item[webix.ARCHIBUS.currentDisplayFilter.id].value) {
                            displayValue = item[webix.ARCHIBUS.currentDisplayFilter.id].value;
                        }
                        this.getPopup().show(this.node);
                        this.getInputNode().setValue(displayValue);
                    },
                    getInputNode: function getInputNode() {
                        return this.getPopup().getChildViews()[0];
                    }

                }, webix.editors.popup);
            }

            _createClass(SelectFilter, [{
                key: "configuration",
                value: function configuration() {
                    var configurationView = {
                        view: "filterPopup",
                        relative: 'top',
                        css: 'styleSelectFilter',
                        on: {
                            onShow: this._show
                        },
                        body: {
                            view: "combo",
                            id: 'customCombo',
                            css: 'styleSelectList',
                            width: 100,
                            value: 1,
                            options: [],
                            on: {
                                onChange: this._changeFilter,
                                onBeforeRender: function onBeforeRender() {
                                    var optionsView = $$('customCombo').config.options;
                                    webix.html.addCss($$(optionsView).$view, "styleSelectOptions");
                                }
                            }
                        }
                    };

                    return {
                        id: 'customSelect',
                        view: configurationView
                    };
                }
            }, {
                key: "_changeFilter",
                value: function _changeFilter(newValue, oldValue) {
                    newValue = this.getText();
                    var gridObject = $$(webix.ARCHIBUS.filterContainer),
                        item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row),
                        data = item[webix.ARCHIBUS.currentDisplayFilter.id];

                    if (newValue && data.value != newValue) {
                        data.value = newValue;
                        $$(webix.ARCHIBUS.gridContainer).registerFilter(newValue, { columnId: webix.ARCHIBUS.currentDisplayFilter.id }, {
                            $server: true,
                            getValue: function getValue(node) {
                                return '{"type": "text", "value": "' + node + '"}';
                            }
                        });
                        $$(webix.ARCHIBUS.gridContainer).filterByAll();
                        gridObject.refresh();
                    }
                }
            }, {
                key: "_show",
                value: function _show() {
                    $$('customCombo').getList().clearAll();
                    var options;
                    for (var index in webix.ARCHIBUS.data.collection) {
                        if (webix.ARCHIBUS.data.collection[index].id == webix.ARCHIBUS.currentDisplayFilter.id) {
                            options = webix.ARCHIBUS.data.collection[index].value;
                            break;
                        }
                    }
                    for (var index in options) {
                        $$('customCombo').getList().add(options[index]);
                    }
                }
            }]);

            return SelectFilter;
        })();

        module.exports = SelectFilter;
    }, {}], 11: [function (require, module, exports) {
        var TextFilter = (function () {
            function TextFilter() {
                _classCallCheck(this, TextFilter);

                webix.editors.customText = webix.extend({
                    focus: function focus() {
                        this.getInputNode(this.node).focus();
                    },
                    popupType: 'customText',
                    getValue: function getValue() {
                        return this.getInputNode().getValue() || "";
                    },
                    setValue: function setValue() {
                        var displayValue = '';
                        var gridObject = $$(webix.ARCHIBUS.filterContainer);
                        var item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row);
                        if (item[webix.ARCHIBUS.currentDisplayFilter.id].value) {
                            displayValue = item[webix.ARCHIBUS.currentDisplayFilter.id].value;
                        }
                        this.getPopup().show(this.node);
                        this.getInputNode().setValue(displayValue);
                    },
                    getInputNode: function getInputNode() {
                        return this.getPopup().getChildViews()[0];
                    },
                    popupInit: function popupInit(popup) {
                        popup.getChildViews()[0].attachEvent("onSelect", function (value) {
                            webix.callEvent("onEditEnd", [value]);
                        });
                    }
                }, webix.editors.popup);
            }

            _createClass(TextFilter, [{
                key: "configuration",
                value: function configuration() {
                    var configurationView = {
                        view: "filterPopup",
                        relative: 'top',
                        css: 'styleTextFilter',
                        body: {
                            view: "text",
                            width: 100,
                            height: 30,
                            css: 'styleTextInput',
                            on: {
                                onChange: this._changeFilter,
                                onKeyPress: function onKeyPress(code, e) {
                                    if (code == 13) {
                                        var newValue = e.currentTarget.activeElement.value;
                                        this.callEvent('onChange', [newValue]);
                                    }
                                }
                            }
                        }
                    };
                    return {
                        id: 'customText',
                        view: configurationView
                    };
                }
            }, {
                key: "_changeFilter",
                value: function _changeFilter(newValue, oldValue) {
                    var gridObject = $$(webix.ARCHIBUS.filterContainer),
                        item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row),
                        data = item[webix.ARCHIBUS.currentDisplayFilter.id];
                    if (newValue) {
                        $$(webix.ARCHIBUS.gridContainer).registerFilter(newValue, { columnId: webix.ARCHIBUS.currentDisplayFilter.id }, {
                            $server: true,
                            getValue: function getValue(node) {
                                var result = '{"type": "text", "value": "' + node + '"';
                                var pattern = "%";
                                var isAddStyle = true;

                                for (var i = 0, length = pattern.length; i < length; i += 1) {
                                    var p = pattern[i];
                                    var s = node[i];
                                    if (p !== s) {
                                        isAddStyle = false;
                                        break;
                                    }
                                }

                                if (node[node.length - 1] == pattern) {
                                    result = '{"type": "text", "value": "' + node.substr(0, node.length - 1) + '", "start": "true"';
                                }

                                if (isAddStyle) {
                                    result = '{"type": "text", "value": "' + node.substr(1) + '", "end": "true"';
                                }
                                result += '}';
                                return result;
                            }
                        });
                        $$(webix.ARCHIBUS.gridContainer).filterByAll();
                        gridObject.refresh();
                    }
                }
            }]);

            return TextFilter;
        })();

        module.exports = TextFilter;
    }, {}], 12: [function (require, module, exports) {
        var buttonsMetadata = [{
            icon: 'style/icons/edit.jpg',
            class: 'editclasss',
            function: 'buttonClick1',
            condition: [{
                column: 'AssetType',
                value: 'bl'
            }]
        }, {
            icon: 'style/icons/cansel.jpg',
            class: 'deleteclass',
            function: 'buttonClick2',
            condition: [{
                column: 'AssetType',
                value: 'bl'
            }]
        }, {
            icon: 'style/icons/add.jpg',
            class: 'addclass',
            function: 'buttonClick3',
            condition: [{
                column: 'AssetType',
                value: 'bl'
            }, {
                column: 'AssetType',
                value: 'eq'
            }]
        }, {
            icon: 'style/icons/info.jpg',
            class: 'infoclass',
            function: 'buttonClick4',
            condition: [{
                column: 'AssetType',
                value: 'bl'
            }]
        }];

        module.exports = buttonsMetadata;
    }, {}], 13: [function (require, module, exports) {
        var classStyle = {
            CountryCode: [{
                cellText: 'USA',
                classStyle: 'usa'
            }, {
                cellText: 'ARG',
                classStyle: 'arg'
            }, {
                cellText: 'MEX',
                classStyle: 'mex'
            }, {
                cellText: 'BRA',
                classStyle: 'bra'
            }, {
                cellText: 'CAN',
                classStyle: 'can'
            }]
        };

        module.exports = classStyle;
    }, {}], 14: [function (require, module, exports) {
        var buttonMetadata = require('./sample-buttons-metadata');

        var ARCHIBUSColumns = [{
            id: 'AssetType',
            title: 'Asset Type',
            groupBy: true,
            sortBy: 'asc', // or 'desc'
            dataType: 'enum'
        }, {
            id: 'cost_purchase',
            title: 'Purchase Cost',
            dataType: 'number',
            showTotals: true
        }, {
            id: 'quantity_mtbf',
            title: 'Mean Time Between Failures',
            dataType: 'integer',
            showTotals: true
        }, {
            id: 'AssetStatus',
            title: 'Asset Status',
            dataType: 'enum'
        }, {
            id: 'TitleDescription',
            title: 'Title Description',
            dataType: 'text'
        }, {
            id: 'GeoRegionID',
            title: 'Geo-RegionID',
            dataType: 'text'
        }, {
            id: 'CountryCode',
            title: 'Country Code',
            cssClass: 'cssClassCountryCode',
            dataType: 'enum'
        }, {
            id: 'StateCode',
            title: 'State Code',
            dataType: 'text'
        }, {
            id: 'CityCode',
            title: 'City Code',
            dataType: 'text'
        }, {
            id: 'SiteCode',
            title: 'Site Code',
            dataType: 'text'
        }, {
            id: 'Date',
            title: 'Date',
            dataType: 'date',
            dateTimeFormat: '%m/%d/%y'
        }, {
            id: 'BuildingCode',
            title: 'Building Code',
            dataType: 'text'
        }, {
            id: 'FloorCode',
            title: 'Floor Code',
            dataType: 'text'
        }, {
            id: 'RoomCode',
            title: 'Room Code',
            dataType: 'text'
        }, {
            id: 'BusinessUnit',
            title: 'Business Unit',
            dataType: 'text'
        }, {
            id: 'DivisionCode',
            title: 'Division Code',
            dataType: 'text'
        }, {
            id: 'DepartmentCode',
            title: 'Department Code',
            dataType: 'text'
        }, {
            id: 'action',
            title: 'Action',
            width: 100,
            action: buttonMetadata
        }];

        module.exports = ARCHIBUSColumns;
    }, { "./sample-buttons-metadata": 12 }], 15: [function (require, module, exports) {
        var DataGrid = require('./data-grid/datagrid');
        var columnsMetadata = require('./data-grid/metadata/sample-columns-metadata');

        webix.ready(function () {
            var dataGrid = new DataGrid({
                id: 'projectsGrid',
                container: 'projectsGridContainer',
                style: 'flat',
                title: 'Asset List',
                columns: columnsMetadata,
                sortFields: [],
                dataSource: 'server/data',
                //width: 700,
                // height: 700,
                pageSize: 100,
                events: {
                    onSelectChange: 'selectValue',
                    onItemClick: 'clickCell'
                },
                editing: true,
                firstRightFixedColumn: 'Action',
                lastLeftFixedColumn: 'quantity_mtbf'
            });
            resize([dataGrid]);
        });

        function resize(objects) {
            for (var number in objects) {
                webix.event(window, "resize", function (event) {
                    objects[number].view.adjust();
                    objects[number].dataTable.adjust();
                    objects[number].filterTable.adjust();
                });
            }
        }
    }, { "./data-grid/datagrid": 7, "./data-grid/metadata/sample-columns-metadata": 14 }] }, {}, [15]);