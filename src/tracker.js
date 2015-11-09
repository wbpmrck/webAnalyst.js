/**
 * this is the tracker definition
 * Created by cuikai on 2015/11/7.
 */

(function (wnd, doc, moduleName, thisModuleName,evtModuleName) {
    var my = wnd[moduleName][thisModuleName] = {},
        evt = wnd[moduleName][evtModuleName];
    /**
     * 起始时间
     */
    var _startTime = (wnd[moduleName] && wnd[moduleName].l) || (1*new Date());
    /**
     * session:每次页面只要不重新刷新，sid就不变化
     */
    var sid =  ((+new Date()).toString(36) + Math.random().toString(36).substr(2, 4));

    function timestamp(now) {
        return (now || new Date()) - _startTime;
    }
    /**
     * 合并两个对象
     *
     * @param {Object} a 对象1
     * @param {Object} b 对象2
     * @return {Object} 返回合并后的对象
     */
    function merge(a, b) {
        var result = {};
        for (var p in a) {
            if (a.hasOwnProperty(p)) {
                result[p] = a[p];
            }
        }
        for (var q in b) {
            if (b.hasOwnProperty(q)) {
                result[q] = b[q];
            }
        }
        return result;
    }

    function Tracker(name,protocolParam,reportUrl){
        var self = this;
        evt.mixin(Tracker);

        self.name = name;//tracker name
        self.reportUrl=reportUrl; //tracker上报的url
        self.protocolParam =protocolParam||{};//协议字段. key:name,value:simpleName.send的data数据中，只有符合协议字段的内容才会被发送

        self.pendingList=[];//储存tracker还无法处理的请求(可能是外部调用的方法tracker不支持，也可能是异步处理的任务)
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
        var url  =self.reportUrl;
        if (!url || !data) {
            return;
        }
        //过滤不上报的字段，并获取缩写
        data = self._retrieveData(data);

        //追加时间戳,hitType,sid
        data = merge({
            ':0': timestamp().toString(36),
            ':1': self.name,
            ':2': sid
        }, data);


        //发送事件
        try{
            self.emit("beforeSend",url,data);
        }catch(e){}

        // @see http://jsperf.com/new-image-vs-createelement-img
        var image = doc.createElement('img');

        var items = [];
        for (var key in data) {
            if (data[key]) {
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
     * @returns {Tracker}
     */
    my.createTracker = function (name, protocolParam, reportUrl) {
        return new Tracker(name,protocolParam, reportUrl);
    }

    //维护当前所有的tracker对象
    var _trackers={};//{"name":<Tracker>}

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

})(window,document,'_webAnalyst','_tracker','_eventHub');
