/**
 * 提供基本的事件追踪数据发送API
 * Created by cuikai on 2015/11/7.
 */


(function (wnd, doc,moduleName,utilModuleName,trackerModuleName,taskQueueName) {
    var tracker = wnd[moduleName][trackerModuleName];

    var _name='event',
        trackerObj = tracker.createTracker(_name,{
            category:"c",
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
                value:value
            },cb);
        }
    };

    //当wa.js加载时，外壳会通知每个tracker
    //在此可以做一些默认操作
    trackerObj.on('_jsLoad', function () {

    });

    //注册
    tracker.setTracker(_name,trackerObj)
})(window,document,'_webAnalyst','_util','_tracker','_wa');