var classStyle = require('./metadata/sample-cell-style-metadata');
webix.ARCHIBUS = {};

/*
 Map of events used in the grid user
 */
webix.actions = {
    selectValue: function(){
        var id = this.getSelectedId(true);
        if (id.length != 0) {
            var text = this.getItem(id)[id[0].column];
            webix.message(text);
        }
    },
    buttonClick1: function(){
        webix.message('You click button 1');
    },
    buttonClick2: function(event,object,cell,d){
        this.eachColumn(
            function (columnId){
                this.removeCellCss(object.row,columnId,"row-edited");
            }
        );
        webix.ARCHIBUS.editRows = "";
        webix.message('You click button 2');
    },
    buttonClick3: function(event,object,cell,d){
        if(typeof webix.ARCHIBUS.editRows != 'undefined'){
            this.eachColumn(
                function (columnId){
                    this.removeCellCss(webix.ARCHIBUS.editRows,columnId,"row-edited");
                }
            );
        }
        this.eachColumn(
            function (columnId){
                this.addCellCss(object.row,columnId,"row-edited");
            }
        );


        webix.ARCHIBUS.editRows = object.row;
        webix.message('Edit');
    },
    buttonClick4: function(){
        webix.message('You click button 4');
    },
    cssClassCountryCode: function (container, cellInfo, t,y){
        if (cellInfo.ch1 && ! cellInfo.$group) return "row-marked";
        var currentEnumStyle = classStyle[y];
        for(var element in currentEnumStyle){
            if(container == currentEnumStyle[element].cellText){
                return currentEnumStyle[element].classStyle;
            }
        }
    }
};