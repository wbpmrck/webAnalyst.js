/**
 * 这段代码是被嵌入在Html里，作为初始化webAnalyst脚本引用的工具
 * 并且还负责在统计脚本载入之前，通过数组的形式收集用户的统计指令
 * 待webAnalyst载入之后，会从queue里取出指令进行处理
 * Created by cuikai on 2015/11/9.
 */
(function(wnd,doc,tagName,mName,url,taskQueueName,tag,firstScript){
    wnd[mName]?(wnd[mName].queueName=taskQueueName):(wnd[mName]={queueName:taskQueueName});
    //将对queue的操作封装为_wa()调用
    wnd[taskQueueName]=wnd[taskQueueName]||function(){
            (wnd[taskQueueName].q=wnd[taskQueueName].q||[]).push(arguments)
        };
    wnd[mName].l=1*new Date();
    tag=doc.createElement(tagName),
        firstScript=doc.getElementsByTagName(tagName)[0];
    tag.async=1;
    tag.src=url;
    firstScript.parentNode.insertBefore(tag,firstScript)
})(window,document,'script','_webAnalyst','${scriptUrl}','_wa');
//})(window,document,'script','//www.google-analytics.com/analytics.js','_wa');

//ga.js
//
//(function(i,s,o,g,r,a,m){
//    i['GoogleAnalyticsObject']=r;
//    i[r]=i[r]||function(){
//        (i[r].q=i[r].q||[]).push(arguments)},
//        i[r].l=1*new Date();
//    a=s.createElement(o),
//    m=s.getElementsByTagName(o)[0];
//    a.async=1;
//    a.src=g;
//    m.parentNode.insertBefore(a,m)
//})(window,document,'script','//www.google-analytics.com/analytics.js','ga');