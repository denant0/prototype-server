class DataGridSort {
    constructor () {

    }
    /*
     Do perform the formation of the object data to sort and display the marker sorting
		@column: column configuration
		@order: the sort order
     */
    doStartSorting (column, order) {
        if (typeof this.___multisort != 'undefined'  && this.___multisort) {
            this.doStartMultiSorting(column,order);
        } else {
            this.doStartSingSorting(column,order);
        }
    }
    /*
     To perform a single sorting
		@column: column configuration
		@order: the sort order
     */
    doStartSingSorting (column, order) {
        if (!this._sort_sign) {
            this._sort_sign = webix.html.create("DIV");
        }
        webix.html.remove(this._sort_sign);

        if (order) {
            var cell = this._get_header_cell(this.getColumnIndex(column));
            if (cell) {
                this._sort_sign.className = "webix_ss_sort_"+order;
                cell.style.position = "relative";
                cell.appendChild(this._sort_sign);
            }
            this._last_sorted = column;
            this._last_order = order;
        } else {
            this._last_sorted = this._last_order = null;
        }
    }
    /*
     To perform a multi sorting
	 	@column: column configuration
		@order: the sort order
     */
    doStartMultiSorting (column, order) {
        if (this._multisortMap.length == 0 && !this._multisort_isDelete) {
            this._multisortMap[0] = {
                id: column,
                dir: order,
                html: '',
                onClick: 0
            };
            this.doReLabelingSorting(0, column, order, true);
        } else {
            var isAdded = true;
            for (var number in this._multisortMap) {
                var element = this._multisortMap[number];
                if (element.id != column) {
                    this.doReLabelingSorting(number, element.id, element.dir, false);
                } else {
                    isAdded = false;
                    this._multisortMap[number].dir = order;
                    this._multisortMap[number].onClick++;
                    this._multisortMap[number].numberInQuery = 1;
                    this.doReLabelingSorting(number, column, order, true);
                }
            }
            if (isAdded) {
                this._multisortMap[this._multisortMap.length] = {
                    id: column,
                    dir: order,
                    html: '',
                    onClick: 0
                };
                this.doReLabelingSorting(this._multisortMap.length - 1, column, order, true);
            } else {
                this.doRemoveColumn();
            }
        }
    }
    /*
     Do remove a column from sort
     */
    doRemoveColumn () {
        var numberDelete = -1;
        for (var number in this._multisortMap) {
            if (this._multisortMap[number].onClick == 2) {
                numberDelete = number;
                break;
            }
        }
        if (numberDelete != -1) {
            webix.html.remove(this._multisortMap[numberDelete].html);
            this._multisortMap.splice(numberDelete,1);
        }
    }
    /*
     Do add the <div> element for marking the position of the sorting
		@order: the sort order
     */
    addDivInColumnHeader (order) {
        var htmlElement = webix.html.create("DIV");
        if (order) {
            htmlElement.className = "webix_ss_sort_"+order;
        }
        return htmlElement;
    }
    /*
     Do add action in the <div> element for marking the position of the sorting
		@index: the index in the data array of multisort
	 	@column: column configuration
		@order: the sort order
		@isAddLast: clicking on the last element
     */
    doReLabelingSorting (index, column, order, isAddLast) {
        webix.html.remove(this._multisortMap[index].html);
        this._multisortMap[index].html = this.addDivInColumnHeader(order);
        if (order) {
            var cell = this._get_header_cell(this.getColumnIndex(column));
            if (cell) {
                cell.style.position = "relative";
                cell.appendChild(this._multisortMap[index].html);
            }
            if (isAddLast) {
                this._last_sorted = column;
                this._last_order = order;
            }
        }
        else {
            if (isAddLast) {
                this._last_sorted = this._last_order = null;
            }
        }
    }
    /*
     Event handling clicking on the column header
		@column: column configuration
     */
    eventHandlerHeaderClick (column) {
        var col = this.getColumnConfig(column);
        if (!col.sort) {
            return;
        }

        var order = 'asc';
        if (typeof this.___multisort == 'undefined'  || !this.___multisort) {
            if (col.id == this._last_sorted) {
                order = this._last_order == "asc" ? "desc" : "asc";
            }
        } else {
            for (var number in this._multisortMap) {
                if (this._multisortMap[number].id == column) {
                    order = this._multisortMap[number].dir == "asc" ? "desc" : "asc";
                    break;
                }
            }
        }
        this._sort(col.id, order, col.sort);
    }
}

module.exports = DataGridSort;