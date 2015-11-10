"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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
        var columnsMetadata = require('./metadata/sample-columns-metadata');

        webix.ready(function () {
            var dataGrid = new DataGrid({
                id: 'projectsGrid',
                container: 'projectsGridContainer',
                columns: columnsMetadata,
                sortFields: [],
                dataSource: 'server/data',
                //width: 200,
                //height: 400,
                events: {
                    onSelectChange: function onSelectChange() {
                        var id = this.getSelectedId(true);
                        if (id.length != 0) {
                            var text = this.getItem(id)[id[0].column];
                            webix.message(text);
                            document.getElementById('select').innerHTML = text;
                        }
                    }
                }
            });
            resize([dataGrid]);
        });

        function resize(objects) {
            for (var number in objects) {
                webix.event(window, "resize", function () {
                    objects[number].view.adjust();
                });
                webix.event(window, "resize", function () {
                    objects[number].dataTable.adjust();
                });
            }
        }

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
                var webixColumns = this.createWebixColumns(config.columns);
                var webixActionGrid = {
                    onCheck: function onCheck(row, column, value) {
                        this.data.eachChild(row, function (item) {
                            item[column] = value;
                        });
                    },
                    onAfterLoad: function onAfterLoad(row, column, value) {
                        this.openAll();
                    },
                    onBeforeRender: function onBeforeRender() {
                        for (var key in webix.actions) {
                            var button = webix.actions[key];
                            this.on_click[button.class] = button.function;
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
                    webixActionGrid[event] = config.events[event];
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
                    view: "treetable",
                    columns: webixColumns.columns,
                    pager: {
                        template: "{common.first()}{common.prev()}{common.pages()}{common.next()}{common.last()}",
                        container: namePaging,
                        size: 100,
                        group: 5,
                        animate: {
                            subtype: "in"
                        }
                    },
                    select: "cell",
                    multiselect: true,
                    resizeColumn: true,
                    spans: true,
                    checkboxRefresh: true,
                    on: webixActionGrid,
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
                        var freeItems = 100 - currentNumber;
                        if (obj.open) if (freeItems < obj.$count) result += " (Continues on the next page)";
                        return result;
                    }
                    return obj[this.id];
                }
            }, {
                key: "renderButton",
                value: function renderButton(cellElement, cellInfo) {
                    var result = "";
                    for (var number in webix.actions) {
                        var button = webix.actions[number];
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
                            webix.actions = ARCHIBUSColumn.action;
                            webixColumn.template = this.renderButton;
                        }
                        if (typeof ARCHIBUSColumn.groupBy != 'undefined') {
                            idGroupBy = ARCHIBUSColumn.id;
                            webixColumn.template = this.renderGroup;
                        }
                        if (typeof ARCHIBUSColumn.cssClass != 'undefined') {
                            webixColumn.cssFormat = ARCHIBUSColumn.cssClass;
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
    }, { "./metadata/sample-columns-metadata": 4 }], 2: [function (require, module, exports) {
        var buttonsMetadata = [{
            icon: 'style/icons/cog_edit.png',
            class: 'editclass',
            function: function _function() {
                webix.message('You click button 1');
            },
            condition: [{
                column: 'AssetType',
                value: 'bl'
            }]
        }, {
            icon: 'style/icons/delete.gif',
            class: 'deleteclass',
            function: function _function() {
                webix.message('You click button 2');
            },
            condition: [{
                column: 'AssetType',
                value: 'bl'
            }]
        }, {
            icon: 'style/icons/add.gif',
            class: 'addclass',
            function: function _function() {
                webix.message('You click button 3');
            },
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
            function: function _function() {
                webix.message('You click button 4');
            },
            condition: [{
                column: 'AssetType',
                value: 'bl'
            }]
        }];

        module.exports = buttonsMetadata;
    }, {}], 3: [function (require, module, exports) {
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
    }, {}], 4: [function (require, module, exports) {
        var buttonMetadata = require('./sample-buttons-metadata');
        var classStyle = require('./sample-cell-style-metadata');

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
            cssClass: function cssClass(container, cellInfo, t, y) {
                if (cellInfo.ch1 && !cellInfo.$group) return "row-marked";
                var currentEnumStyle = classStyle[y];
                for (var element in currentEnumStyle) {
                    if (container == currentEnumStyle[element].cellText) {
                        return currentEnumStyle[element].classStyle;
                    }
                }
            },
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
    }, { "./sample-buttons-metadata": 2, "./sample-cell-style-metadata": 3 }] }, {}, [1]);