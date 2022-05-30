(function(){

"use strict";
//console.log("run AI translate and search background");


//get msg from content script
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //console.log("get msg");
    if (!request.ask) {
        console.log("can not find msg ask");
        return;
    }

    //操作localstorage
    if (request.ask === "removeItem") {
        //从localstorage中删除数据
        if (request.key) {
            chrome.storage.local.remove(request.key);
        }
    } else if (request.ask === "setItem") {
        //向localstorage中保存数据
        if (request.key && request.value) {
            //set方法只能存放对象，因此key不能是个变量。所以要把ke:value先转换成一个对象
            let item = {};
            item[request.key] = request.value;
            chrome.storage.local.set(item);
        }
    } else if (request.ask === "getItem") {
        console.log("run getItem");
        //从localstorage中获取数据
        if (request.key) {
            console.log("get key: " + request.key);
            chrome.storage.local.get([request.key], function(result) {
                console.log("get value: " + result[request.key]);
                //获得的结果，返回给content script
                sendResponse({value: result[request.key]});

                //注意，这个return true特别重要，没有的话，response发不出去
                //因为onMessage.addListener是同步运行的，结束时，会关闭和content script的消息通道。
                //而chrome.storage.local.get是异步的，因此数据还没取到，消息通道就被关闭了
                //要保持通道打开，就必须return true，把onMessage.addListener变成异步运行的
                return true;
            });
            //注意，这个return true特别重要，没有的话，response发不出去
            //因为onMessage.addListener是同步运行的，结束时，会关闭和content script的消息通道。
            //而chrome.storage.local.get是异步的，因此数据还没取到，消息通道就被关闭了
            //要保持通道打开，就必须return true，把onMessage.addListener变成异步运行的
            return true;
        }
    } else if (request.ask === "option") {
        //打开选项页面
        chrome.runtime.openOptionsPage();
    } else {
        console.log("unknow msg, do nothing");
    }
  }
);


})();








