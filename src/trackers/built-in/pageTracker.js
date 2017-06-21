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
            bVerMain: 'r',  //浏览器主版本
            flashVersion: 'q', //flash版本
            osVersion: 'p',  //os版本
            os: 'o',
            appver:"n", //navigator.appversion
            mobile: 'm', //是否移动设备
            pf:"l",  //navigator.platform
            vd:"k",  //navigator.vender
            rf:"j",//document.referrer,
            //url:"j",
            ft:"i",   //feature支持
            cd:"h",
            dx:'g',
            dy:'f',
            cookieEnabled:'e',
            javaEnabled:'d',
            language:'c',
            bVer:'b', //浏览器版本
            browser:'a' //浏览器类型   1 IE  2 opera 3 firefox  4 safari  5 chrome
        //ie:'b',
        //opera:'a'
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

    function _getInfo(){
        // browser
        var nVer = n.appVersion;
        var nAgt = n.userAgent;
        var browser = n.appName;
        var version = '' + parseFloat(nVer);
        var majorVersion = parseInt(nVer, 10);
        var nameOffset, verOffset, ix;

        // Opera
        if ((verOffset = nAgt.indexOf('Opera')) != -1) {
            browser = 2;
            version = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // Opera Next
        if ((verOffset = nAgt.indexOf('OPR')) != -1) {
            //browser = 'Opera';
            browser = 2;
            version = nAgt.substring(verOffset + 4);
        }
        // MSIE
        else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
            //browser = 'Microsoft Internet Explorer';
            browser = 1;
            version = nAgt.substring(verOffset + 5);
        }
        // Chrome
        else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
            browser = 5;
            version = nAgt.substring(verOffset + 7);
        }
        // Safari
        else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
            browser = 4;
            version = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // Firefox
        else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
            browser = 3;
            version = nAgt.substring(verOffset + 8);
        }
        // MSIE 11+
        else if (nAgt.indexOf('Trident/') != -1) {
            browser = 1;
            version = nAgt.substring(nAgt.indexOf('rv:') + 3);
        }
        // Other browsers
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            browser = nAgt.substring(nameOffset, verOffset);
            version = nAgt.substring(verOffset + 1);
            if (browser.toLowerCase() == browser.toUpperCase()) {
                browser = n.appName;
            }
        }
        // trim the version string
        if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

        majorVersion = parseInt('' + version, 10);
        if (isNaN(majorVersion)) {
            version = '' + parseFloat(n.appVersion);
            majorVersion = parseInt(n.appVersion, 10);
        }

        // mobile version
        var mobile = +(/Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer));

        // cookie
        //var cookieEnabled = (navigator.cookieEnabled) ? true : false;
        //
        //if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
        //    document.cookie = 'testcookie';
        //    cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
        //}

        // system
        var os = 'unknown';
        var clientStrings = [
            {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
            {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
            {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
            {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
            {s:'Windows Vista', r:/Windows NT 6.0/},
            {s:'Windows Server 2003', r:/Windows NT 5.2/},
            {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
            {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
            {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
            {s:'Windows 98', r:/(Windows 98|Win98)/},
            {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
            {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
            {s:'Windows CE', r:/Windows CE/},
            {s:'Windows 3.11', r:/Win16/},
            {s:'Android', r:/Android/},
            {s:'Open BSD', r:/OpenBSD/},
            {s:'Sun OS', r:/SunOS/},
            {s:'Linux', r:/(Linux|X11)/},
            {s:'iOS', r:/(iPhone|iPad|iPod)/},
            {s:'Mac OS X', r:/Mac OS X/},
            {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
            {s:'QNX', r:/QNX/},
            {s:'UNIX', r:/UNIX/},
            {s:'BeOS', r:/BeOS/},
            {s:'OS/2', r:/OS\/2/},
            {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
        ];
        for (var id in clientStrings) {
            var cs = clientStrings[id];
            if (cs.r.test(nAgt)) {
                os = cs.s;
                break;
            }
        }

        var osVersion = 'unknown';

        if (/Windows/.test(os)) {
            osVersion = /Windows (.*)/.exec(os)[1];
            os = 'Windows';
        }

        switch (os) {
            case 'Mac OS X':
                osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'Android':
                osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'iOS':
                osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                break;
        }

        // flash (you'll need to include swfobject)
        /* script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" */
        var flashVersion = '';
        if (typeof swfobject != 'undefined') {
            var fv = swfobject.getFlashPlayerVersion();
            if (fv.major > 0) {
                flashVersion = fv.major + '.' + fv.minor + ' r' + fv.release;
            }
            else  {
                flashVersion = 'unknown';
            }
        }


         return {
             browser: browser,
             bVer: version,
             bVerMain: majorVersion,
             mobile: mobile,
             os: os,
             osVersion: osVersion,
             flashVersion: flashVersion
        };
    }
    //pageTracker 搜集到的信息
    var _collect=util.merge({
        vd:n.vendor,
        rf:document.referrer,
        appver:n.appVersion,
        pf:n.platform,
        /**     features支持
         *      0:navigator.geolocation 获取用户地理位置
         *      1:WebSocket 支持使用ws通信
         *      2:Worker 使用 webWorker 进行客户端多线程操作
         *      3:JSON 是否提供JSON.parse和stringify方法
         *      4:ES5 是否提供对ES5的良好支持：Function.prototype.bind,Array.prototype.forEach,Object.defineProperty
         *      5:Navigation Timing API 是否提供对性能收集接口的支持:performance && performance.timing
         */

        ft:
            //parseInt(
                [
            +(!!n.geolocation),
            +(!!wnd.WebSocket),
            +(!!wnd.Worker),
            +(!!wnd.JSON),
            +!!(Function.prototype.bind && Array.prototype.forEach && Object.defineProperty),
            +!!(wnd.performance && wnd.performance.timing)
        ].join(''),//为了减少encodeURIComponent时带来的开销，使用'1111'或'1011'这样的字符来分别表示每一位是否支持.所以不带分隔符
        //].join(''),2).toString(36),//为了减少encodeURIComponent时带来的开销，使用'1111'或'1011'这样的字符来分别表示每一位是否支持.所以不带分隔符

        //当前访问url
        //url: l.href,
        //颜色深度
        cd: s.colorDepth || 0,
        //device resolution x:设备分辨率:横向
        dx: s.width || 0,
        //device resolution y:设备分辨率:纵向
        dy: s.height || 0
    },util.merge(wa._info,_getInfo()));
    //当wa.js加载时，外壳会通知每个tracker
    //在此可以做一些默认操作
    trackerObj.on('_jsLoad', function () {
        trackerObj._send(_collect)
    });

    //注册
    tracker.setTracker(_name,trackerObj)
})(window,document,'_webAnalyst','_util','_tracker','_wa');