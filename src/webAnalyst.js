/**
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

    //todo:通过某种方式读取tracker是否开启的配置，设置tracker(重要)


    /**
     * 入口
     * 用户可以使用_wa.push([arg1,arg2,...])来调用，也可以使用_wa(arg1,arg2,...)
     * @param trackerName
     * @param method
     */
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

    //向track发送通知，wa.js已经被加载
    tracker.eachTracker(function (name, trackerObj) {
        trackerObj.emit("_jsLoad");
    })


})(window,document,'_webAnalyst','_eventHub','_tracker','_wa');