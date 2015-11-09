;/**
 * 内部使用模块，提供基本的事件处理能力的封装
 * Created by cuikai on 2015/11/8.
 */

(function (wnd, doc,moduleName,thisModuleName) {
    var my = wnd[moduleName][thisModuleName] = {};
    /**
     * DOM事件API封装：添加事件处理函数
     *
     * @param {HTMLElement=} element 要进行事件订阅的html元素
     * @param {string} eventName 事件名
     * @param {Function} callback 回调函数
     ```
     */
    my.addEventListener =function(element, eventName, callback) {
        if (!element) {  return;  }
        try {
            if (element.addEventListener) {
                element.addEventListener(eventName, callback, false);
            }
            else if (element.attachEvent) {
                element.attachEvent('on' + eventName, callback);
            }
        }
        catch (ex) {}
    }

    /**
     * DOM事件API封装：注销事件绑定
     *
     * @param {HTMLElement} element 页面元素
     * @param {string} eventName 事件名
     * @param {Function} callback 回调函数
     */
    my.removeEventListener=function(element, eventName, callback) {
        if (!element) { return; }

        try {
            if (element.removeEventListener) {
                element.removeEventListener(eventName, callback, false);
            }
            else {
                element.detachEvent && element.detachEvent('on' + eventName, callback);
            }
        }
        catch (ex) {}
    }

    var slotSeed=1;
    var ALL_TOKEN='*';

    function EventEmitter(){};
    EventEmitter.prototype	= {
        once: function(evtName, cb){
            return this.on(evtName,cb,1);
        },
        /**
         *
         * 订阅事件
         * @param evtName：事件名
         * @param cb：回调函数
         * @param ttl:可选参数，默认没有ttl限制，必须>0
         * @returns {number}:返回事件槽号,可以唯一标识一个事件回调函数
         */
        on	: function(evtName, cb,/*optional*/ttl){
            this._events = this._events || {};
            this._events[evtName] = this._events[evtName]	|| [];
            cb&&this._events[evtName].push(cb);

            cb&&(cb._slotId=slotSeed)&&ttl&&ttl>0&&(cb._ttl=ttl);
            return slotSeed++;
        },

        /**
         * 取消事件订阅
         * @param evtName:要取消订阅的事件
         * @param cb：要取消订阅的SubscribeId或回调函数
         * @returns {EventEmitter}
         */
        off	: function(evtName, cb){
            this._events = this._events || {};
            if( evtName in this._events === false  )	return;

            var t = typeof cb;
            if(t=="number"){
                for(var i=this._events[evtName].length-1;i>=0;i--){
                    var _item = this._events[evtName][i];
                    if(_item._slotId == cb){
                        this._events[evtName].splice(i, 1);
                        break;
                    }
                }
            }else if( (t=="string" && cb.toLowerCase()=="all") ||(t=="undefined")){
                delete this._events[evtName];
            }else if(t=="function"){

                for(var i=this._events[evtName].length-1;i>=0;i--){
                    var _item = this._events[evtName][i];
                    if(_item.toString() === cb.toString()){
                        //本来想用函数上保存的slotId来标识，但是很可能函数是反复创建的函数对象
                        //if(_item._slotId === cb._slotId){
                        this._events[evtName].splice(i, 1);
                        break;
                    }
                }
            }else{
                throw new Error("second param must be number/function/string")
            }
            return this;
        },
        /**
         * 主动发射事件+参数
         * @param evtName：事件名
         * @param args:可变的参数比如:emit("foo",1,2,3),那么on("foo",function(a,b,c){这里面a=1,b=2,c=3})
         */
        emit	: function(evtName /* , args... */){
            this._events = this._events || {};
            var cb,
                cut=false;//由于是正向遍历，且遍历过程中可能删除回调数组元素，所以需要标记是否删除，来控制for循环

            function _dispatch(subEvtName){
                for(var i = 0, j=this._events[subEvtName].length; i<j;(cut&&j--) || i++){
                    cut = false;
                    (cb=this._events[subEvtName][i])&&(cb.apply(this, Array.prototype.slice.call(arguments, 1)));
                    //do with TTL
                    cb && Object.prototype.hasOwnProperty.call(cb,"_ttl") && (--cb._ttl<=0) && (cut = true) &&  this._events[subEvtName].splice(i, 1);
                }
            }

            //如果 要发射的事件名称被订阅过，并且该事件并非“*”事件，则开始发射（避免 on("*")触发2次）
            if( evtName in this._events && evtName !==ALL_TOKEN){
                _dispatch.apply(this,Array.prototype.slice.call(arguments));
            }
            //无论什么事件都触发 on("*")
            if( ALL_TOKEN in this._events ){
                _dispatch.apply(this,[ALL_TOKEN].concat(Array.prototype.slice.call(arguments)));
            }

            //for(var i = 0, j=this._events[evtName].length; i<j;(cut&&j--) || i++){
            //    cut = false;
            //    (cb=this._events[evtName][i])&&(cb.apply(this, Array.prototype.slice.call(arguments, 1)));
            //    //do with TTL
            //    cb && Object.prototype.hasOwnProperty.call(cb,"_ttl") && (--cb._ttl<=0) && (cut = true) &&  this._events[evtName].splice(i, 1);
            //}
            return this;
        }
    };


    my.EventEmitter	= EventEmitter;
    my.mixin	= function(destObject){
        var props	= ['on','once', 'off', 'emit'];
        for(var i = 0; i < props.length; i ++){
            if( typeof destObject === 'function' ){
                destObject.prototype[props[i]]	= EventEmitter.prototype[props[i]];
            }else{
                destObject[props[i]] = EventEmitter.prototype[props[i]];
            }
        }
    }
})(window,document,'_webAnalyst','_eventHub');
;/**
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

;/**
 * 提供基本的事件追踪数据发送API
 * Created by cuikai on 2015/11/7.
 */


(function (wnd, doc,moduleName,evtModuleName,trackerModuleName,taskQueueName) {
    var tracker = wnd[moduleName][trackerModuleName],
        evt = wnd[moduleName][evtModuleName];

    var eventTrackerObj = tracker.createTracker('event',{
        category:"ct",
        action:"at",
        tag:'t',
        value:'v'
    },'http://www.adsring.com/');

    //提供命令:客户端可以这样调用：_wa('event','send',category, action, tag, value,function(isSuccess){})
    eventTrackerObj.send = function (category, action, tag, value,cb) {
        return this._send({
            category:category,
            action:action,
            tag:tag,
            value:value
        },cb);
    };

    //注册
    tracker.setTracker("event",eventTrackerObj)
})(window,document,'_webAnalyst','_eventHub','_tracker','_wa');
;/**
 * this file gives some built-in trackers
 * Created by cuikai on 2015/11/7.
 */

;/**
 * Created by cuikai on 2015/11/7.
 */

;/**
 * 管理所有的tracker
 * 从脚本加载之前就准备好的任务队列里取出任务，进行执行
 * Created by cuikai on 2015/11/8.
 */


(function (wnd, doc,moduleName,evtModuleName,trackerModuleName,taskQueueName) {
    var tracker = wnd[moduleName][trackerModuleName];
    /**
     * 起始时间
     */
    var _startTime = (wnd[moduleName] && wnd[moduleName].l) || (1*new Date());

    var ie = wnd.attachEvent && !window.opera;


    function entry(trackerName,method /*,param1.param2*/){
        //去除2个参数，留下调用方法的参数列表
        var args = Array.prototype.slice.call(arguments).splice(2);
        var trackers = entry.getTracker(trackerName);

        if(trackers){
            //trackers可能有多个，统一转化为数组来处理
            if( Object.prototype.toString.apply(trackers) !== '[object Array]'){
                trackers = [trackers];
            }
            for(var i=0,j=trackers.length;i<j;i++){
                var tracker = trackers[i];
                //如果tracker有这个方法,并且不是Tracker.prototype的方法
                if (tracker[method]&&  tracker.constructor.prototype[method] == undefined && typeof tracker[method] ==='function') {
                    var methodFunc = tracker[method];
                    methodFunc.apply(tracker, args);
                }
                else {
                    // 暂时还无法处理的方法
                    tracker.pendingList.push(args);
                }
            }
        }
    }

    /**
     * 根据trackerName获取一个tracker
     * @param trackerName
     * @returns {*}
     */
    entry.getTracker = function(trackerName) {
      return tracker.getTracker(trackerName);
    };

    //处理之前留在_wa队列里的请求
    var oldObjectName =wnd[moduleName]['queueName'];
    var oldObject = wnd[oldObjectName];
    if (oldObject) {
        // 处理临时alog对象
        var items = oldObject.q || [];
        oldObject.q = null; // 清理内存
        for (var p in entry) {
            if (entry.hasOwnProperty(p)) {
                oldObject[p] = entry[p];
            }
        }
        entry.q = {
            // 接管之前的定义，如果此时还通过.q来push数据，相当于调用entry
            push: function (args) {
                entry.apply(entry, args);
            }
        };

        // 开始处理缓存命令
        for (var i = 0; i < items.length; i++) {
            entry.apply(entry, items[i]);
        }
    }
    //覆盖_wa
    wnd[oldObjectName] = entry;
    //snippet/boot.js 无论执行顺序如何，任务队列都保存在window['_wa']里，解析这些任务并且执行


})(window,document,'_webAnalyst','_eventHub','_tracker','_wa');