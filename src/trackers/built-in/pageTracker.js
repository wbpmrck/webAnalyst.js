/**
 * this tracker is for page data collect
 * 1:document.referrer;
 * Created by cuikai on 2015/11/7.
 */


(function (wnd, doc,moduleName,evtModuleName,trackerModuleName,taskQueueName) {
    var tracker = wnd[moduleName][trackerModuleName];

    var _name='pageView',
        trackerObj = tracker.createTracker(_name,{
        category:"ct",
        action:"at",
        tag:'t',
        value:'v'
    },'${reportUrl.pageTracker}',true);//页面跟踪默认开启

    //提供命令:客户端可以这样调用：_wa('pageView','send',function(isSuccess){})
    /**
     * 提交页面访问日志
     * @param cb
     */
    trackerObj.send = function (cb) {
        //todo:通过内置方法获取相关参数并发送
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
})(window,document,'_webAnalyst','_eventHub','_tracker','_wa');