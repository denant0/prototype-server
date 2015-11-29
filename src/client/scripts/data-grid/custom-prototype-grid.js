webix.protoUI({
    name: 'customDataTable',
    $init:function(config){
        this.___multisort = config.multisort;
        this._multisort_isDelete = false;
        this._multisort_count = 0;
        if(this.___multisort){
            this._multisortMap = [];
        }
    },
    _on_header_click:function(column){
        var col = this.getColumnConfig(column);
        if (!col.sort) return;

        var order = 'asc';
        if(typeof this.___multisort == 'undefined'  || !this.___multisort){
            if (col.id == this._last_sorted)
                order = this._last_order == "asc" ? "desc" : "asc";
        }
        else{
            for(var number in this._multisortMap){
                if(this._multisortMap[number].id == column){
                    order = this._multisortMap[number].dir == "asc" ? "desc" : "asc";
                    break;
                }
            }
        }
        this._sort(col.id, order, col.sort);
    },
    markSorting:function(column, order){
        if(typeof this.___multisort != 'undefined'  && this.___multisort){
            this.markMultiSorting(column,order);
        }
        else{
            this.markSingSorting(column,order);
        }
    },
    markSingSorting: function(column, order){
        if (!this._sort_sign)
            this._sort_sign = webix.html.create("DIV");
        webix.html.remove(this._sort_sign);

        if (order){
            var cell = this._get_header_cell(this.getColumnIndex(column));
            if (cell){
                this._sort_sign.className = "webix_ss_sort_"+order;
                cell.style.position = "relative";
                cell.appendChild(this._sort_sign);
            }
            this._last_sorted = column;
            this._last_order = order;
        } else {
            this._last_sorted = this._last_order = null;
        }
    },
    markMultiSorting: function(column, order){

        if(this._multisortMap.length == 0 && !this._multisort_isDelete){
            this._multisortMap[0] = {
                id: column,
                dir: order,
                html: '',
                onClick: 0,
                numberInQuery: 1
            };
            this.createMarkSorting(0, column, order, true);
        }
        else{
            if(this._multisort_isDelete){
                if(this._multisort_count == 1){
                    this._multisort_count = 0;
                    this._multisort_isDelete = false;
                    this._last_order = '';
                    for(var number in this._multisortMap)
                        this.createMarkSorting(number, this._multisortMap[number].id, this._multisortMap[number].dir, false);
                }
                else{
                    this._multisort_count++;
                }
            }
            else{
                var isAdded = true;
                for(var number in this._multisortMap){
                    var element = this._multisortMap[number];
                    if(element.id != column){
                        this.createMarkSorting(number, element.id, element.dir, false);
                    }
                    else{
                        isAdded = false;
                        this._multisortMap[number].dir = order;
                        this._multisortMap[number].onClick++;
                        this._multisortMap[number].numberInQuery = 1;
                        this.createMarkSorting(number, column, order, true);
                    }
                }
                if(isAdded){
                    this._multisortMap[this._multisortMap.length] = {
                        id: column,
                        dir: order,
                        html: '',
                        onClick: 0
                    };
                    this.createMarkSorting(this._multisortMap.length - 1, column, order, true);
                }
                else{
                    var numberDelete = -1;
                    for(var number in this._multisortMap){
                        if(this._multisortMap[number].onClick == 6){
                            numberDelete = number;
                            break;
                        }
                    }
                    if(numberDelete != -1){
                        //webix.html.remove(this._multisortMap[numberDelete].html);
                        this._multisortMap.splice(numberDelete,1);
                        this._multisort_isDelete = true;
                    }
                }
            }
        }
    },
    createHtmlMarkSotring: function(order){
        var htmlElement = webix.html.create("DIV");
        if (order){
            htmlElement.className = "webix_ss_sort_"+order;
        }
        return htmlElement;
    },
    createMarkSorting: function(index, column, order, isAddLast){
        webix.html.remove(this._multisortMap[index].html);
        this._multisortMap[index].html = this.createHtmlMarkSotring(order);
        if (order){
            var cell = this._get_header_cell(this.getColumnIndex(column));
            if (cell){
                cell.style.position = "relative";
                cell.appendChild(this._multisortMap[index].html);
            }
            if(isAddLast) {
                this._last_sorted = column;
                this._last_order = order;
            }
        }
        else {
            if(isAddLast) {
                this._last_sorted = this._last_order = null;
            }
        }
    },
    _sort:function(col_id, direction, type){
        direction = direction || "asc";
        this.markSorting(col_id, direction);
        if (type == "server"){
            this.loadNext(-1, 0, {
                "before":function(){
                    var url = this.data.url;
                    this.clearAll();
                    this.data.url = url;
                }
            }, 0, 1);
        } else {
            if (type == "text"){
                this.data.each(function(obj){ obj.$text = this.getText(obj.id, col_id); }, this);
                type="string"; col_id = "$text";
            }

            if (typeof type == "function")
                this.data.sort(type, direction);
            else
                this.data.sort(col_id, direction, type || "string");
        }
    },
    mapGroupsCells:function(startrow, startcol, numrows, numcols, callback) {
        if (startrow === null && this.data.order.length > 0) startrow = this.data.order[0];
        if (startcol === null) startcol = this.columnId(0);
        if (numrows === null) numrows = this.data.order.length;
        if (numcols === null) numcols = this._settings.columns.length;

        if (!this.exists(startrow)) return;
        startrow = this.getIndexById(startrow);
        startcol = this.getColumnIndex(startcol);
        if (startcol === null) return;

        for (var i = 0; i < numrows && (startrow + i) < this.data.order.length; i++) {
            var row_ind = startrow + i;
            var row_id = this.data.order[row_ind];
            var item = this.getItem(row_id);
            var col_id = this.columnId(numcols);
            for (var j = 0; j < numcols && (startcol + j) < this._settings.columns.length; j++) {
                var col_ind = startcol + j;
                var col_id = this.columnId(col_ind);
                var flag = true;
                for(var num_mas in webix.groupTotalLine){
                    if(col_id == webix.groupTotalLine[num_mas].id){
                        callback(item[webix.groupTotalLine[num_mas].id+"Sum"]);
                        flag = false;
                    }
                }
                if(flag){
                    item[col_id] = callback(item[col_id], row_id, col_id, i, j);
                }

            }
        }
    },
    _custom_tab_handler:function(tab, e){
        if (this._settings.editable && !this._in_edit_mode){
            //if we have focus in some custom input inside of datatable
            if (e.target && e.target.tagName == "INPUT") return true;

            var selection = this.getSelectedId(true);
            if (selection.length == 1){
                //this.editNext(tab, selection[0]);
                return false;
            }
        }
        return true;
    }
},webix.ui.treetable,webix.PagingAbility);
