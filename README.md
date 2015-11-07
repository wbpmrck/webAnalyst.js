# webAnalyst.js
A powerful tool for collecting data from browser ,analyze page speed,track user action and so on.


### Versions Status
* V 0.1.0:开发中(under development)

### architecture
below is the webAnalyst architecture:
![webAnalyst architecture](design/arch.jpg)

### TODOs
* 完成数据收集框架的设计
    * 完成API风格的设计(ing)
        * _wa.push([trackerName,command,param1,param2,param3...])
    * 完成数据收集方式、发送方式的设计(done)
    * 完成User Case,Deploy Model设计(done)
    
    
* 开发数据收集客户端
    * Tracker实现(ing)
        * 一个tracker有自己的名字，可以执行各种指令
        * 指令可以通过tracker对象调用，也可以通过全局任务队列_wa.push()调用
        * 支持对command处理结果进行订阅
    * built-in tracker封装：
        * page tracker:用于追踪页面PV,UV,浏览器信息，用户ip...等
        * event tracker:用于提供自定义事件追踪功能
        * performance tracker:用于对页面性能进行分析
            * 这部分tracker主要用于用户对自定义资源性能、自定义规则的页面性能进行追踪
            * 通过将tracker调用放在不同的位置(脚本解析时记录时间),以及指定不同的资源加载开始、结束时间，来实现定制规则的性能分析
        * resource tracker:
            * 主要对页面直接依赖的资源进行分析
    * Resource Timing API,Navigation Timing API的封装(ing)
        * 提供util迅速计算resource timing的关键数据
        * 提供util迅速计算和用户关心的页面时间相关的数据
    * 考虑提供一些接口，能够灵活对接第三方的跟踪器
        * 在一些跟踪动作发生的时候，多个第三方跟踪器都能收到跟踪

* 开发数据收集服务端(demo)
    * 利用cookie标识唯一用户
    * 解决数据上传脚本缓存和上传地址更新的矛盾问题
    
    
* 开发数据分析端(demo)
    * 简单实现一些分析项目：
        * PV,UV等
        * 页面性能分析:
            * 白屏时间
            * 用户可操作时间
            * 首屏时间
            * 总下载时间
        * 资源加载性能分析(支持自定义)
        * 自定义事件分析
        * 用户来源,ip,地域分析
        * 客户端网络状况分析
        * 浏览器新特性兼容性分析
        * ...



### License
MIT