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
            if (state.sort){
                if(typeof this.___multisort != 'undefined'  && this.___multisort){
                    for (var key in state.sort)
                        finalurl += "&sort["+state.sort[key].id+"]="+state.sort[key].dir;
                }
                else{
                    finalurl += "&sort["+state.sort.id+"]="+state.sort.dir;
                }

            }

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

webix.TreeDataLoader._onLoad = function(text,xml,loader){
    var data;
    if (loader === -1)
        data = this.data.driver.toObject(xml);
    else {
        //ignore data loading command if data was reloaded
        this._ajax_queue.remove(loader);
        data = this.data.driver.toObject(text,xml);
    }

    if (data)
        this.data._parse(data);
    else
        return this._onLoadError(text, xml, loader);

    //data loaded, view rendered, call onready handler
    this._call_onready();

    this.callEvent("onAfterLoad",[]);
    this.waitData.resolve();
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
        if(typeof this.___multisort == 'undefined'  || !this.___multisort){
            if(this._last_sorted) {
                settings.sort = {
                    id: this._last_sorted,
                    dir: this._last_order
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

webix.AtomDataLoader.url_setter = function(value){
    if (typeof value == "string" && value.indexOf("->") != -1){
        var parts = value.split("->");
        value = webix.proxy(parts[0], parts[1]);
    }
    
    if (!this._ready_for_data) return value;
    this.load(value, this._settings.datatype);
    return value;
};