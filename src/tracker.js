/**
 * this is the tracker definition
 * Created by cuikai on 2015/11/7.
 */

(function (wnd, doc, moduleName, thisModuleName,utilModuleName) {
    var my = wnd[moduleName][thisModuleName] = {},
        util = wnd[moduleName][utilModuleName];
    /**
     * 起始时间
     */
    var _startTime = (wnd[moduleName] && wnd[moduleName].l) || (1*new Date());
    /**
     * session:每次页面只要不重新刷新，sid就不变化
     */
    var sid =  ((+new Date()).toString(36) + Math.random().toString(36).substr(2, 4));

    /**
     * 暴露sid数值给外部获取
     * @returns {string}
     */
    util.getTrackerSid = function () {
        return sid;
    }
    function timestamp(now) {
        return (now || new Date()) - _startTime;
    }


    function Tracker(name,protocolParam,reportUrl,isEnable){
        var self = this;
        util.evtMixin(Tracker);

        self.name = name;//tracker name
        self.reportUrl=reportUrl; //tracker上报的url
        self.protocolParam =protocolParam||{};//协议字段. key:name,value:simpleName.send的data数据中，只有符合协议字段的内容才会被发送

        self.pendingList=[];//储存tracker还无法处理的请求(可能是外部调用的方法tracker不支持，也可能是异步处理的任务)
        self.enable = isEnable === undefined?true:isEnable;//默认开启

        //保存用户使用_wa(trackerName,'set',xxx,xxx)后设置的自定义属性
        self.props={
            id:'',//可选参数，如果不为空，则tracker在发送sid之前，会加上这个前缀
            aid:undefined,//当前用户正在进行的动作编号，可选参数，如果不为空，则tracker在发送数据前，会加上这个
            //site是用户在监控平台上，创建要监控的网站后，得到的一个网站编码，后台通过网站编码可以知道是哪个用户的哪个网站
            site : ''//默认tracker不知道site是什么，需要用户使用_wa('*','set','site',XXXX)去初始化
        };
    }
    Tracker.prototype.setEnable = function (e){
        this.enable = !!e;
    };
    Tracker.prototype.setReportUrl = function (url){
        this.reportUrl = url;
    };


    /**
     * 提供用户自定义属性的接口
     * @param key
     * @param val
     */
    Tracker.prototype.set = function (key,val) {
        if(key && val!==undefined){
            this.props[key] = val;
        }
    }
    /**
     * 提供用户获取自定义属性的接口
     * @param key
     * @param val
     */
    Tracker.prototype.get = function (key) {
        if(key){
            return this.props[key];
        }
    }

    /**
     * 根据传输协议定义，获取data中需要report到服务端的字段个数、字段名
     * @param data
     * @returns {*}
     */
    Tracker.prototype._retrieveData = function (data) {
        var self = this;//save the this ref
        if (!self.protocolParam) {
            return data;
        }
        var result = {};
        for (var p in data) {
            if (self.protocolParam.hasOwnProperty(p)) {

                //替换占位符
                util.replaceHolder()
                result[self.protocolParam[p]] = data[p];
            }
        }
        return result;
    }
    /**
     * 执行发送
     * @param data
     * @param cb
     */
    Tracker.prototype._send = function(data,cb) {
        var self = this;//save the this ref
        //check enable
        if(!self.enable){return;}

        var url  =self.reportUrl;
        if (!url || !data) {
            return;
        }
        //过滤不上报的字段，并获取缩写
        data = self._retrieveData(data);


        //追加时间戳,hitType,sid,url,动作编号等
        data = util.merge(data,{
            '_a': self.props.aid,
            '_u': location.href,
            '_s': self.props.site,
            //'_t': timestamp().toString(36),
            //'_t': (+new Date()).toString(36),
            '_t': +new Date(),
            '_n': self.name,
            '_i': self.props.id?self.props.id+'_'+sid:sid
        });


        //发送事件
        try{
            self.emit("beforeSend",url,data);
        }catch(e){}

        // @see http://jsperf.com/new-image-vs-createelement-img
        var image = doc.createElement('img');

        var items = [];
        for (var key in data) {
            if (undefined !== data[key]) {
                items.push(key + '=' + encodeURIComponent(data[key]));
            }
        }

        image.onload = function () {
            image.onload = null;
            cb && cb(true);

        };
        image.onerror = function () {
            image.onerror = null;
            cb && cb(false);
        };

        image.src = url + (url.indexOf('?') < 0 ? '?' : '&') + items.join('&');
        //发送事件
        try{
            self.emit("afterSend",url,data);
        }catch(e){}
    };


    /**
     * 暴露方法:创建tracker
     * @param name
     * @param protocolParam
     * @param reportUrl
     * @param enable
     * @returns {Tracker}
     */
    my.createTracker = function (name, protocolParam, reportUrl,enable) {
        return new Tracker(name,protocolParam, reportUrl,enable);
    }

    //维护当前所有的tracker对象
    var _trackers={};//{"name":<Tracker>}

    /**
     * 提供外部一个遍历tracker对象的机会
     * @param iterator:function(trackerName,trackerObj)
     */
    my.eachTracker = function (iterator) {
        for(var t in _trackers){
            iterator && iterator(t,_trackers[t])
        }
    }
    /**
     * 注册全局的tracker对象，以便于在_wa()方法中使用
     * @param name
     * @param obj
     */
    my.setTracker = function (name, obj) {
        if(!_trackers.hasOwnProperty(name)){
            _trackers[name] = obj;
        }
    }
    /**
     * 获取tracker
     * 1 默认name为default
     * 2 传入*可以得到所有tracker
     * @param trackerName
     * @returns {*}
     */
    my.getTracker = function (trackerName) {
        trackerName = trackerName || 'default';
        if (trackerName === '*') {
            var result = [];
            for (var p in _trackers) {
                if (_trackers.hasOwnProperty(p)) {
                    result.push(_trackers[p]);
                }
            }
            return result;
        }else{
            return _trackers[trackerName]
        }
    }

})(window,document,'_webAnalyst','_tracker','_util');
