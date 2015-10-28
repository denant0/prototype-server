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
                finalurl += "&sort["+state.sort.id+"]="+state.sort.dir;
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