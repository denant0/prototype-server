/*
The class responsible for editing
*/
class DataGridEdit{
    constructor () {
        webix.UIManager.tabControl = true;
        webix.editors.$popup = {
            text: {
                view: 'popup',
                body: {
                    view:'textarea',
                    width: 250,
                    height: 50
                }
            },
            date: {
                view: 'popup',
                body: {
                    view: 'calendar',
                    icons: true,
                    weekNumber: true,
                    timepicker: true
                }
            }
        };
        webix.ARCHIBUS.editRows = [];
        webix.ARCHIBUS.editButtonMap = [
            {
                class: 'editStartClass',
                function: this.eventEditStart
            },
            {
                class: 'editSuccessClass',
                function: this.eventEditSuccess
            },
            {
                class: 'editCancelClass',
                function: this.eventEditCancel
            }
        ];
    }

    /*
     Do add editing options in the configuration column
        @configCurrentColumn: the configuration of the current column
        @configColumns: the configuration of all columns filled
        @dataType: the data type
        @loadClass: class manages the loading of data
     */
    addConfigurationEditColumn(configCurrentColumn, configColumns, dataType, loadClass){
        if (dataType) {
            switch (dataType) {
                case 'number':
                    configCurrentColumn.editor = 'text';
                    break;
                case 'integer':
                    configCurrentColumn.editor = 'text';
                    break;
                case 'date':
                    configCurrentColumn.editor = 'date';
                    break;
                case 'text':
                    configCurrentColumn.editor = 'text';
                    break;
                case 'enum':
                    configCurrentColumn.editor = 'combo';
                    webix.ARCHIBUS.data.collection[webix.ARCHIBUS.data.collection.length] = configCurrentColumn.id;
                    loadClass.doLoadCollectionFromServer(configCurrentColumn.id, configColumns);
                    break;
            }
        }
        return configCurrentColumn;
    }

	/*
	 Handling the click event on the button "Start editing"
	*/
    eventEditStart (event,object,cell) {
        var isFocus = true;
        this.eachColumn (
            function (columnId) {
                this.addCellCss(object.row,columnId,"row-edited");
                var config = this.getColumnConfig(columnId);
                if (typeof config.editor != 'undefined' && isFocus) {
                    this.editCell(object.row, columnId);
                    isFocus = false;
                }
            }
        );
        webix.ARCHIBUS.editRows[webix.ARCHIBUS.editRows.length] = {
            id: object.row,
            data: {}
        }
    }

	/*
	 Handling the click event on the button "Successful edit"
	*/
    eventEditSuccess (event,object,cell) {
        this.editStop();
        for (var index in  webix.ARCHIBUS.editRows) {
            var editRow = webix.ARCHIBUS.editRows[index];
            if (editRow.id == object.row) {
                this.eachColumn (
                    function (columnId) {
                        this.removeCellCss(editRow.id,columnId,"row-edited");
                    }
                );
                webix.ARCHIBUS.editRows.splice(index,1);
                this.callEvent("onUpdataData", [this.getItem(object.row)]);
                this.refresh();
                break;
            }
        }
    }

	/*
	 Handling the click event on the button "Cancel edit"
	*/
    eventEditCancel (event,object,cell) {
        this.editStop();
        for (var i in  webix.ARCHIBUS.editRows) {
            var editRow = webix.ARCHIBUS.editRows[i];
            if (editRow.id == object.row) {
                this.eachColumn (
                    function (columnId) {
                        this.removeCellCss(editRow.id,columnId,"row-edited");
                    }
                );
                var dataRow = this.getItem(object.row);
                for (var index in editRow.data) {
                    dataRow[index] = editRow.data[index];
                }
                this.updateItem(object.row, dataRow);
                webix.ARCHIBUS.editRows.splice(i,1);
                break;
            }
        }
        this.eachColumn (
            function (columnId) {
                this.callEvent('onRecalculateTotalColumn', [object.row, columnId]);
            }
        );
    }

	/*
	 Handling events after have finished editing
	*/
    eventAfterEditStop (state, editor, ignoreUpdate) {
        if (state.value != state.old) {
            for (var index in  webix.ARCHIBUS.editRows) {
                var editRow = webix.ARCHIBUS.editRows[index];
                if (editRow.id == editor.row) {
                    var idAdd = true;
                    for (var obj in webix.ARCHIBUS.editRows[index].data) {
                        if (obj == editor.column) {
                            idAdd = false;
                            break;
                        }
                    }
                    if (idAdd) {
                        webix.ARCHIBUS.editRows[index].data[editor.column] = state.old;
                    }
                    break;
                }
            }
        }
        this.callEvent('onRecalculateTotalColumn', [editor.row, editor.column]);
    }

    /*
     Handling the keyboard event "Tab"
     */
    eventHandlerTab (tab, e) {
        if (this._settings.editable && !this._in_edit_mode ){
            if (e.target && e.target.tagName == "INPUT") {
                return true;
            }

            var selection = this.getSelectedId(true);
            if (selection.length == 1) {
                return false;
            }
        }
        return true;
    }

    /*
     Do perform the formation of the action buttons edits in the column
     */
    renderEditColumn (cellElement, cellInfo) {
        if (cellElement.$group) {
            return ' ';
        }
        var result = "";
        for (var index in webix.ARCHIBUS.editRows) {
            if (webix.ARCHIBUS.editRows[index].id == cellElement.id) {
                return "<img class='editSuccessClass' src='style/icons/success.png'/><img class='editCancelClass' src='style/icons/delete.gif'/>";
            }
        }
        return "<img class='editStartClass' src='style/icons/cog_edit.png'/>";
    }
}

module.exports = DataGridEdit;