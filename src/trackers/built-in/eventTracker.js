/**
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