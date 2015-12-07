/*
The class responsible for editing
*/
class DataGridEdit{
    constructor(){
        webix.UIManager.tabControl = true;
        webix.editors.$popup = {
            text:{
                view:"popup",
                body:{view:"textarea", width:250, height:50}
            },
            date:{
                view:"popup",
                body:{ view:"calendar", icons:true, weekNumber:true, timepicker:true }
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
	 Handling the click event on the button "Start editing"
	*/
    eventEditStart(event,object,cell){
        var isFocus = true;
        this.eachColumn(
            function (columnId){
                this.addCellCss(object.row,columnId,"row-edited");
                var config = this.getColumnConfig(columnId);
                if(typeof config.editor != 'undefined' && isFocus){
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
    eventEditSuccess(event,object,cell){
        this.editStop();
        for(var index in  webix.ARCHIBUS.editRows){
            var editRow = webix.ARCHIBUS.editRows[index];
            if(editRow.id == object.row){
                this.eachColumn(
                    function (columnId){
                        this.removeCellCss(editRow.id,columnId,"row-edited");
                    }
                );
                webix.ARCHIBUS.editRows.splice(index,1);
                webix.ajax().post("server/data/save",  this.getItem(object.row), function(response) {
                    webix.message(response.status);
                });
                this.refresh();
                break;
            }
        }
    }

	/*
	 Handling the click event on the button "Cancel edit"
	*/
    eventEditCancel(event,object,cell){
        this.editStop();
        for(var index in  webix.ARCHIBUS.editRows){
            var editRow = webix.ARCHIBUS.editRows[index];
            if(editRow.id == object.row){
                this.eachColumn(
                    function (columnId){
                        this.removeCellCss(editRow.id,columnId,"row-edited");
                    }
                );
                var dataRow = this.getItem(object.row);
                for(var index in editRow.data){
                    dataRow[index] = editRow.data[index];
                }
                this.updateItem(object.row, dataRow);
                webix.ARCHIBUS.editRows.splice(index,1);
                break;
            }
        }

        for(var index in webix.ARCHIBUS.group.groupTotalLine){
            var id = webix.ARCHIBUS.group.groupTotalLine[index].id;
            this.eachColumn(
                function (columnId){
                    if (columnId == id){
                        var row = object.row;
                        var childs = this.data.getBranch( this.getParentId(row) );
                        var sum = 0;
                        for (var i=0; i<childs.length; i++)
                        {
                            var item = childs[i];
                            sum += item[id]*1;
                        }
                        var idRowParent = this.getParentId(row);
                        var parent = this.getItem(idRowParent);

                        parent[id + 'Sum'] = sum;
                        this.refresh(idRowParent);

                    }
                }
            );

        }
    }

	/*
	 Handling events after have finished editing
	*/
    eventAfterEditStop(state, editor, ignoreUpdate){
        if(state.value != state.old){
            for(var index in  webix.ARCHIBUS.editRows){
                var editRow = webix.ARCHIBUS.editRows[index];
                if(editRow.id == editor.row){
                    var idAdd = true;
                    for(var obj in webix.ARCHIBUS.editRows[index].data){
                        if(obj == editor.column){
                            idAdd = false;
                            break;
                        }
                    }
                    if(idAdd)
                        webix.ARCHIBUS.editRows[index].data[editor.column] = state.old;
                    break;
                }
            }
        }

        for(var index in webix.ARCHIBUS.group.groupTotalLine){
            var id = webix.ARCHIBUS.group.groupTotalLine[index].id;
            if (editor.column == id){
                var row = editor.row;
                var childs = this.data.getBranch( this.getParentId(row) );
                var sum = 0;
                for (var i=0; i<childs.length; i++)
                {
                    var item = childs[i];
                    sum += item[id]*1;
                }
                var idRowParent = this.getParentId(row);
                var parent = this.getItem(idRowParent);

                parent[id + 'Sum'] = sum;
                this.refresh(idRowParent);
                break;
            }
        }
    }

    /*
     Handling the keyboard event "Tab"
     */
    eventHandlerTab(tab, e){
        if (this._settings.editable && !this._in_edit_mode){
            //if we have focus in some custom input inside of datatable
            if (e.target && e.target.tagName == "INPUT") return true;

            var selection = this.getSelectedId(true);
            if (selection.length == 1){
                return false;
            }
        }
        return true;
    }

    /*
     Do perform the formation of the action buttons edits in the column
     */
    renderEditColumn(cellElement, cellInfo){
        if(cellElement.$group){
            return ' ';
        }
        var result = "";
        var isEdit = true;
        for(var index in webix.ARCHIBUS.editRows){
            if(webix.ARCHIBUS.editRows[index].id == cellElement.id){
                return "<img class='editSuccessClass' src='style/icons/success.png'/><img class='editCancelClass' src='style/icons/delete.gif'/>";
            }
        }
        return "<img class='editStartClass' src='style/icons/cog_edit.png'/>";
    }
}

module.exports = DataGridEdit;