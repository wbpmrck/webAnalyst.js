# webAnalyst.js
A powerful tool for collecting data from browser ,analyze page speed,track user action and so on.


### Versions Status
* V 0.1.0:开发中(under development)

### TODOs
* 完成数据收集框架的设计
    * 完成API风格的设计
    * 完成数据收集方式、发送方式的设计
    
    
* 开发数据收集客户端
    * Tracker实现
    * Resource Timing API,Navigation Timing API的封装
    * 服务端
    

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