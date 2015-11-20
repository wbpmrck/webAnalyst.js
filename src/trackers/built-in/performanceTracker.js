/**负责处理页面性能相关数据的收集工作
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
        trackerObj = tracker.createTracker(_name,_data,'${reportUrl.performanceTracker}',true);//事件跟踪默认开启

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