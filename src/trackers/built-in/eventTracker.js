/**
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
    },'${reportUrl.eventTracker}',true);//事件跟踪默认开启

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
                    //获取父元素的attr信息
                    pl = _recursiveGetAttr(dom.parentNode,pName,splitter,defaultValue);

                    if(l){
                        if(pl!==undefined && pl !== null && pl!==""){
                            l= pl+splitter+l;
                        }
                    }else{
                        l=pl;
                    }

                }
            }
            return l;
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
                else if(!trackerObj.get("disableAuto") && (_checkDisableAuto(t)!=="true" )){
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