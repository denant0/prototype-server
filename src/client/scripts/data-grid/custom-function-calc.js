webix.ui.datafilter.sumTotalGroup = /*webix.extend({
    refresh:function(master, node, value){
        var result = 0;
        master.data.each(function(obj){
            if (obj.$level == 2) result += obj[value.columnId];
        });

        node.firstChild.innerHTML = result;
    }
}, webix.ui.datafilter.summColumn);*/
{
    getValue:function(node){ return node.firstChild.innerHTML; },
    setValue: function(){},
    refresh:function(master, node, value){
        var result = 0;
        master.mapGroupsCells(null, value.columnId, null, 1, function(value){
            value = value*1;
            if (!isNaN(value))
                result += value;

            return value;
        });

        if (value.format)
            result = value.format(result);
        if (value.template)
            result = value.template({value:result});

        node.firstChild.innerHTML = result;
    },
    trackCells:true,
    render:function(master, config) {
        if (config.template)
            config.template = webix.template(config.template);
        return "";
    }
};