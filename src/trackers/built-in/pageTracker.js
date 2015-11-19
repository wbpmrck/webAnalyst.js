/**
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
        pf:"l",
        vd:"k",
        url:"j",
        ft:"i",
        cd:"h",
        dx:'g',
        dy:'f',
        cookieEnabled:'e',
        javaEnabled:'d',
        language:'c',
        ie:'b',
        opera:'a'
    },'${reportUrl.pageTracker}',true);//页面跟踪默认开启

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
    //pageTracker 搜集到的信息
    var _collect=util.merge({
        vd:n.vendor,
        pf:n.platform,
        /**     features支持
         *      0:navigator.geolocation 获取用户地理位置
         *      1:WebSocket 支持使用ws通信
         *      2:Worker 使用 webWorker 进行客户端多线程操作
         *      3:JSON 是否提供JSON.parse和stringify方法
         *      4:ES5 是否提供对ES5的良好支持：Function.prototype.bind,Array.prototype.forEach,Object.defineProperty
         *      5:Navigation Timing API 是否提供对性能收集接口的支持:performance && performance.timing
         */

        ft:parseInt([
            +(!!n.geolocation),
            +(!!wnd.WebSocket),
            +(!!wnd.Worker),
            +(!!wnd.JSON),
            +!!(Function.prototype.bind && Array.prototype.forEach && Object.defineProperty),
            +!!(wnd.performance && wnd.performance.timing)
        ].join(''),2).toString(36),//为了减少encodeURIComponent时带来的开销，使用'1111'或'1011'这样的字符来分别表示每一位是否支持.所以不带分隔符

        //当前访问url
        url: l.href,
        //颜色深度
        cd: s.colorDepth || 0,
        //device resolution x:设备分辨率:横向
        dx: s.width || 0,
        //device resolution y:设备分辨率:纵向
        dy: s.height || 0
    },wa._info);
    //当wa.js加载时，外壳会通知每个tracker
    //在此可以做一些默认操作
    trackerObj.on('_jsLoad', function () {
        trackerObj._send(_collect)
    });

    //注册
    tracker.setTracker(_name,trackerObj)
})(window,document,'_webAnalyst','_util','_tracker','_wa');