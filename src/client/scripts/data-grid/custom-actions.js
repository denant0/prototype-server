var classStyle = require('./metadata/sample-cell-style-metadata');
webix.ARCHIBUS = {};


/*
 Map of customGridEvents used in the grid user
 */
webix.actions = {
    selectValue: function() {
        var id = this.getSelectedId(true);
        if (id.length != 0) {
            var text = this.getItem(id)[id[0].column];
            webix.message(text);
        }

    },
    clickCell: function(id, event) {
        if (typeof webix.ARCHIBUS.editRows != 'undefined') {
            for (var index in  webix.ARCHIBUS.editRows) {
                var editRow = webix.ARCHIBUS.editRows[index];
                if (editRow.id == id.row) {
                    this.editCell(id.row, id.column);
                }
            }
        }
    },
    buttonClick1: function(event,object,cell) {
        webix.message('You click button 1');
    },
    buttonClick2: function(event,object,cell) {
        webix.message('You click button 2');
    },
    buttonClick3: function(event,object,cell) {
        webix.message('You click button 3');
    },
    buttonClick4: function(){
        webix.message('You click button 4');
    },
    cssClassCountryCode: function(container, cellInfo, t,y) {
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
        for(var element in currentEnumStyle){
            if (container == currentEnumStyle[element].cellText) {
                return currentEnumStyle[element].classStyle;
            }
        }
    }
};