class NumericRangeFilter {
    constructor () {
        webix.editors.numericRange = webix.extend({
            popupType: 'numericRange',
            focus: function () {
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
            getValue: function () {
                var minInput = this.getInputNode().getChildViews()[0].getValue();
                var maxInput = this.getInputNode().getChildViews()[2].getValue();
                return {min: minInput || '', max: maxInput || ''};
            },
            setValue: function (value) {
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
            id: 'numericRangeView',
            css: 'styleNumericRangeFilter',
            body:{
                cols:[
                    {
                        view:"text",
                        id:'customFilter',
                        css: 'styleMinInput',
                        width:70,
                        height:30,
                        tabFocus: true,
                        on: {
                            onChange: this._changeMinValueFilter,
                            onKeyPress: function (code, e) {
                                if (code == 13) {
                                    var newValue = e.currentTarget.activeElement.value;
                                    this.callEvent('onChange',[newValue]);
                                }
                            }
                        }
                    },
                    {
                        template: 'to',
                        width:20,
                        css: 'styleString'
                    },
                    {
                        view:"text",
                        id:'customFilter1',
                        css: 'styleMaxInput',
                        width:70,
                        height:30,
                        tabFocus: true,
                        on: {
                            onChange: this._changeMaxValueFilter,
                            onKeyPress: function (code, e) {
                                if (code == 13) {
                                    var newValue = e.currentTarget.activeElement.value;
                                    this.callEvent('onChange',[newValue]);
                                }
                            }
                        }
                    }
                ]
            }
        };

        return {
            id: 'numericRange',
            view: configurationView
        }
    }

    _changeMinValueFilter (newValue, oldValue) {
        var gridObject = $$(webix.ARCHIBUS.filterContainer);
        var item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row);
        if (newValue || newValue == '') {
            item[webix.ARCHIBUS.currentDisplayFilter.id].value = newValue;
        }
        $$(webix.ARCHIBUS.gridContainer).registerFilter(
            item[webix.ARCHIBUS.currentDisplayFilter.id],
            { columnId: webix.ARCHIBUS.currentDisplayFilter.id },
            {
                $server: true,
                getValue:function(node) {
                    var query = '';
                    if (node.value) {
                        query ='{"type": "number", "min": "' + node.value + '"}';
                    }
                    if (node.maxValue) {
                        query ='{"type": "number", "max": "' + node.maxValue + '"}';
                    }
                    if (node.value && node.maxValue) {
                        query ='{"type": "number", "min": "' + node.value + '", "max": "' + node.maxValue + '"}';
                    }
                    return query;
                }
            }
        );
        $$(webix.ARCHIBUS.gridContainer).filterByAll();
        gridObject.refresh();
    }

    _changeMaxValueFilter (newValue, oldValue) {
        var gridObject = $$(webix.ARCHIBUS.filterContainer);
        var item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row);
        if (newValue || newValue == '') {
            item[webix.ARCHIBUS.currentDisplayFilter.id].maxValue = newValue;
        }
        $$(webix.ARCHIBUS.gridContainer).registerFilter(
            item[webix.ARCHIBUS.currentDisplayFilter.id],
            { columnId: webix.ARCHIBUS.currentDisplayFilter.id },
            {
                $server: true,
                getValue:function(node) {
                    var query = '';
                    if (node.value) {
                        query ='{"type": "number", "min": "' + node.value + '"}';
                    }
                    if (node.maxValue) {
                        query ='{"type": "number", "max": "' + node.maxValue + '"}';
                    }
                    if (node.value && node.maxValue) {
                        query ='{"type": "number", "min": "' + node.value + '", "max": "' + node.maxValue + '"}';
                    }
                    return query;
                }
            }
        );
        $$(webix.ARCHIBUS.gridContainer).filterByAll();
        gridObject.refresh();
    }
}

module.exports = NumericRangeFilter;