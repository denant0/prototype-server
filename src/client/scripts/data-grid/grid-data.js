var columnsMetadata = require('./metadata/columns-metada');
var buttonsMetadata = require('./metadata/buttons-metadata');

webix.ready(function(){

    dtable = new webix.ui({
        container:"grid",
        view:"treetable",
        columns: columnsMetadata,
        pager:{
            template:"{common.first()}{common.prev()}{common.pages()}{common.next()}{common.last()}",
            container: 'paging',
            size: 100,
            group: 5,
            animate:{
                subtype:"in"
            }
        },
        select: "cell",
        multiselect: true,
        resizeColumn:true,
        spans: true,
        checkboxRefresh:true,
        on:{
            onSelectChange:function() {
                var id = dtable.getSelectedId(true);
                if (id.length != 0) {
                    var text = dtable.getItem(id)[id[0].column];
                    webix.message(text);
                    document.getElementById('select').innerHTML = text;
                }
            },
            onCheck:function(row, column, value){
                this.data.eachChild(row, function(item){
                    item[column] = value;
                })
            },
            onAfterLoad:function(row, column, value){
                this.openAll();
            },
            onBeforeRender: function(){
                for(var key in buttonsMetadata){
                    var button = buttonsMetadata[key];
                        this.on_click[button.class]= button.function;
                }
            },
            onDataRequest: function (id, callback, url) {
                var y =id;
            }
        },
        scheme:{
            $group: 'AssetType',
            $sort: 'AssetType'
        },
        url: "server/data"

    });

    webix.event(window, "resize", function(){dtable.adjust()});

});







