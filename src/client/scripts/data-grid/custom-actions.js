var classStyle = require('./metadata/sample-cell-style-metadata');
/*
 Map of events used in the grid user
 */
webix.actions = {
    selectValue: function(){
        var id = this.getSelectedId(true);
        if (id.length != 0) {
            var text = this.getItem(id)[id[0].column];
            webix.message(text);
            document.getElementById('select').innerHTML = text;
        }
    },
    buttonClick1: function(){
        webix.message('You click button 1');
    },
    buttonClick2: function(){
        webix.message('You click button 2');
    },
    buttonClick3: function(){
        webix.message('You click button 3');
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