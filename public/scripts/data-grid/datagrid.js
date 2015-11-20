"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _typeof(obj) { return obj && obj.constructor === Symbol ? "symbol" : typeof obj; }

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
        /*
         Map of events used in the grid user
         */
        webix.actions = {
            selectValue: function selectValue() {
                var id = this.getSelectedId(true);
                if (id.length != 0) {
                    var text = this.getItem(id)[id[0].column];
                    webix.message(text);
                }
            },
            buttonClick1: function buttonClick1() {
                webix.message('You click button 1');
            },
            buttonClick2: function buttonClick2() {
                webix.message('You click button 2');
            },
            buttonClick3: function buttonClick3() {
                webix.message('You click button 3');
            },
            buttonClick4: function buttonClick4() {
                webix.message('You click button 4');
            },
            cssClassCountryCode: function cssClassCountryCode(container, cellInfo, t, y) {
                if (cellInfo.ch1 && !cellInfo.$group) return "row-marked";
                var currentEnumStyle = classStyle[y];
                for (var element in currentEnumStyle) {
                    if (container == currentEnumStyle[element].cellText) {
                        return currentEnumStyle[element].classStyle;
                    }
                }
            },
            totalGroup: function totalGroup(obj, common, a, v, d, f) {
                var result = "";
                if (obj.$group) {
                    var count = obj.$count;

                    result = common.treetable(obj, common) + " " + obj.id + ": " + obj.value + " ( " + count + " assets )";
                    /*var freeItems = webix.pageSize - currentNumber;
                    if(obj.open)
                        if(freeItems < obj.$count )
                            result += " (Continues on the next page)";*/
                    result += "<span>";
                    for (var i in webix.groupTotalLine) {
                        if (webix.groupTotalLine[i].type == 'number') {
                            result += webix.groupTotalLine[i].title + ": " + webix.i18n.numberFormat(obj[webix.groupTotalLine[i].id + "Sum"]) + " ";
                        } else result += webix.groupTotalLine[i].title + ": " + obj[webix.groupTotalLine[i].id + "Sum"] + "      ";
                    }
                    result += "</span>";
                }
                return result;
            }
        };
    }, { "./metadata/sample-cell-style-metadata": 5 }], 2: [function (require, module, exports) {
        /*
         Load data from the response received
         */
        webix.TreeDataLoader._loadNextA = function (count, start, callback, url, now) {
            var config = this._settings;
            if (config.datathrottle && !now) {
                if (this._throttle_request) window.clearTimeout(this._throttle_request);
                this._throttle_request = webix.delay(function () {
                    this.loadNext(count, start, callback, url, true);
                }, this, 0, config.datathrottle);
                return;
            }

            if (!start && start !== 0) start = this.count();
            if (!count) count = config.datafetch || this.count();

            this.data.url = this.data.url || url;
            if (this.callEvent("onDataRequest", [start, count, callback, url]) && this.data.url) this.data.feed.call(this, start, count, callback);
        };

        /*
         Create form the flow of the request
         */
        webix.TreeDataLoader._feed_commonA = function (from, count, callback) {
            var url = this.data.url;
            if (from < 0) from = 0;
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
                if (count != -1) finalurl += "&count=" + count;
                if (from) finalurl += "&start=" + from;

                if (this.getState) {
                    var state = this.getState();
                    if (state.sort) {
                        if (typeof this.___multisort != 'undefined' && this.___multisort) {
                            for (var key in state.sort) finalurl += "&sort[" + state.sort[key].id + "]=" + state.sort[key].dir;
                        } else {
                            finalurl += "&sort[" + state.sort.id + "]=" + state.sort.dir;
                        }
                    }

                    if (state.filter) for (var key in state.filter) finalurl += "&filter[" + key + "]=" + state.filter[key];
                }
                this.load(finalurl, final_callback);
            }
        };

        /*
         Data loading
         */
        webix.TreeDataLoader._feed_callback = function () {
            //after loading check if we have some ignored requests
            var temp = this._load_count;
            var last = this._feed_last;
            this._load_count = false;
            if ((typeof temp === "undefined" ? "undefined" : _typeof(temp)) == "object" && (temp[0] != last[0] || temp[1] != last[1])) this.data.feed.apply(this, temp); //load last ignored request
        };

        webix.TreeDataLoader.load = function (url, call) {
            var ajax = webix.AtomDataLoader.load.apply(this, arguments);

            //prepare data feed for dyn. loading
            if (!this.data.url) this.data.url = url;

            return ajax;
        };

        webix.DataState = {
            getState: function getState() {
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
                        if (this._hidden_column_hash[key]) continue;

                        var f = this._filter_elements[key];
                        f[1].value = filter[key] = f[2].getValue(f[0]);
                        any_filter = 1;
                    }
                    if (any_filter) settings.filter = filter;
                }

                settings.hidden = [];
                for (var key in this._hidden_column_hash) settings.hidden.push(key);

                return settings;
            }
        };

        webix.AtomDataLoader.url_setter = function (value) {
            if (typeof value == "string" && value.indexOf("->") != -1) {
                var parts = value.split("->");
                value = webix.proxy(parts[0], parts[1]);
            }

            if (!this._ready_for_data) return value;
            this.load(value, this._settings.datatype);
            return value;
        };
    }, {}], 3: [function (require, module, exports) {
        require('./custom-actions');
        require('./custom-filter-sort');
        var columnsMetadata = require('./metadata/sample-columns-metadata');

        webix.ready(function () {
            var dataGrid = new DataGrid({
                id: 'projectsGrid',
                container: 'projectsGridContainer',
                columns: columnsMetadata,
                sortFields: [],
                dataSource: 'server/data',
                //width: 700,
                // height: 700,
                pageSize: 100,
                events: {
                    onSelectChange: 'selectValue'
                }
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

        webix.protoUI({
            name: 'customDataTable',
            $init: function $init(config) {
                this.___multisort = config.multisort;
                this._multisort_isDelete = false;
                this._multisort_count = 0;
                if (this.___multisort) {
                    this._multisortMap = [];
                }
            },
            _on_header_click: function _on_header_click(column) {
                var col = this.getColumnConfig(column);
                if (!col.sort) return;

                var order = 'asc';
                if (typeof this.___multisort == 'undefined' || !this.___multisort) {
                    if (col.id == this._last_sorted) order = this._last_order == "asc" ? "desc" : "asc";
                } else {
                    for (var number in this._multisortMap) {
                        if (this._multisortMap[number].id == column) {
                            order = this._multisortMap[number].dir == "asc" ? "desc" : "asc";
                            break;
                        }
                    }
                }
                this._sort(col.id, order, col.sort);
            },
            markSorting: function markSorting(column, order) {
                if (typeof this.___multisort != 'undefined' && this.___multisort) {
                    this.markMultiSorting(column, order);
                } else {
                    this.markSingSorting(column, order);
                }
            },
            markSingSorting: function markSingSorting(column, order) {
                if (!this._sort_sign) this._sort_sign = webix.html.create("DIV");
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
            },
            markMultiSorting: function markMultiSorting(column, order) {

                if (this._multisortMap.length == 0 && !this._multisort_isDelete) {
                    this._multisortMap[0] = {
                        id: column,
                        dir: order,
                        html: '',
                        onClick: 0,
                        numberInQuery: 1
                    };
                    this.createMarkSorting(0, column, order, true);
                } else {
                    if (this._multisort_isDelete) {
                        if (this._multisort_count == 1) {
                            this._multisort_count = 0;
                            this._multisort_isDelete = false;
                            this._last_order = '';
                            for (var number in this._multisortMap) this.createMarkSorting(number, this._multisortMap[number].id, this._multisortMap[number].dir, false);
                        } else {
                            this._multisort_count++;
                        }
                    } else {
                        var isAdded = true;
                        for (var number in this._multisortMap) {
                            var element = this._multisortMap[number];
                            if (element.id != column) {
                                this.createMarkSorting(number, element.id, element.dir, false);
                            } else {
                                isAdded = false;
                                this._multisortMap[number].dir = order;
                                this._multisortMap[number].onClick++;
                                this._multisortMap[number].numberInQuery = 1;
                                this.createMarkSorting(number, column, order, true);
                            }
                        }
                        if (isAdded) {
                            this._multisortMap[this._multisortMap.length] = {
                                id: column,
                                dir: order,
                                html: '',
                                onClick: 0
                            };
                            this.createMarkSorting(this._multisortMap.length - 1, column, order, true);
                        } else {
                            var numberDelete = -1;
                            for (var number in this._multisortMap) {
                                if (this._multisortMap[number].onClick == 6) {
                                    numberDelete = number;
                                    break;
                                }
                            }
                            if (numberDelete != -1) {
                                //webix.html.remove(this._multisortMap[numberDelete].html);
                                this._multisortMap.splice(numberDelete, 1);
                                this._multisort_isDelete = true;
                            }
                        }
                    }
                }
            },
            createHtmlMarkSotring: function createHtmlMarkSotring(order) {
                var htmlElement = webix.html.create("DIV");
                if (order) {
                    htmlElement.className = "webix_ss_sort_" + order;
                }
                return htmlElement;
            },
            createMarkSorting: function createMarkSorting(index, column, order, isAddLast) {
                webix.html.remove(this._multisortMap[index].html);
                this._multisortMap[index].html = this.createHtmlMarkSotring(order);
                if (order) {
                    var cell = this._get_header_cell(this.getColumnIndex(column));
                    if (cell) {
                        cell.style.position = "relative";
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
            },
            _sort: function _sort(col_id, direction, type) {
                direction = direction || "asc";
                this.markSorting(col_id, direction);
                if (type == "server") {
                    this.loadNext(-1, 0, {
                        "before": function before() {
                            var url = this.data.url;
                            this.clearAll();
                            this.data.url = url;
                        }
                    }, 0, 1);
                } else {
                    if (type == "text") {
                        this.data.each(function (obj) {
                            obj.$text = this.getText(obj.id, col_id);
                        }, this);
                        type = "string";col_id = "$text";
                    }

                    if (typeof type == "function") this.data.sort(type, direction);else this.data.sort(col_id, direction, type || "string");
                }
            },
            mapGroupsCells: function mapGroupsCells(startrow, startcol, numrows, numcols, callback) {
                if (startrow === null && this.data.order.length > 0) startrow = this.data.order[0];
                if (startcol === null) startcol = this.columnId(0);
                if (numrows === null) numrows = this.data.order.length;
                if (numcols === null) numcols = this._settings.columns.length;

                if (!this.exists(startrow)) return;
                startrow = this.getIndexById(startrow);
                startcol = this.getColumnIndex(startcol);
                if (startcol === null) return;

                for (var i = 0; i < numrows && startrow + i < this.data.order.length; i++) {
                    var row_ind = startrow + i;
                    var row_id = this.data.order[row_ind];
                    var item = this.getItem(row_id);
                    var col_id = this.columnId(numcols);
                    for (var j = 0; j < numcols && startcol + j < this._settings.columns.length; j++) {
                        var col_ind = startcol + j;
                        var col_id = this.columnId(col_ind);
                        var flag = true;
                        for (var num_mas in webix.groupTotalLine) {
                            if (col_id == webix.groupTotalLine[num_mas].id) {
                                callback(item[webix.groupTotalLine[num_mas].id + "Sum"]);
                                flag = false;
                            }
                        }
                        if (flag) {
                            item[col_id] = callback(item[col_id], row_id, col_id, i, j);
                        }
                    }
                }
            }
        }, webix.ui.treetable);

        var DataGrid = (function () {
            function DataGrid(config) {
                _classCallCheck(this, DataGrid);

                this.id = config.id;
                this.dataTypeToFilterTypeMapping = {
                    text: 'serverFilter',
                    date: 'serverFilter',
                    time: 'serverFilter',
                    number: 'serverFilter',
                    integer: 'serverFilter'
                };
                webix.pageSize = config.pageSize;
                var webixColumns = this.createWebixColumns(config.columns);
                var webixActionsGrid = this.configurationActionsGrid(config.events);
                this.configurationSizeGrid(config.container, config.width, config.height);

                var nameGrid = config.container + 'Grid';
                var namePaging = config.container + 'Paging';

                this.view = new webix.ui({
                    container: config.container,
                    rows: [{
                        template: '<div id="' + nameGrid + '"style="height: 100%" "></div>'
                    }, {
                        template: '<div id="' + namePaging + '"></div>',
                        autoheight: true
                    }]
                });

                var configGrid = this.confiturationGrid(config);
                this.dataTable = new webix.ui(configGrid);
            }

            _createClass(DataGrid, [{
                key: "confiturationGrid",
                value: function confiturationGrid(config) {
                    var webixColumns = this.createWebixColumns(config.columns);
                    var webixActionsGrid = this.configurationActionsGrid(config.events);

                    var nameGrid = config.container + 'Grid';
                    var namePaging = config.container + 'Paging';

                    var configGrid = {
                        container: nameGrid,
                        view: "customDataTable",
                        columns: webixColumns.columns,
                        leftSplit: 1,
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
                        spans: true,
                        checkboxRefresh: true,
                        on: webixActionsGrid,
                        url: config.dataSource,
                        footer: true
                    };

                    var configGroup = {
                        $group: {}
                    };

                    if (this.existsField(webixColumns.group.id)) {
                        configGroup.$group.by = webixColumns.group.id;
                        configGrid.scheme = configGroup;
                    }
                    if (this.existsField(webixColumns.group.footer)) {
                        configGroup.$group.map = {};
                        webix.groupTotalLine = webixColumns.group.footer;
                        for (var i in webix.groupTotalLine) {
                            configGroup.$group.map[webix.groupTotalLine[i].id + 'Sum'] = [webix.groupTotalLine[i].id, 'sum'];
                        }
                        configGroup.$group.row = webixColumns.group.id;
                        configGrid.scheme = configGroup;
                    }

                    return configGrid;
                }
            }, {
                key: "configurationSizeGrid",
                value: function configurationSizeGrid(container, width, height) {
                    if (typeof width != 'undefined') {
                        document.getElementById(container).style.width = width + "px";
                    } else {
                        document.getElementById(container).style.width = "100%";
                    }
                    if (typeof height != 'undefined') {
                        document.getElementById(container).style.height = height + "px";
                    } else {
                        document.getElementById(container).style.height = "90%";
                    }
                }
            }, {
                key: "configurationActionsGrid",
                value: function configurationActionsGrid(events) {
                    var webixActionsGrid = {
                        onCheck: function onCheck(row, column, value) {
                            this.data.eachChild(row, function (item) {
                                item[column] = value;
                            });
                        },
                        onAfterLoad: function onAfterLoad(row, column, value) {
                            this.openAll();
                        },
                        onBeforeRender: function onBeforeRender() {
                            for (var key in webix.buttonsMap) {
                                var button = webix.buttonsMap[key];
                                this.on_click[button.class] = webix.actions[button.function];
                            }
                        },
                        onAfterRender: function onAfterRender() {
                            this.adjust();
                        }
                    };
                    for (var event in events) {
                        webixActionsGrid[event] = webix.actions[events[event]];
                    }
                    return webixActionsGrid;
                }
            }, {
                key: "renderGroup",
                value: function renderGroup(obj, common, value, b, currentNumber) {
                    if (obj.$group) {
                        var count = obj.$count;
                        var result = common.treetable(obj, common) + " " + this.id + ": " + obj.value + " ( " + count + " assets )";
                        var freeItems = webix.pageSize - currentNumber;
                        if (obj.open) if (freeItems < obj.$count) result += " (Continues on the next page)";
                        if (typeof webix.groupTotalLine != 'undefined') {
                            result += '<span style="float: right;">';
                            for (var i in webix.groupTotalLine) {
                                if (webix.groupTotalLine[i].type == 'number') {
                                    result += webix.groupTotalLine[i].title + ": " + webix.i18n.numberFormat(obj[webix.groupTotalLine[i].id + "Sum"]) + " ";
                                } else result += webix.groupTotalLine[i].title + ": " + obj[webix.groupTotalLine[i].id + "Sum"] + "      ";
                            }
                            result += "</span>";
                        }

                        return result;
                    }

                    return value;
                }
            }, {
                key: "renderButton",
                value: function renderButton(cellElement, cellInfo) {
                    if (cellElement.$group) {
                        return ' ';
                    }
                    var result = "";
                    for (var number in webix.buttonsMap) {
                        var button = webix.buttonsMap[number];
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
            }, {
                key: "createWebixColumns",
                value: function createWebixColumns(ARCHIBUSColumns) {
                    var webixColumns = [];
                    var webixGroupBy = {};

                    webixColumns[0] = {
                        id: "ch1",
                        header: "",
                        width: 40,
                        template: "{common.checkbox()}",
                        footer: { text: "Total:" }
                    };
                    var index = 1;
                    for (var numberColumn in ARCHIBUSColumns) {
                        var ARCHIBUSColumn = ARCHIBUSColumns[numberColumn];
                        var webixColumn = {};
                        if (this.existsField(ARCHIBUSColumn.id)) {
                            webixColumn.id = ARCHIBUSColumn.id;
                        }
                        if (this.existsField(ARCHIBUSColumn.dataType)) {
                            switch (ARCHIBUSColumn.dataType) {
                                case 'number':
                                    webixColumn.format = webix.i18n.numberFormat;
                                    break;
                                case 'date':
                                    //webixColumn.format = webix.Date.dateToStr("%m/%d/%y");

                                    break;
                            }
                        } else {
                            ARCHIBUSColumn.dataType = 'String';
                        }
                        webixColumn.header = this.createColumnHeader(ARCHIBUSColumn.title, ARCHIBUSColumn.dataType, ARCHIBUSColumn.action);
                        webixColumn.cssFormat = this.createColumnCssFormat(ARCHIBUSColumn.cssClass);
                        webixColumn.template = function (cellElement, cellInfo, cellValue) {
                            if (cellElement.$group) {
                                return ' ';
                            }
                            return cellValue;
                        };

                        if (this.existsField(ARCHIBUSColumn.width)) {
                            webixColumn.width = ARCHIBUSColumn.width;
                        } else {
                            webixColumn.adjust = "data";
                        }
                        if (this.existsField(ARCHIBUSColumn.action)) {
                            webix.buttonsMap = ARCHIBUSColumn.action;
                            webixColumn.template = this.renderButton;
                        } else {
                            webixColumn.sort = "server";
                        }
                        if (this.existsField(ARCHIBUSColumn.groupBy)) {
                            webixColumn.template = this.renderGroup;
                            webixGroupBy.id = ARCHIBUSColumn.id;
                        }
                        if (this.existsField(ARCHIBUSColumn.showTotals)) {
                            webixColumn.footer = { content: "sumTotalGroup" };
                            if (!this.existsField(webixGroupBy.footer)) {
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
            }, {
                key: "existsField",
                value: function existsField(field) {
                    return typeof field != 'undefined';
                }
            }, {
                key: "createColumnHeader",
                value: function createColumnHeader(title, dataType, action) {
                    if (this.existsField(action)) {
                        return title;
                    }
                    var filterView;
                    for (var type in this.dataTypeToFilterTypeMapping) {
                        if (type === dataType) {
                            filterView = this.dataTypeToFilterTypeMapping[type];
                        }
                    }
                    return [title, { content: filterView }];
                }
            }, {
                key: "createColumnCssFormat",
                value: function createColumnCssFormat(cssClass) {
                    if (this.existsField(cssClass)) {
                        return webix.actions[cssClass];
                    } else {
                        return function (value, obj, t, y) {
                            if (obj.ch1 && !obj.$group) return "row-marked";
                            return "";
                        };
                    }
                }
            }]);

            return DataGrid;
        })();

        webix.ui.datafilter.sumTotalGroup = {
            getValue: function getValue(node) {
                return node.firstChild.innerHTML;
            },
            setValue: function setValue() {},
            refresh: function refresh(master, node, value) {
                var result = 0;
                master.mapGroupsCells(null, value.columnId, null, 1, function (value) {
                    value = value * 1;
                    if (!isNaN(value)) result += value;
                    return value;
                });

                if (value.format) result = value.format(result);
                if (value.template) result = value.template({ value: result });

                node.firstChild.innerHTML = result;
            },
            trackCells: true,
            render: function render(master, config) {
                if (config.template) config.template = webix.template(config.template);
                return "";
            }
        };
    }, { "./custom-actions": 1, "./custom-filter-sort": 2, "./metadata/sample-columns-metadata": 6 }], 4: [function (require, module, exports) {
        var buttonsMetadata = [{
            icon: 'style/icons/cog_edit.png',
            class: 'editclass',
            function: 'buttonClick1',
            condition: [{
                column: 'AssetType',
                value: 'bl'
            }]
        }, {
            icon: 'style/icons/delete.gif',
            class: 'deleteclass',
            function: 'buttonClick2',
            condition: [{
                column: 'AssetType',
                value: 'bl'
            }]
        }, {
            icon: 'style/icons/add.gif',
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
            icon: 'style/icons/information.png',
            class: 'infoclass',
            function: 'buttonClick4',
            condition: [{
                column: 'AssetType',
                value: 'bl'
            }]
        }];

        module.exports = buttonsMetadata;
    }, {}], 5: [function (require, module, exports) {
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
    }, {}], 6: [function (require, module, exports) {
        var buttonMetadata = require('./sample-buttons-metadata');

        var ARCHIBUSColumns = [{
            id: 'AssetType',
            title: 'Asset Type',
            groupBy: true,
            sortBy: 'asc', // or 'desc'
            dataType: 'text'
        }, {
            id: 'cost_purchase',
            title: 'Purchase Cost',
            width: 200,
            dataType: 'number',
            showTotals: true
        }, {
            id: 'quantity_mtbf',
            title: 'Mean Time Between Failures',
            width: 200,
            dataType: 'integer',
            showTotals: true
        }, {
            id: 'AssetStandard',
            title: 'Asset Standard',
            width: 200,
            dataType: 'text'
        }, {
            id: 'AssetStatus',
            title: 'Asset Status',
            width: 200,
            dataType: 'text'
        }, {
            id: 'TitleDescription',
            title: 'Title Description',
            width: 200,
            dataType: 'text'
        }, {
            id: 'GeoRegionID',
            title: 'Geo-RegionID',
            width: 200,
            dataType: 'text'
        }, {
            id: 'CountryCode',
            title: 'Country Code',
            width: 200,
            cssClass: 'cssClassCountryCode',
            dataType: 'text'
        }, {
            id: 'StateCode',
            title: 'State Code',
            width: 200,
            dataType: 'text'
        }, {
            id: 'CityCode',
            title: 'City Code',
            width: 200,
            dataType: 'text'
        }, {
            id: 'SiteCode',
            title: 'Site Code',
            width: 200,
            dataType: 'text'
        }, {
            id: 'BuildingCode',
            title: 'Building Code',
            width: 200,
            dataType: 'text'
        }, {
            id: 'FloorCode',
            title: 'Floor Code',
            width: 200,
            dataType: 'text'
        }, {
            id: 'RoomCode',
            title: 'Room Code',
            width: 200,
            dataType: 'text'
        }, {
            id: 'BusinessUnit',
            title: 'Business Unit',
            width: 200,
            dataType: 'text'
        }, {
            id: 'DivisionCode',
            title: 'Division Code',
            width: 200,
            dataType: 'text'
        }, {
            id: 'DepartmentCode',
            title: 'Department Code',
            width: 200,
            dataType: 'text'
        }, {
            id: 'Date',
            title: 'Date',
            width: 200,
            dataType: 'date',
            dateTimeFormat: ''
        }, {
            title: 'Action',
            width: 200,
            action: buttonMetadata
        }];

        module.exports = ARCHIBUSColumns;
    }, { "./sample-buttons-metadata": 4 }] }, {}, [3]);