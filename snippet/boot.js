/**
 * 这段代码是被嵌入在Html里，作为初始化webAnalyst脚本引用的工具
 * Created by cuikai on 2015/11/9.
 */
(function(wnd,doc,tagName,mName,url,taskQueueName,tag,firstScript){
    wnd[mName]?(wnd[mName].queueName=taskQueueName):(wnd[mName]={queueName:taskQueueName});
    wnd[taskQueueName]=wnd[taskQueueName]||function(){
            (wnd[taskQueueName].q=wnd[taskQueueName].q||[]).push(arguments)
        };
    //wnd[taskQueueName].l=1*new Date();
    tag=doc.createElement(tagName),
        firstScript=doc.getElementsByTagName(tagName)[0];
    tag.async=1;
    tag.src=url;
    firstScript.parentNode.insertBefore(tag,firstScript)
})(window,document,'script','_webAnalyst','${scriptUrl}','_wa');
//})(window,document,'script','//www.google-analytics.com/analytics.js','_wa');