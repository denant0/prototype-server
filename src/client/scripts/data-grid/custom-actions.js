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
    },
    totalGroup: function(obj, common, a,v,d,f) {
        var result = "";
        if(obj.$group){
            var count = obj.$count;

            result = common.treetable(obj, common) + " "+ obj.id + ": " + obj.value + " ( " + count + " assets )";
            /*var freeItems = webix.pageSize - currentNumber;
            if(obj.open)
                if(freeItems < obj.$count )
                    result += " (Continues on the next page)";*/
            result += "<span>";
            for(var i in webix.groupTotalLine) {
                if (webix.groupTotalLine[i].type == 'number'){
                    result += webix.groupTotalLine[i].title + ": " + webix.i18n.numberFormat(obj[webix.groupTotalLine[i].id+"Sum"]) + " ";
                }

                else
                    result += webix.groupTotalLine[i].title + ": " + obj[webix.groupTotalLine[i].id+"Sum"] + "      ";
            }
            result += "</span>";
        }
        return result;
    }
};