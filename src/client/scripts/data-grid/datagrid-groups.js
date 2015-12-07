/*
The class responsible for the grouping of data
*/
class DataGridGroups{
    constructor(){
        webix.ARCHIBUS.group = {};
        webix.ARCHIBUS.group.tooltip = {};

        webix.ui.datafilter.sumTotalGroup =
        {
            getValue: function (node) {
                return node.firstChild.innerHTML;
            },
            setValue: function(){},
            refresh: function (master, node, value) {
                var result = 0;
                master.calculationColumnValue(null, value.columnId, null, 1, function (value) {
                    value = value*1;
                    if (!isNaN(value)) {
                        result += value;
                    }

                    return value;
                });

                if (value.format) {
                    result = value.format(result);
                }
                if (value.template) {
                    result = value.template({value:result});
                }
                node.firstChild.innerHTML = result;
            },
            trackCells:true,
            render: function (master, config) {
                if (config.template) {
                    config.template = webix.template(config.template);
                }
                return "";
            }
        };
    }
	/*
	Do perform the configuration of the grid to group the data
		@groupId: the ID of the column by which want to group data
		@groupHeader: column IDs for which want to calculate the total amount
	*/
    configureGroup (groupId, groupHeader) {
        var configurationGroup = {
            $group: {}
        };

        if (groupId) {
            configurationGroup.$group.by = groupId;
        }
        if (groupHeader) {
            configurationGroup.$group.map = {};
            webix.ARCHIBUS.group.groupTotalLine = groupHeader;
            for (var i in groupHeader) {
                configurationGroup.$group.map[groupHeader[i].id + 'Sum'] = [groupHeader[i].id, 'sum'];
            }
        }
        return configurationGroup;
    }	
	/*
	Do perform the configuration columns to display the total amount of column data
		@webixGroupBy: configuration columns to display the total amount of column data
		@ARCHIBUSColumn: the configuration column 
	*/
    configureTotalGroup (webixGroupBy, ARCHIBUSColumn) {
        var configurationTotalGroup = webixGroupBy;

        if (!configurationTotalGroup.header) {
            configurationTotalGroup.header = [];
        }
        var index = configurationTotalGroup.header.length;
        configurationTotalGroup.header[index] = {};
        configurationTotalGroup.header[index].id = ARCHIBUSColumn.id;
        configurationTotalGroup.header[index].title = ARCHIBUSColumn.title;
        configurationTotalGroup.header[index].type = ARCHIBUSColumn.dataType;

        return {
            footer: { content:"sumTotalGroup" },
            header: configurationTotalGroup
        }
    }
    /*
     Do perform the formation of column for groups
     */
    renderColumnGroup (cellElement, cellInfo, cellValue, b, rowNumber) {
        if (cellElement.$group) {
            var count = cellElement.$count;
            var result = cellInfo.treetable(cellElement, cellInfo) + " " + this.id +": " + cellElement.value + " ( " + count + " assets )";
            var freeItems = webix.ARCHIBUS.pageSize - rowNumber;
            if(cellElement.open){
                if (freeItems < cellElement.$count ){
                    webix.ARCHIBUS.group.tooltip[cellElement.id] = true;
                }  else {
                    webix.ARCHIBUS.group.tooltip[cellElement.id] = false;
                }
            } else {
                webix.ARCHIBUS.group.tooltip[cellElement.id] = false;
            }
            return result;
        }
        return cellValue;
    }
    /*
     Do perform the formation of the cell in the column
     */
    renderColumnsCell (cellElement, cellInfo, cellValue) {
        if (cellElement.$group) {
            var result = "<span>";
            for (var i in webix.ARCHIBUS.group.groupTotalLine) {
                if (webix.ARCHIBUS.group.groupTotalLine[i].id == this.id) {
                    if (webix.ARCHIBUS.group.groupTotalLine[i].type == 'number') {
                        result += "Total: " + webix.i18n.numberFormat(cellElement[webix.ARCHIBUS.group.groupTotalLine[i].id+"Sum"]);
                    } else {
                        result += "Total: " + cellElement[webix.ARCHIBUS.group.groupTotalLine[i].id+"Sum"];
                    }
                }
            }
            result += "</span>";
            return result;
        }
        return cellValue;
    }

    /*
     Do perform calculations on data in column
     */
    calculationColumnValue (startrow, startcol, numrows, numcols, callback) {
        if (startrow === null && this.data.order.length > 0) {
            startrow = this.data.order[0];
        }
        if (startcol === null) {
            startcol = this.columnId(0);
        }
        if (numrows === null) {
            numrows = this.data.order.length;
        }
        if (numcols === null) {
            numcols = this._settings.columns.length;
        }

        if (!this.exists(startrow)) {
            return;
        }
        startrow = this.getIndexById(startrow);
        startcol = this.getColumnIndex(startcol);
        if (startcol === null) {
            return;
        }

        for (var i = 0; i < numrows && (startrow + i) < this.data.order.length; i++) {
            var row_ind = startrow + i;
            var row_id = this.data.order[row_ind];
            var item = this.getItem(row_id);
            var col_id = this.columnId(numcols);
            for (var j = 0; j < numcols && (startcol + j) < this._settings.columns.length; j++) {
                var col_ind = startcol + j;
                var col_id = this.columnId(col_ind);
                var flag = true;
                for (var num_mas in webix.ARCHIBUS.group.groupTotalLine) {
                    if (col_id == webix.ARCHIBUS.group.groupTotalLine[num_mas].id) {
                        callback(item[webix.ARCHIBUS.group.groupTotalLine[num_mas].id+"Sum"]);
                        flag = false;
                    }
                }
                if (flag) {
                    item[col_id] = callback(item[col_id], row_id, col_id, i, j);
                }
            }
        }
    }

    /*
     Recalculate the total column
        @row: the grid row
        @column: the grid column
     */
    recalculateTotalColumn (row, column) {
        for (var index in webix.ARCHIBUS.group.groupTotalLine) {
            var id = webix.ARCHIBUS.group.groupTotalLine[index].id;
            if (column == id) {
                var childs = this.data.getBranch( this.getParentId(row) );
                var sum = 0;
                for (var i=0; i<childs.length; i++) {
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

}

module.exports = DataGridGroups;