class TextFilter {
    constructor () {
        webix.editors.customText = webix.extend({
            focus: function(){
                this.getInputNode(this.node).focus();
            },
            popupType: 'customText',
            getValue:function(){
                return this.getInputNode().getValue()||"";
            },
            setValue:function(){
                var displayValue = '';
                var gridObject = $$(webix.ARCHIBUS.filterContainer);
                var item = gridObject.getItem(webix.ARCHIBUS.currentDisplayFilter.row);
                if (item[webix.ARCHIBUS.currentDisplayFilter.id].value) {
                    displayValue = item[webix.ARCHIBUS.currentDisplayFilter.id].value;
                }
                this.getPopup().show(this.node);
                this.getInputNode().setValue(displayValue);
            },
            getInputNode:function(){
                return this.getPopup().getChildViews()[0];
            },
            popupInit:function(popup){
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
            css: 'styleTextFilter',
            body:{
                view:"text",
                width:100,
                height:30,
                css: 'styleTextInput',
                on: {
                    onChange: this._changeFilter,
                    onKeyPress: function (code, e) {
                        if (code == 13) {
                            var newValue = e.currentTarget.activeElement.value;
                            this.callEvent('onChange',[newValue]);
                        }
                    }
                }
            }
        };

        return {
            id: 'customText',
            view: configurationView
        }
    }

    _changeFilter (newValue, oldValue) {
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
                    var result = '{"type": "text", "value": "'+ node + '"';
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

                    if (node[node.length-1] == pattern) {
                        result = '{"type": "text", "value": "' + node.substr(0, node.length - 1) + '", "start": "true"';
                    }

                    if(isAddStyle) {
                        result = '{"type": "text", "value": "' + node.substr(1) + '", "end": "true"';
                    }
                    result += '}';
                    return result;
                }
            }
        );
        $$(webix.ARCHIBUS.gridContainer).filterByAll();
        gridObject.refresh();
    }
}

module.exports = TextFilter;