"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _typeof(obj) { return obj && obj.constructor === Symbol ? "symbol" : typeof obj; }

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
                if (cellInfo.ch1 && cellInfo.$group) {
                    return 'rowGroupHeaderSelect';
                }
                if (cellInfo.ch1 && !cellInfo.$group) {
                    return 'rowSelect';
                }
                if (!cellInfo.ch1 && cellInfo.$group) {
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
    }, { "./metadata/sample-cell-style-metadata": 8 }], 2: [function (require, module, exports) {
        /*
        The class responsible for editing
        */

        var DataGridEdit = (function () {
            function DataGridEdit() {
                _classCallCheck(this, DataGridEdit);

                webix.UIManager.tabControl = true;
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
                                configCurrentColumn.editor = 'text';
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
                                webix.ARCHIBUS.data.collection[webix.ARCHIBUS.data.collection.length] = configCurrentColumn.id;
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
                        var cellCheckbox = gridObject.getItemNode({ row: cellElement.id, column: 'ch1' });
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
    }, {}], 4: [function (require, module, exports) {
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
                                    finalurl += "&filter[" + key + "]=" + state.filter[key];
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
                        for (var index in webix.ARCHIBUS.data.collection) {
                            for (var indexObj in obj) {
                                var element = obj[indexObj];
                                for (var item in element) {
                                    if (webix.ARCHIBUS.data.collection[index] == item) {
                                        id = item;
                                        break;
                                    }
                                }
                            }
                        }

                        for (var index in obj) {
                            collection[collection.length] = { id: obj[index][id], value: obj[index][id] };
                        }

                        for (var index in columns) {
                            if (columns[index].id == id) {
                                var collectionHeader = collection.slice();
                                var collectionEdit = collection.slice();
                                collectionEdit.splice(0, 1);
                                columns[index].collection = collectionEdit;
                                columns[index].header[0].options = collectionHeader;
                            }
                        }
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
    }, {}], 5: [function (require, module, exports) {
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
                                this._multisortMap[number].numberInQuery = 1;
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
    }, {}], 6: [function (require, module, exports) {
        require('./custom-actions');

        var DataGridLoad = require('./datagrid-load-data'),
            DataGridSort = require('./datagrid-sort'),
            DataGridEdit = require('./datagrid-edit'),
            DataGridGroups = require('./datagrid-groups');

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
                if (!webix.env.touch && webix.ui.scrollSize) webix.CustomScroll.init();
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
                    rows: [{
                        type: 'header',
                        css: 'webix_header ' + config.style,
                        template: config.title
                    }, {
                        css: 'layoutFilter',
                        template: '<div id="' + nameFiltering + '"style="height: 100%" "></div>',
                        autoheight: true
                    }, {
                        template: '<div id="' + nameGrid + '"style="height: 100%" "></div>'
                    }, {
                        template: '<div id="' + namePaging + '"></div>',
                        autoheight: true
                    }]
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

            _createClass(DataGrid, [{
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
                            cssFormat: this.cssFormat
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
                            gridColumn.footer = [{ text: "", height: 20 }, { text: "", height: 20 }];
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
                        id: "ch1",
                        header: "",
                        width: 40,
                        template: "{common.checkbox()}",
                        cssFormat: this.cssFormat
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
            }, {
                key: "cssFormat",
                value: function cssFormat(value, obj) {
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

            }, {
                key: "_configureColumnStyle",
                value: function _configureColumnStyle(configGridColumn, customConfigColumn) {
                    if (customConfigColumn.cssClass) {
                        configGridColumn.cssFormat = webix.actions[customConfigColumn.cssClass];
                    } else {
                        configGridColumn.cssFormat = this.cssFormat;
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
                key: "_eventCheckCheckbox",
                value: function _eventCheckCheckbox(row, column, value) {
                    this.data.eachChild(row, function (item) {
                        item[column] = value;
                    });
                }
                /*
                 Event occurs each time before the view is rendered
                 */

            }, {
                key: "_eventBeforeRender",
                value: function _eventBeforeRender() {
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
                key: "_eventAfterLoad",
                value: function _eventAfterLoad(row, column, value) {
                    this.openAll();
                }
                /*
                 Event occurs each time after the view is rendered
                 */

            }, {
                key: "_eventAfterRender",
                value: function _eventAfterRender() {
                    this.adjust();
                }
            }]);

            return DataGrid;
        })();

        module.exports = DataGrid;
    }, { "./custom-actions": 1, "./datagrid-edit": 2, "./datagrid-groups": 3, "./datagrid-load-data": 4, "./datagrid-sort": 5 }], 7: [function (require, module, exports) {
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
    }, {}], 8: [function (require, module, exports) {
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
    }, {}], 9: [function (require, module, exports) {
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
            id: 'Date',
            title: 'Date',
            dataType: 'date',
            dateTimeFormat: '%m/%d/%y'
        }, {
            title: 'Action',
            width: 100,
            action: buttonMetadata
        }];

        module.exports = ARCHIBUSColumns;
    }, { "./sample-buttons-metadata": 7 }], 10: [function (require, module, exports) {
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
                });
            }
        }
    }, { "./data-grid/datagrid": 6, "./data-grid/metadata/sample-columns-metadata": 9 }] }, {}, [10]);