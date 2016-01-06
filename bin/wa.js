;/**
 * 内部使用模块，提供基本的事件处理能力的封装
 * Created by cuikai on 2015/11/8.
 */

(function (wnd, doc,moduleName,thisModuleName) {
    var my = wnd[moduleName][thisModuleName] = {},
        wa = wnd[moduleName];


    var slotSeed=1;
    var ALL_TOKEN='*';

    /**
     * util保存一些常用的函数，其他模块需要使用可以直接获取
     *
     * @notice:由于property无法压缩，所以源码采用尽量简写的方式，通过注释表明实际方法名
     *
     * @type {{}}
     * @private
     */
    /**
     * DOM事件API封装：添加事件处理函数
     *
     * @param {HTMLElement=} element 要进行事件订阅的html元素
     * @param {string} eventName 事件名
     * @param {Function} callback 回调函数
     ```
     */
    /*addEventListener*/
    my.on=function(element, eventName, callback) {
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
    };

    /**
     * DOM事件API封装：注销事件绑定
     *
     * @param {HTMLElement} element 页面元素
     * @param {string} eventName 事件名
     * @param {Function} callback 回调函数
     */
    /*removeEventListener*/
    my.off=function(element, eventName, callback) {
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
    };
    my.copyObj = function (obj) {
        var r;
        if(obj){
            r ={};
            for(var i in obj){
                r[i] = obj[i];
            }
        }
        return r;
    }
    /**
     * 合并两个对象(b will overwrite a)
     *
     * @param {Object} a 对象1
     * @param {Object} b 对象2
     * @return {Object} 返回合并后的对象
     */
    my.merge = function(a, b) {
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
    };
    //用于替换java的properties风格的占位符 ${xxx}
    var _regP = /(\$)\s*\s*({(?:[^\{}\r\n\f]|\\[\s\S])*})\s*/g;
    /**
     * 调用该方法完成str内部占位符的替换
     * @param str
     * @param fn:function(holder){return 'replacedString'}
     */
    my.replaceHolder = function(str,fn){
        str && str.replace(_regP, function (a,b,c) {
            return fn(c.substr(1,c.length-2))
        });
    };
    my.isNumber =function(obj) { return !isNaN(parseFloat(obj)) }

    /**
     * 获取当前时间(以ms表示),最大精确到小数点后2位
     * 注意，如果浏览器支持performance.now,会使用,否则使用Date
     * @returns {number}
     */
    my.nowInMS = function () {
        if(wnd.performance){
            return performance.now()
        }else{
            return +(new Date())
        }
    }
    /**
     * 通过传入的DOM元素得到该元素在页面上的唯一定位信息：
     * 1、如果有id,则返回id
     * 2、如果没有id,则向上查找parent:
     *  如果该parent有若干个兄弟，则标注该parent是第几个兄弟
     *  一直向上查找到有id的parent，或者到达body为止
     * @param dom
     */
    my.locateDOM = function (dom) {
        var l="",
            pl;
        if(dom){
            if(dom.getAttribute){
                l =dom.getAttribute("id");
                //如果dom没有定义id，则尝试从父元素来定位它自己
                if(l===null){
                    //先获取父元素的定位信息
                    pl = my.locateDOM(dom.parentNode);
                    //再获取自己在父元素的同类子元素中，是第几个
                    var sibling = dom.previousSibling,
                        count=0;
                    //遍历所有在前面的“元素”类兄弟
                    while (true) {
                        if(sibling){
                            if(sibling.nodeType===1 && sibling.tagName.toLowerCase() === dom.tagName.toLowerCase()){
                                //如果是元素类节点，且元素名和dom一样
                                count++;
                            }
                            sibling = sibling.previousSibling;
                        }else{
                            //没有前面的兄弟了，查找结束
                            break;
                        }
                    }
                    l=[pl,'>',dom.tagName.toLowerCase(),'[',count,']'].join('')
                }else{
                    //如果有id,则用#表示id
                    l="#"+l;
                }
            }else{
                l = dom.nodeName
            }
        }
        return l;
    }

    /**
     * 注意，这个domReady是为了检测DOMContentLoad时间而设计，为尽量精确，所以没有使用计时器触发回调.和jquery等库的方式不同
     * @param cb
     */
    my.domReady = function (cb) {
        var d = wnd.document,
            done = false;
        if(d.readyState === "complete"){
            cb && cb()
        }else if(d.addEventListener){
            // Standards-based browsers support DOMContentLoaded
            my.on(d,'DOMContentLoaded',cb)
        }else{
            // If IE
            // only fire once
            var fire = function () {
                if (!done) {
                    done = true;
                    cb && cb();
                }
            };
            // polling for no errors
            (function () {
                try {
                    // throws errors until after ondocumentready
                    d.documentElement.doScroll('left');
                } catch (e) {
                    setTimeout(arguments.callee, 50);
                    return;
                }
                // no errors, fire
                fire();
            })();

            // trying to always fire before onload
            my.on(d,'readystatechange',function() {
                if (d.readyState == 'complete') {
                    my.off(d,'readystatechange',arguments.callee)
                    fire();
                }
            });
        }
    };

    /**
     * _info里保存一些对浏览器分析的结果，其他模块中如果需要使用，可以直接使用
     */
    var n = navigator,
        d = document,
        b = d.body;
    wa._info ={
        //脚本被加载的开始时间
        start:(wnd[moduleName] && wnd[moduleName].l) || (1*new Date()),
        cookieEnabled:+n.cookieEnabled,
        javaEnabled:+n.javaEnabled(),
        language : n.language || n.browserLanguage || n.systemLanguage || n.userLanguage || "",
        //是否ie浏览器
        ie :+!!(wnd.attachEvent && !wnd.opera) ,
        //是否opera
        opera : +!!(wnd.opera)
    };

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
    my.evtMixin	= function(destObject){
        var props	= ['on','once', 'off', 'emit'];
        for(var i = 0; i < props.length; i ++){
            if( typeof destObject === 'function' ){
                destObject.prototype[props[i]]	= EventEmitter.prototype[props[i]];
            }else{
                destObject[props[i]] = EventEmitter.prototype[props[i]];
            }
        }
    }
})(window,document,'_webAnalyst','_util');
;/**
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

;/**
 * Created by cuikai on 2015/11/12.
 */

;/**
 * 提供基本的事件追踪数据发送API
 * Created by cuikai on 2015/11/7.
 */


(function (wnd, doc,moduleName,utilModuleName,trackerModuleName,taskQueueName) {
    var tracker = wnd[moduleName][trackerModuleName],
        _wa = wnd[taskQueueName],
        util = wnd[moduleName][utilModuleName];

    var _name='event',
        trackerObj = tracker.createTracker(_name,{
            category:"c",//内置的分类:'_auto'
            action:"a",
            tag:'t',
            value:'v',
            x:'x',
            y:'y',
            dom:'d'
    },'../../_wa.gif',true);//事件跟踪默认开启

    //提供命令:客户端可以这样调用：_wa('event','send',category, action, tag, value,function(isSuccess){})
    //        也可以这样调用：_wa('event','send',{category:1, action:2, tag:3, value:4},function(isSuccess){})
    /**
     * 记录事件日志
     * @param category:事件分类
     * @param action：动作类型
     * @param tag：标签
     * @param value：动作价值
     * @param x：x坐标
     * @param y：y坐标
     * @param dom：dom对象类型+id
     * @param cb：记录后的回调
     */
    trackerObj.send = function (category, action, tag, value,x,y,dom,cb) {
        //使用对象传参
        if(typeof category ==='object'){
            cb = action;
            return  this._send(category,cb);
        }else{
            return this._send({
                category:category,
                action:action,
                tag:tag,
                value:value,
                x:x,
                y:y,
                dom:dom
            },cb);
        }
    };

    var d=document,
        b = d.body;

    var
        /**
         * 递归的向上查找某个属性，并使用指定字符进行拼接
         * @param dom
         * @param pName
         * @param splitter
         * @param defaultValue
         * @private
         */
        _recursiveGetAttr = function(dom,pName,splitter,defaultValue){
            var l=defaultValue,
                pl;
            if(dom) {
                if (dom.getAttribute) {
                    l = dom.getAttribute(pName);
                    //如果本元素没有禁用向上递归
                    //wa-inherit-disable="all":全部禁止
                    var disable = dom.getAttribute("wa-inherit-disable")||"",
                        iht = disable.split(",");

                    //wa-inherit-disable="a,b,c" ... 禁止对指定这些属性的查找
                    for(var i in iht){
                        if(iht[i]===pName){
                            disable=1;
                            break;
                        }
                    }
                    if(disable!=="all" && disable!==1){
                        //获取父元素的attr信息
                        pl = _recursiveGetAttr(dom.parentNode,pName,splitter,defaultValue);
                    }

                    if(l){
                        if(pl!==undefined && pl !== null && pl!==""){
                            l= pl+splitter+l;
                        }
                    }else{
                        l=pl;
                    }

                }
            }
            return l===null||l===undefined?defaultValue:l;
        },

        _getTagInfo = function (dom) {
            return _recursiveGetAttr(dom,"wa-tags",">","");
            //return dom.getAttribute("_waTags")||'';
        },
        _getValueInfo = function (dom) {
            return _recursiveGetAttr(dom,"wa-value",">",undefined);
            //if(!dom){
            //    return 1
            //}
            //return parseInt(dom.getAttribute("_waValue"))||1;
        },
        _getActionInfo = function (dom) {
            return _recursiveGetAttr(dom,"wa-action",">",undefined);
            //if(!dom){
            //    return null;
            //}
            //return dom.getAttribute("_waAction");
        },
        _getCategoryInfo = function (dom) {
            return _recursiveGetAttr(dom,"wa-category",">","");
            //if(!dom){
            //    return null;
            //}
            //return dom.getAttribute("_waCategory");
        },
        _checkDisableAuto = function (dom) {
            var settings = _recursiveGetAttr(dom,"wa-disable-auto",">","").split(">");
            //根据dom以及父节点的配置，来判断这次事件是否要记录日志
            for(var i=0,j=settings.length;i<j;i++){
                var conf = settings[i];
                //如果父节点中配置过，则使用父节点配置的信息
                if(conf.length>0){
                    return conf;
                }
            }
            return "false";//默认是不禁用自动事件抛送的
        },
        /**
         * 根据事件信息，获取用户触发动作的手指/鼠标位置
         * @param evt
         * @private
         */
        _getTouchPos = function (evt) {
            var e = evt.type==='touchstart'? evt.touches[0]:evt;
            return {
                x: e.pageX ,
                y: e.pageY
            }
        }
        _events=['mousedown','touchstart'],
        _builtInCategory='_auto', //auto模式下，自动跟踪所使用的事件分类
        _onUserEvt = function (evt) {
            var
                e = evt || window.event,
                name = e.type||'unknown',
                t = e.target || e.srcElement,
                _waAttr,
                _arg;
            if(t){
                //检查事件对象DOM是否具有_wa属性
                _waAttr = t.getAttribute('_wa');
                //只有当设定了_wa属性的DOM事件才会收集
                //如果是参数数组，则使用自定义方法来调用
                if(_waAttr && _waAttr[0]==='[' &&_waAttr[_waAttr.length-1]===']'){
                    _arg = eval(_waAttr);//'[1,2,3]' => [1,2,3]
                    _wa.apply(this,_arg);
                }
                //如果没有,则使用默认方式收集数据
                //如果disableAuto标记没有设置，则自动上传
                if(!trackerObj.get("disableAuto") && (_checkDisableAuto(t)!=="true" )){
                    var d= util.merge(_getTouchPos(e),{
                        category:_getCategoryInfo(t)||_builtInCategory,//_auto
                        action:_getActionInfo(t),
                        tag:_getTagInfo(t),
                        value:_getValueInfo(t),
                        //dom:_getDOMInfo(t)
                        dom:util.locateDOM(t)
                    });
                    d.action= (d.action?(d.action+'|'):'')+name;
                    //alert(name+":"+JSON.stringify(d));
                    //生成跟踪数据，发送到后台
                    trackerObj.send(d)
                }
            }

        };
    //当wa.js加载时，外壳会通知每个tracker
    //在此可以做一些默认操作
    trackerObj.on('_jsLoad', function () {
        //在body上捕获尽可能多的事件
        for(var i=0,j=_events.length;i<j;i++){
            var e = _events[i];
            util.on(b,e, function(evt){_onUserEvt(evt)});
        }
    });

    //注册
    tracker.setTracker(_name,trackerObj)
})(window,document,'_webAnalyst','_util','_tracker','_wa');
;/**
 * this tracker is for page data collect
 *
 * 要点记录：
 * 1、关于浏览器类型的判断：
 *  由于浏览器发送http请求的时候，user-agent默认会发送，所以收集脚本无需再次发送
 *  但是某些浏览器的判断，只靠ua是不够的，所以一些额外的信息应该被探测脚本收集，并发送给后台辅助判断，包括
 *      window.opera,navigator.vendor,navigator.platform
 *
 * 2、关于浏览器支持特性的收集：
 * 下面是打算收集的浏览器支持哪些特性的说明:
 * featuresArray[idx]
 * idx:
 *      0:navigator.geolocation 获取用户地理位置
 *      1:WebSocket 支持使用ws通信
 *      2:Worker 使用webWorker进行客户端多线程操作
 *      3:JSON 是否提供JSON.parse和stringify方法
 *      4:ES5 是否提供对ES5的良好支持：Function.prototype.bind,Array.forEach,Object.defineProperty
 *      5:Navigation Timing API 是否提供对性能收集接口的支持:performance && performance.timing
 * Created by cuikai on 2015/11/7.
 */


(function (wnd, doc,moduleName,utilModuleName,trackerModuleName,taskQueueName) {
    var tracker = wnd[moduleName][trackerModuleName],
        wa = wnd[moduleName],
        util = wnd[moduleName][utilModuleName];

    var _name='pageView',
        trackerObj = tracker.createTracker(_name,{
            bVerMain: 'r',  //浏览器主版本
            flashVersion: 'q', //flash版本
            osVersion: 'p',  //os版本
            os: 'o',
            appver:"n", //navigator.appversion
            mobile: 'm', //是否移动设备
            pf:"l",  //navigator.platform
            vd:"k",  //navigator.vender
            //url:"j",
            ft:"i",   //feature支持
            cd:"h",
            dx:'g',
            dy:'f',
            cookieEnabled:'e',
            javaEnabled:'d',
            language:'c',
            bVer:'b', //浏览器版本
            browser:'a' //浏览器类型   1 IE  2 opera 3 firefox  4 safari  5 chrome
        //ie:'b',
        //opera:'a'
    },'../../_wa.gif',true);//页面跟踪默认开启

    //提供命令:客户端可以这样调用：_wa('pageView','send',function(isSuccess){})
    /**
     * 提交页面访问日志
     * @param cb
     */
    //trackerObj.send = function (cb) {
    //    //todo:通过内置方法获取相关参数并发送
    //    //使用对象传参
    //    if(typeof category ==='object'){
    //        cb = action;
    //        return  this._send(category,cb);
    //    }else{
    //        return this._send({
    //            category:category,
    //            action:action,
    //            tag:tag,
    //            value:value
    //        },cb);
    //    }
    //};
    var n = navigator,
        d = document,
        s = screen,
        l = location,
        b = d.body;

    function _getInfo(){
        // browser
        var nVer = n.appVersion;
        var nAgt = n.userAgent;
        var browser = n.appName;
        var version = '' + parseFloat(nVer);
        var majorVersion = parseInt(nVer, 10);
        var nameOffset, verOffset, ix;

        // Opera
        if ((verOffset = nAgt.indexOf('Opera')) != -1) {
            browser = 2;
            version = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // Opera Next
        if ((verOffset = nAgt.indexOf('OPR')) != -1) {
            //browser = 'Opera';
            browser = 2;
            version = nAgt.substring(verOffset + 4);
        }
        // MSIE
        else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
            //browser = 'Microsoft Internet Explorer';
            browser = 1;
            version = nAgt.substring(verOffset + 5);
        }
        // Chrome
        else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
            browser = 5;
            version = nAgt.substring(verOffset + 7);
        }
        // Safari
        else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
            browser = 4;
            version = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // Firefox
        else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
            browser = 3;
            version = nAgt.substring(verOffset + 8);
        }
        // MSIE 11+
        else if (nAgt.indexOf('Trident/') != -1) {
            browser = 1;
            version = nAgt.substring(nAgt.indexOf('rv:') + 3);
        }
        // Other browsers
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            browser = nAgt.substring(nameOffset, verOffset);
            version = nAgt.substring(verOffset + 1);
            if (browser.toLowerCase() == browser.toUpperCase()) {
                browser = n.appName;
            }
        }
        // trim the version string
        if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

        majorVersion = parseInt('' + version, 10);
        if (isNaN(majorVersion)) {
            version = '' + parseFloat(n.appVersion);
            majorVersion = parseInt(n.appVersion, 10);
        }

        // mobile version
        var mobile = +(/Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer));

        // cookie
        //var cookieEnabled = (navigator.cookieEnabled) ? true : false;
        //
        //if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
        //    document.cookie = 'testcookie';
        //    cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
        //}

        // system
        var os = 'unknown';
        var clientStrings = [
            {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
            {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
            {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
            {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
            {s:'Windows Vista', r:/Windows NT 6.0/},
            {s:'Windows Server 2003', r:/Windows NT 5.2/},
            {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
            {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
            {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
            {s:'Windows 98', r:/(Windows 98|Win98)/},
            {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
            {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
            {s:'Windows CE', r:/Windows CE/},
            {s:'Windows 3.11', r:/Win16/},
            {s:'Android', r:/Android/},
            {s:'Open BSD', r:/OpenBSD/},
            {s:'Sun OS', r:/SunOS/},
            {s:'Linux', r:/(Linux|X11)/},
            {s:'iOS', r:/(iPhone|iPad|iPod)/},
            {s:'Mac OS X', r:/Mac OS X/},
            {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
            {s:'QNX', r:/QNX/},
            {s:'UNIX', r:/UNIX/},
            {s:'BeOS', r:/BeOS/},
            {s:'OS/2', r:/OS\/2/},
            {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
        ];
        for (var id in clientStrings) {
            var cs = clientStrings[id];
            if (cs.r.test(nAgt)) {
                os = cs.s;
                break;
            }
        }

        var osVersion = 'unknown';

        if (/Windows/.test(os)) {
            osVersion = /Windows (.*)/.exec(os)[1];
            os = 'Windows';
        }

        switch (os) {
            case 'Mac OS X':
                osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'Android':
                osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'iOS':
                osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                break;
        }

        // flash (you'll need to include swfobject)
        /* script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" */
        var flashVersion = '';
        if (typeof swfobject != 'undefined') {
            var fv = swfobject.getFlashPlayerVersion();
            if (fv.major > 0) {
                flashVersion = fv.major + '.' + fv.minor + ' r' + fv.release;
            }
            else  {
                flashVersion = 'unknown';
            }
        }


         return {
             browser: browser,
             bVer: version,
             bVerMain: majorVersion,
             mobile: mobile,
             os: os,
             osVersion: osVersion,
             flashVersion: flashVersion
        };
    }
    //pageTracker 搜集到的信息
    var _collect=util.merge({
        vd:n.vendor,
        appver:n.appVersion,
        pf:n.platform,
        /**     features支持
         *      0:navigator.geolocation 获取用户地理位置
         *      1:WebSocket 支持使用ws通信
         *      2:Worker 使用 webWorker 进行客户端多线程操作
         *      3:JSON 是否提供JSON.parse和stringify方法
         *      4:ES5 是否提供对ES5的良好支持：Function.prototype.bind,Array.prototype.forEach,Object.defineProperty
         *      5:Navigation Timing API 是否提供对性能收集接口的支持:performance && performance.timing
         */

        ft:
            //parseInt(
                [
            +(!!n.geolocation),
            +(!!wnd.WebSocket),
            +(!!wnd.Worker),
            +(!!wnd.JSON),
            +!!(Function.prototype.bind && Array.prototype.forEach && Object.defineProperty),
            +!!(wnd.performance && wnd.performance.timing)
        ].join(''),//为了减少encodeURIComponent时带来的开销，使用'1111'或'1011'这样的字符来分别表示每一位是否支持.所以不带分隔符
        //].join(''),2).toString(36),//为了减少encodeURIComponent时带来的开销，使用'1111'或'1011'这样的字符来分别表示每一位是否支持.所以不带分隔符

        //当前访问url
        //url: l.href,
        //颜色深度
        cd: s.colorDepth || 0,
        //device resolution x:设备分辨率:横向
        dx: s.width || 0,
        //device resolution y:设备分辨率:纵向
        dy: s.height || 0
    },util.merge(wa._info,_getInfo()));
    //当wa.js加载时，外壳会通知每个tracker
    //在此可以做一些默认操作
    trackerObj.on('_jsLoad', function () {
        trackerObj._send(_collect)
    });

    //注册
    tracker.setTracker(_name,trackerObj)
})(window,document,'_webAnalyst','_util','_tracker','_wa');
;/**负责处理页面性能相关数据的收集工作
 * Created by cuikai on 2015/11/7.
 */

(function (wnd, doc,moduleName,utilModuleName,trackerModuleName,taskQueueName) {
    var tracker = wnd[moduleName][trackerModuleName],
        wa = wnd[moduleName],
        _wa = wnd[taskQueueName],
        util = wnd[moduleName][utilModuleName];

    var _name='perf',


        _startTime = (wnd[moduleName] && wnd[moduleName].l) ||0;
        //data有2个用处，一个是用于定义字段，一个是存储发送数据
        _data={
            //--------calculate result data
            start:'s',//页面开始下载的时间(如果有timing API,则使用naviationStart,否则使用wa脚本收集到的入口时间)
            contentLoad:"cl", //DOM加载完的相对时刻
            load:"ld", //全部同步资源加载完的相对时刻
            paint:"pt", //页面开始渲染的相对时刻
            active:"at", //用户可以进行动作的相对时刻
            firstScreen:"fs", //首屏渲染完(待实现)的相对时刻
            dnsTime:"dns", //dns查找 花去的时间
            connTime:"con", //建立连接 花去的时间
            firstBit:"fb", //从发出请求，到准备接收第一个字节 花去的时间
            trans:"tr", //从开始传输，到结束传输 花去的时间

            //--------origin timing data
            ns:"t0", //navigationStart 这个是完整时间
            //下面全部是相应时刻距离t0的增量时间
            dls:'t1', //domainLookupStart
            dle:'t2', //domainLookupEnd
            cs:'t3', //connectStart
            ce:'t4', //connectEnd
            rqs:'t5', //requestStart
            rps:'t6', //responseStart
            rpe:'t7', //responseEnd
            dcls:'t8', //domContentLoadedEventStart
            les:'t9', //loadEventStart
            lee:'ta' //loadEventEnd
        },
        trackerObj = tracker.createTracker(_name,_data,'../../_wa.gif',true);//事件跟踪默认开启

    var data = util.copyObj(_data);
    //clear data
    for(var i in data){
        data[i] = undefined
    }

    var d=document,
        b = d.body;

    var
        _now = util.nowInMS,

        /**
         * 上报性能数据
         * @private
         */
        _do = function () {

            var pf =wnd.performance,
                t = pf || wnd.webkitPerformance,
                t = t && t.timing,
                lt = wnd.chrome && wnd.chrome.loadTimes,
                ms = (wa._info.ie && pf && (typeof pf.timing.msFirstPaint === 'number')?pf.timing.msFirstPaint:0);

            //start
            var s =data.start = t?(t.navigationStart||_startTime||undefined):(_startTime||undefined);

            //只有获取到网页的开始加载时间,且浏览器支持performanceAPI，后续的数据收集才有意义
            if(s&&t){
                //DOMReady
                data.contentLoad = t.domContentLoadedEventStart - s;
                //load
                data.load = t.loadEventStart -s;

                //计算 paint (白屏时间，也即浏览器开始渲染的时间)
                // Chrome
                if (lt) {
                    // Convert to ms
                    data.paint = (lt().firstPaintTime * 1000 - s).toFixed(2);
                }
                // IE
                else if (ms) {
                    data.paint = ms - s;
                }

                //计算 active (可操作时间，也即用户可以与DOM交互的时间)
                data.active = t.domInteractive -s;

                //todo:计算firstScreen(暂时不实现，需要考虑如何定义首屏，和获取加载完成的时间)

                data.dnsTime=t.domainLookupEnd - t.domainLookupStart; //dns查找 花去的时间
                data.connTime = t.connectEnd - t.connectStart; //建立连接 花去的时间
                data.firstBit = t.responseStart - t.requestStart; //从发出请求，到准备接收第一个字节 花去的时间
                data.trans = t.responseEnd - t.responseStart; //从开始传输，到结束传输 花去的时间


                //通过performanceAPI获取其他参数
                /*
                 ns:"t0", //navigationStart 这个是完整时间
                 //下面全部是相应时刻距离t0的增量时间
                 dls:'t1', //domainLookupStart
                 dle:'t2', //domainLookupEnd
                 cs:'t3', //connectStart
                 ce:'t4', //connectEnd
                 rqs:'t5', //requestStart
                 rps:'t6', //responseStart
                 rpe:'t7', //responseEnd
                 dcls:'t8', //domContentLoadedEventStart
                 les:'t9', //loadEventStart
                 lee:'ta' //loadEventEnd
                 */
                data.ns = t.navigationStart;
                data.dls= t.domainLookupStart - s;
                data.dle= t.domainLookupEnd - s;
                data.cs= t.connectStart - s;
                data.ce= t.connectEnd - s;
                data.rqs= t.requestStart - s;
                data.rps= t.responseStart - s;
                data.rpe= t.responseEnd - s;
                data.dcls= t.domContentLoadedEventStart - s;
                data.les= t.loadEventStart - s;
                data.lee= t.loadEventEnd - s;

                //发送
                trackerObj._send(data);
            }

        };
    //当wa.js加载时，外壳会通知每个tracker
    //在此可以做一些默认操作
    trackerObj.on('_jsLoad', function () {

        ////DOMContentLoad
        //util.domReady(function () {
        //    data.contentLoad = _now();
        //});

        //当load事件触发后，才去收集性能数据，这样数据比较全
        util.on(wnd,'load', function () {
            data.load = _now();
            setTimeout(_do,500)
        })
    });

    //注册
    tracker.setTracker(_name,trackerObj)
})(window,document,'_webAnalyst','_util','_tracker','_wa');
;/**
 * 管理所有的tracker
 * 从脚本加载之前就准备好的任务队列里取出任务，进行执行
 * Created by cuikai on 2015/11/8.
 */


(function (wnd, doc,moduleName,utilModuleName,trackerModuleName,taskQueueName) {
    var tracker = wnd[moduleName][trackerModuleName],
        util = wnd[moduleName][utilModuleName],
        wa = wnd[moduleName];

    //todo:通过某种方式读取tracker是否开启的配置，设置tracker(重要)


    var _commands={
            /**
             * 命令 newWaTracker:创建一个tracker,其行为继承自tracker.js,并注册到全局tracker
             * @param name
             * @param factory(util).this = _tracker
             */
            'newWaTracker': function (name, protocolParam, reportUrl,enable,factory) {
                var _tracker =tracker.createTracker(name,protocolParam,reportUrl,enable);//创建一个tracker
                factory && factory.call(_tracker,util);

                //注册
                tracker.setTracker(name,_tracker)
            },
            /**
             * 命令 newTracker:创建一个完全自定义的tracker,并注册到全局tracker
             * 注意，完全自定义的tracker如果能具备emit,on方法，则可以享受到wa提供的各种事件通知服务
             * @param factory(util)
             */
            newTracker: function (name,factory) {
                var _tracker = factory(util);
                //注册
                tracker.setTracker(name,_tracker)
            }
        },
        _slice = Array.prototype.slice;

    /**
     * 入口
     * 用户可以使用_wa.push([arg1,arg2,...])来调用，也可以使用_wa(arg1,arg2,...)
     * @param trackerName
     * @param method
     */
    function entry(trackerName,method /*,param1.param2*/){
        //去除2个参数，留下调用方法的参数列表
        var argsCmd = _slice.call(arguments).slice(1),
            args = argsCmd.slice(1);


        //先看是否内置命令
        var cmd = _commands[trackerName];
        if(cmd){
            return cmd.apply(wa,argsCmd);
        }

        var trackers = entry.getTracker(trackerName),
            _ret=[];

        if(trackers){
            //trackers可能有多个，统一转化为数组来处理
            if( Object.prototype.toString.apply(trackers) !== '[object Array]'){
                trackers = [trackers];
            }
            for(var i=0,j=trackers.length;i<j;i++){
                var tracker = trackers[i];
                //如果tracker有这个方法,并且不是Tracker.prototype的方法
                //if (tracker[method]&&  tracker.constructor.prototype[method] == undefined && typeof tracker[method] ==='function') {
                if (tracker[method]&& typeof tracker[method] ==='function') {
                    var methodFunc = tracker[method];
                    _ret.push(methodFunc.apply(tracker, args));
                }
                else {
                    // 暂时还无法处理的方法
                    tracker.pendingList.push(args);
                }
            }
            return _ret.length>1?_ret:_ret[0]
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

    //向track发送通知，wa.js已经被加载
    tracker.eachTracker(function (name, trackerObj) {
        trackerObj.emit&&trackerObj.emit("_jsLoad");
    })


})(window,document,'_webAnalyst','_util','_tracker','_wa');