var DataGridLoad = require('./datagrid-load-data'),
    DataGridSort = require('./datagrid-sort'),
    DataGridEdit = require('./datagrid-edit'),
    DataGridGroups = require('./datagrid-groups');

class DataGridPrototype{
    constructor(configurationGrid){
        this.dataGridLoad = new DataGridLoad();
        this.dataGridSort = new DataGridSort();
        this.dataGridEdit = new DataGridEdit();
        this.dataGridGroups = new DataGridGroups();

        webix.protoUI({
            name: 'customDataTable',
            $init: function (config) {
                this.___multisort = config.multisort;
                this._multisort_isDelete = false;
                this._multisort_count = 0;
                if (this.___multisort) {
                    this._multisortMap = [];
                }
            },
            _custom_tab_handler: this.dataGridEdit.eventHandlerTab,
            _on_header_click: this.dataGridSort.eventHandlerHeaderClick,
            markSorting: this.dataGridSort.doStartSorting,
            markSingSorting: this.dataGridSort.doStartSingSorting,
            markMultiSorting: this.dataGridSort.doStartMultiSorting,
            createHtmlMarkSotring: this.dataGridSort.addDivInColumnHeader,
            createMarkSorting: this.dataGridSort.doReLabelingSorting,
            mapGroupsCells: this.dataGridGroups.calculationColumnValue
        }, webix.ui.treetable);
    }
}

module.exports = DataGridPrototype;