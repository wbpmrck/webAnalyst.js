/**负责处理页面性能相关数据的收集工作
 * Created by cuikai on 2015/11/7.
 */

(function (wnd, doc,moduleName,utilModuleName,trackerModuleName,taskQueueName) {
    var tracker = wnd[moduleName][trackerModuleName],
        _wa = wnd[taskQueueName],
        util = wnd[moduleName][utilModuleName];

    var _name='performance',


        _startTime = (wnd[moduleName] && wnd[moduleName].l) ||0;
        //data有2个用处，一个是用于定义字段，一个是存储发送数据
        data={
            //--------calculate result data
            start:'s',//页面开始下载的时间(如果有timing API,则使用naviationStart,否则使用wa脚本收集到的入口时间)
            contentLoad:"cl", //DOM加载完的相对时刻
            load:"ld", //全部同步资源加载完的相对时刻
            paint:"pt", //页面开始渲染的相对时刻
            firstScreen:"fs", //首屏渲染完(待实现)的相对时刻

            //--------origin timing data
            rds:"t1", //redirectStart
            rde:"t2", //redirectEnd
            dls:'t3', //domainLookupStart
            dle:'t4', //domainLookupEnd
            cs:'t5', //connectStart
            ce:'t6', //connectEnd
            rqs:'t7', //requestStart
            rps:'t8', //responseStart
            rpe:'t9', //responseEnd
            dl:'ta', //domLoading
            dc:'tb', //domComplete
            les:'tc', //loadEventStart
            lee:'td' //loadEventEnd
        },
        trackerObj = tracker.createTracker(_name,'${reportUrl.performanceTracker}',data,true);//事件跟踪默认开启

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

            var t = wnd.performance || wnd.webkitPerformance,
                t = t && t.timing;

            //start
            var s =data.start = t?(t.navigationStart||_startTime||undefined):(_startTime||undefined);

            //只有获取到网页的开始加载时间，后续的数据收集才有意义
            if(s){
                //转化DOMReady的时间，从绝对时间=>相对时刻
                data.contentLoad -= s;
                //转化load的相对时刻
                data.load -= s;

                //todo:计算 firstPaint (白屏时间，也即浏览器开始渲染的时间)

                //todo:计算firstScreen(暂时不实现，需要考虑如何定义首屏，和获取加载完成的时间)
                //todo:通过performanceAPI获取其他参数
                //发送
            }

        };
    //当wa.js加载时，外壳会通知每个tracker
    //在此可以做一些默认操作
    trackerObj.on('_jsLoad', function () {

        //DOMContentLoad
        util.domReady(function () {
            data.contentLoad = _now();
        });

        //当load事件触发后，才去收集性能数据，这样数据比较全
        util.on(wnd,'load', function () {
            data.load = _now();
            setTimeout(_do,500)
        })
    });

    //注册
    tracker.setTracker(_name,trackerObj)
})(window,document,'_webAnalyst','_util','_tracker','_wa');