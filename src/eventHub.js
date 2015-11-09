/**
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
    function _addEventListener(element, eventName, callback) {
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
    function _removeEventListener(element, eventName, callback) {
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