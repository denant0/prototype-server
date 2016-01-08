var DataGrid = require('./data-grid/datagrid');
var columnsMetadata = require('./data-grid/metadata/sample-columns-metadata');

webix.ready(function(){
    var dataGrid = new DataGrid({
        id: 'projectsGrid',
        container: 'projectsGridContainer',
        style: 'flat',
        title: 'Asset List',
        columns: columnsMetadata,
        sortFields: [],
        dataSource: 'server/data',
        //width: 700,
        // height: 700,
        pageSize: 100,
        events:{
            onSelectChange: 'selectValue',
            onItemClick: 'clickCell'
        },
        editing: true,
        firstRightFixedColumn: 'Action',
        lastLeftFixedColumn: 'quantity_mtbf'
    });
    resize([dataGrid]);
});

function resize(objects){
    for(var number in objects){
        webix.event(window, "resize", function (event) {
            objects[number].view.adjust();
            objects[number].dataTable.adjust();
            objects[number].filterTable.adjust();
        });
    }
}






