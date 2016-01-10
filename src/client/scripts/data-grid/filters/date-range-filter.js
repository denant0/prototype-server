class DateRangeFilter {
    constructor () {

        webix.ui({
            view:"popup",
            css:"custom",
            relative: 'bottom',
            id:"cmenu",
            body:{
                view:"calendar", timepicker:true, stringResult:true, format:"%d %M %Y at %H:%i",
                on: {
                    onChange: function () {
                        var t = 0;
                    }//this._changeMinValueFilter
                }
            }
        });

        webix.editors.dateRange = webix.extend({
            popupType: 'dateRange',
            focus: function () {
                /*var gridObject = $$(webix.ARCHIBUS.filterContainer),
                    item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row),
                    data = item[webix.ARCHIBUS.currentDisplayFilter.id];
                if (data.value) {
                    this.getInputNode().getChildViews()[2].focus();
                    if (data.value && data.maxValue) {
                        this.getInputNode().getChildViews()[0].focus();
                    }
                } else {
                    this.getInputNode().getChildViews()[0].focus();
                }*/
            },
            getValue: function () {
                /*var minInput = this.getInputNode().getChildViews()[0].getValue();
                var maxInput = this.getInputNode().getChildViews()[2].getValue();*/
                return "";
            },
            setValue: function (value) {
                /*var displayMinValue = '',
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

                var minInput = this.getInputNode().getChildViews()[0];
                var maxInput = this.getInputNode().getChildViews()[2];
                minInput.setValue(displayMinValue);
                maxInput.setValue(displayMaxValue);*/
                this.getPopup().show(this.node);
            },
            getInputNode: function() {
                return this.getPopup().getChildViews()[0];
            },
            popupInit: function(popup) {
                popup.getChildViews()[0].attachEvent("onSelect", function(value){
                    webix.callEvent("onEditEnd",[value]);
                });
            }
        }, webix.editors.popup);
    }

    configuration () {
        var configurationView = {
            view:"filterPopup",
            relative: 'top',
            css: 'customFilterView',
            body:{
                cols:[
                    {
                        rows: [
                            {
                                view: 'text',
                                on: {
                                    onFocus: function (currentView, prevView) {
                                        $$("cmenu").show(currentView);
                                        //$$("cmenu").getBody().data.dataedit = tooltip;
                                        //$$("cmenu").getBody().data.id = id;
                                        $$("cmenu").getBody().refresh();
                                    }
                                }
                            }
                        ]
                    },
                    {
                        template: 'to',
                        width:20,
                        css: 'styleString'
                    },
                    {
                        rows: [
                            {
                                view: 'text'
                            },
                            {
                                view:"calendar", timepicker:true, stringResult:true, format:"%d %M %Y at %H:%i",
                                hidden: true,
                                on: {
                                    //onChange: this._changeMaxValueFilter
                                }
                            }
                        ]
                    }
                ]
            }
        };

        return {
            id: 'dateRange',
            view: configurationView
        }
    }

    _changeMinValueFilter (newValue, oldValue) {
        var gridObject = $$(webix.ARCHIBUS.filterContainer);
        var item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row);
        if (newValue || newValue == '') {
            item[webix.ARCHIBUS.currentDisplayFilter.id].value = newValue;
        }
        /*$$(webix.ARCHIBUS.gridContainer).registerFilter(
            item[webix.ARCHIBUS.currentDisplayFilter.id],
            { columnId: webix.ARCHIBUS.currentDisplayFilter.id },
            {
                $server: true,
                getValue:function(node) {
                    var query = '';
                    if (node.value) {
                        query ='{"type": "date", "min": "' + node.value + '"}';
                    }
                    if (node.maxValue) {
                        query ='{"type": "date", "max": "' + node.maxValue + '"}';
                    }
                    if (node.value && node.maxValue) {
                        query ='{"type": "date", "min": "' + node.value + '", "max": "' + node.maxValue + '"}';
                    }
                    return query;
                }
            }
        );
        $$(webix.ARCHIBUS.gridContainer).filterByAll();
        gridObject.refresh();*/
    }

    _changeMaxValueFilter (newValue, oldValue) {
        var gridObject = $$(webix.ARCHIBUS.filterContainer);
        var item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row);
        if (newValue || newValue == '') {
            item[webix.ARCHIBUS.currentDisplayFilter.id].maxValue = newValue;
        }
        /*$$(webix.ARCHIBUS.gridContainer).registerFilter(
            item[webix.ARCHIBUS.currentDisplayFilter.id],
            { columnId: webix.ARCHIBUS.currentDisplayFilter.id },
            {
                $server: true,
                getValue:function(node) {
                    var query = '';
                    if (node.value) {
                        query ='{"type": "date", "min": "' + node.value + '"}';
                    }
                    if (node.maxValue) {
                        query ='{"type": "date", "max": "' + node.maxValue + '"}';
                    }
                    if (node.value && node.maxValue) {
                        query ='{"type": "date", "min": "' + node.value + '", "max": "' + node.maxValue + '"}';
                    }
                    return query;
                }
            }
        );
        $$(webix.ARCHIBUS.gridContainer).filterByAll();
        gridObject.refresh();*/
    }
}

module.exports = DateRangeFilter;