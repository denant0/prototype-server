var columnsMetadata = require('./metadata/columns-metada');


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
        checkboxRefresh:true,
        on:{
            onSelectChange:function(){
                var id = dtable.getSelectedId(true);
                var text = dtable.getItem(id)[id[0].column];
                webix.message(text);
                document.getElementById('select').innerHTML = text;
            },
            onCheck:function(row, column, value){
                this.data.eachChild(row, function(item){
                    item[column] = value;
                })
            },
            onAfterLoad:function(row, column, value){
                this.openAll();
            }
        },
        scheme:{
            $group:'AssetType',
            $sort: 'AssetType'

        },
        url: "server/data"
    });
    webix.event(window, "resize", function(){dtable.adjust()});

    dtable.openAll();

    dtable.on_click.editclass = function(grid, rowIndex, colIndex) {
        webix.message('You click button 1');
    };
    dtable.on_click.deleteclass = function(grid, rowIndex, colIndex) {
        webix.message('You click button 2');
    };
    dtable.on_click.addclass = function(grid, rowIndex, colIndex) {
        webix.message('You click button 3');
    };
    dtable.on_click.infoclass = function(grid, rowIndex, colIndex) {
        webix.message('You click button 4');
    };
})





