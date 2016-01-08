class SelectFilter {
    constructor () {
        webix.editors.customSelect = webix.extend({
            popupType: "customSelect",
            focus: function () {
                this.getInputNode(this.node).focus();
            },
            getValue: function () {
                return this.getInputNode().getValue()||"";
            },
            setValue: function (value) {
                var displayValue = '';
                var gridObject = $$(webix.ARCHIBUS.filterContainer);
                var item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row);
                if (item[webix.ARCHIBUS.currentDisplayFilter.id].value) {
                    displayValue = item[webix.ARCHIBUS.currentDisplayFilter.id].value;
                }
                this.getPopup().show(this.node);
                this.getInputNode().setValue(displayValue);
            },
            getInputNode: function () {
                return this.getPopup().getChildViews()[0];
            }

        }, webix.editors.popup);
    }

    configuration () {
        var configurationView = {
            view:"filterPopup",
            relative: 'top',
            css: 'styleSelectFilter',
            on: {
                onShow: this._show
            },
            body: {
                view:"combo",
                id: 'customCombo',
                css: 'styleSelectList',
                width:100,
                value:1,
                options:[],
                on: {
                    onChange: this._changeFilter,
                    onBeforeRender: function () {
                        var  optionsView = $$('customCombo').config.options;
                        webix.html.addCss($$(optionsView).$view, "styleSelectOptions");
                    }
                }
            }
        };

        return {
            id: 'customSelect',
            view: configurationView
        }
    }

    _changeFilter (newValue, oldValue) {
        newValue = this.getText();
        var gridObject = $$(webix.ARCHIBUS.filterContainer);
        var item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row);
        if (newValue) {
            item[webix.ARCHIBUS.currentDisplayFilter.id].value = newValue;
        }
        $$(webix.ARCHIBUS.gridContainer).registerFilter(
            newValue,
            { columnId: webix.ARCHIBUS.currentDisplayFilter.id },
            {
                $server: true,
                getValue:function(node) {
                    return '{"type": "text", "value": "' + node + '"}';
                }
            }
        );
        $$(webix.ARCHIBUS.gridContainer).filterByAll();
        gridObject.refresh();
    }

    _show () {
        $$('customCombo').getList().clearAll();
        var options;
        for(var index in webix.ARCHIBUS.data.collection) {
            if(webix.ARCHIBUS.data.collection[index].id == webix.ARCHIBUS.currentDisplayFilter.id) {
                options = webix.ARCHIBUS.data.collection[index].value;
                break;
            }
        }
        for(var index in options) {
            $$('customCombo').getList().add(options[index]);
        }
    }
}


module.exports = SelectFilter;