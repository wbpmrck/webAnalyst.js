/**
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