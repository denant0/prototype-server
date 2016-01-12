class DateRangeFilter {
    constructor () {
        webix.ui({
            view: 'filterPopup',
            css: 'styleDataRangeFilter',
            relative: 'top',
            id: 'dataRangeFilter',
            body:{
                cols:[
                    {
                        view: 'datepicker',
                        css: 'styleMinDateInput',
                        placeholder: 'oldest',
                        format:webix.Date.dateToStr("%m/%d/%Y"),
                        on: {
                            onChange: this._changeMinValueFilter
                        }
                    },
                    {
                        template: 'to',
                        width:20,
                        css: 'styleString'
                    },
                    {
                        view: 'datepicker',
                        placeholder: 'newest',
                        format:webix.Date.dateToStr("%m/%d/%Y"),
                        css: 'styleMaxDateInput',
                        on: {
                            onChange: this._changeMaxValueFilter
                        }
                    }
                 ]
            }
        });
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
        gridObject.refresh();
    }
}

module.exports = DateRangeFilter;