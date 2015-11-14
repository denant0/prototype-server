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
                    document.getElementById('select').innerHTML = text;
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
                    if (state.sort) for (var key in state.sort) finalurl += "&sort[" + state.sort[key].id + "]=" + state.sort[key].dir;
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
                if (this.___multisort) {
                    if (this._last_sorted) {
                        var isAdded = true;
                        if (settings.sort.length == 0) {
                            settings.sort[settings.sort.length] = {
                                id: this._last_sorted,
                                dir: this._last_order
                            };
                        } else {
                            for (var numberSort in settings.sort) {
                                if (settings.sort[numberSort].id == this._last_sorted) {
                                    settings.sort[numberSort].dir = this._last_order;
                                    isAdded = false;
                                    break;
                                }
                            }
                            if (isAdded) {
                                settings.sort[settings.sort.length] = {
                                    id: this._last_sorted,
                                    dir: this._last_order
                                };
                            }
                        }
                    }
                    this._multisortMap = settings.sort;
                } else {
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
                //height: 700,
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
                if (this.___multisort) {
                    this._multisortMap = [];
                }
            }
        }, webix.ui.treetable);

        var DataGrid = (function () {
            function DataGrid(config) {
                _classCallCheck(this, DataGrid);

                this.id = config.id;
                this.dataTypeToFilterTypeMapping = {
                    text: 'serverFilter',
                    data: 'serverFilter',
                    time: 'serverFilter',
                    number: 'serverFilter',
                    integer: 'serverFilter'
                };
                webix.pageSize = config.pageSize;
                var webixColumns = this.createWebixColumns(config.columns);
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

                if (typeof config.width != 'undefined') {
                    document.getElementById(config.container).style.width = config.width + "px";
                } else {
                    document.getElementById(config.container).style.width = "100%";
                }
                if (typeof config.height != 'undefined') {
                    document.getElementById(config.container).style.height = config.height + "px";
                } else {
                    document.getElementById(config.container).style.height = "90%";
                }

                for (var event in config.events) {
                    webixActionsGrid[event] = webix.actions[config.events[event]];
                }
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
                this.dataTable = new webix.ui({
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
                    spans: true,
                    checkboxRefresh: true,
                    on: webixActionsGrid,
                    scheme: {
                        $group: webixColumns.idGroup,
                        $sort: webixColumns.idGroup
                    },
                    url: config.dataSource

                });
            }

            _createClass(DataGrid, [{
                key: "renderGroup",
                value: function renderGroup(obj, common, a, b, currentNumber) {
                    if (obj.$group) {
                        var result = common.treetable(obj, common) + " " + this.id + ": " + obj.value + " ( " + obj.$count + " assets )";
                        var freeItems = webix.pageSize - currentNumber;
                        if (obj.open) if (freeItems < obj.$count) result += " (Continues on the next page)";
                        return result;
                    }
                    return obj[this.id];
                }
            }, {
                key: "renderButton",
                value: function renderButton(cellElement, cellInfo) {
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
                    var idGroupBy;
                    webixColumns[0] = {
                        id: "ch1",
                        header: "",
                        width: 40,
                        template: "{common.checkbox()}"
                    };
                    var index = 1;
                    for (var numberColumn in ARCHIBUSColumns) {
                        var ARCHIBUSColumn = ARCHIBUSColumns[numberColumn];
                        var webixColumn = {};
                        var filter;

                        webixColumn.id = ARCHIBUSColumn.id;
                        for (var type in this.dataTypeToFilterTypeMapping) {
                            if (type === ARCHIBUSColumn.dataType) {
                                filter = this.dataTypeToFilterTypeMapping[type];
                            }
                        }
                        webixColumn.header = [ARCHIBUSColumn.title, { content: filter }];
                        webixColumn.sort = "server";
                        if (typeof ARCHIBUSColumn.width != 'undefined') {
                            webixColumn.width = ARCHIBUSColumn.width;
                        } else {
                            webixColumn.adjust = "data";
                        }
                        if (typeof ARCHIBUSColumn.action != 'undefined') {
                            webix.buttonsMap = ARCHIBUSColumn.action;
                            webixColumn.template = this.renderButton;
                        }
                        if (typeof ARCHIBUSColumn.groupBy != 'undefined') {
                            idGroupBy = ARCHIBUSColumn.id;
                            webixColumn.template = this.renderGroup;
                        }
                        if (typeof ARCHIBUSColumn.cssClass != 'undefined') {
                            webixColumn.cssFormat = webix.actions[ARCHIBUSColumn.cssClass];
                        } else {
                            webixColumn.cssFormat = function (value, obj, t, y) {
                                if (obj.ch1 && !obj.$group) return "row-marked";
                                return "";
                            };
                        }

                        webixColumns[index] = webixColumn;
                        index++;
                    }
                    return {
                        columns: webixColumns,
                        idGroup: idGroupBy
                    };
                }
            }]);

            return DataGrid;
        })();
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
            id: 'Data',
            title: 'Data',
            width: 200,
            dataType: 'data'
        }, {
            title: 'Action',
            width: 200,
            action: buttonMetadata
        }];

        module.exports = ARCHIBUSColumns;
    }, { "./sample-buttons-metadata": 4 }] }, {}, [3]);