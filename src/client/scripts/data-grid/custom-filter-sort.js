/*
 Load data from the response received
 */
webix.TreeDataLoader._loadNextA = function(count, start, callback, url, now){
    var config = this._settings;
    if (config.datathrottle && !now){
        if (this._throttle_request)
            window.clearTimeout(this._throttle_request);
        this._throttle_request = webix.delay(function(){
            this.loadNext(count, start, callback, url, true);
        },this, 0, config.datathrottle);
        return;
    }

    if (!start && start !== 0) start = this.count();
    if (!count)
        count = config.datafetch || this.count();

    this.data.url = this.data.url || url;
    if (this.callEvent("onDataRequest", [start,count,callback,url]) && this.data.url)
        this.data.feed.call(this, start, count, callback);
};

/*
 Create form the flow of the request
 */
webix.TreeDataLoader._feed_commonA = function(from, count, callback){
    var url = this.data.url;
    if (from<0) from = 0;
    var final_callback = [
        this._feed_callback,
        callback
    ];
    if (url && typeof url != "string"){
        var details = { from:from, count:count };
        if (this.getState){
            var state = this.getState();
            details.sort = state.sort;
            details.filter = state.filter;
        }

        this.load(url, final_callback, details);
    } else {
        var finalurl = url+((url.indexOf("?")==-1)?"?":"&")+(this.count()?("continue=true"):"");
        if (count != -1)
            finalurl += "&count="+count;
        if (from)
            finalurl += "&start="+from;

        if (this.getState){
            var state = this.getState();
            if (state.sort)
                for (var key in state.sort)
                    finalurl += "&sort["+state.sort[key].id+"]="+state.sort[key].dir;
            if (state.filter)
                for (var key in state.filter)
                    finalurl +="&filter["+key+"]="+state.filter[key];
        }
        this.load(finalurl, final_callback);
    }
};

/*
 Data loading
 */
webix.TreeDataLoader._feed_callback = function(){
    //after loading check if we have some ignored requests
    var temp = this._load_count;
    var last = this._feed_last;
    this._load_count = false;
    if (typeof temp =="object" && (temp[0]!=last[0] || temp[1]!=last[1]))
        this.data.feed.apply(this, temp);	//load last ignored request
};

webix.TreeDataLoader.load = function(url,call){
    var ajax = webix.AtomDataLoader.load.apply(this, arguments);

    //prepare data feed for dyn. loading
    if (!this.data.url)
        this.data.url = url;

    return ajax;
};


webix.DataState = {
    getState:function(){
        var cols_n = this.config.columns.length;
        var columns = this.config.columns;
        var settings = {
            ids:[],
            size:[],
            select:this.getSelectedId(true),
            scroll:this.getScrollState(),
            sort: this._multisortMap
        };
        for(var i = 0; i < cols_n; i++){
            settings.ids.push(columns[i].id);
            settings.size.push(columns[i].width);
        }
        if(this.___multisort){
            if(this._last_sorted){
                var isAdded = true;
                if(settings.sort.length == 0){
                    settings.sort[settings.sort.length] = {
                        id:this._last_sorted,
                        dir:this._last_order
                    };
                }
                else{
                    for(var numberSort in settings.sort){
                        if(settings.sort[numberSort].id == this._last_sorted){
                            settings.sort[numberSort].dir = this._last_order;
                            isAdded = false;
                            break;
                        }
                    }
                    if(isAdded){
                        settings.sort[settings.sort.length] = {
                            id:this._last_sorted,
                            dir:this._last_order
                        };
                    }
                }
            }
            this._multisortMap =    settings.sort;
        }
        else{
            if(this._last_sorted){
                settings.sort={
                    id:this._last_sorted,
                    dir:this._last_order
                };
            }
        }

        if (this._filter_elements) {
            var filter = {};
            var any_filter = 0;
            for (var key in this._filter_elements) {
                if (this._hidden_column_hash[key]) continue;

                var f = this._filter_elements[key];
                f[1].value = filter[key] = f[2].getValue(f[0]);
                any_filter = 1;
            }
            if (any_filter)
                settings.filter=filter;
        }

        settings.hidden = [];
        for (var key in this._hidden_column_hash)
            settings.hidden.push(key);

        return settings;
    }
};