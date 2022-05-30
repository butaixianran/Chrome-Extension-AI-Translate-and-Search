(function () {
    'use strict';

    //init
    let redirect_url = "";
    let text = "";
    let customMadeIconArray = [];
    let hostCustomMap = {}; 



    /**样式*/
    let style = document.createElement('style');
    let zIndex = '2147473647'; // 渲染图层
    style.textContent = `
    :host{all:unset!important}
    :host{all:initial!important}
    *{word-wrap:break-word!important}
    img{cursor:pointer;display:inline-block;width:20px;height:20px;border:1px solid #dfe1e5;border-radius:4px;background-color:rgba(255,255,255,1);padding:2px;margin:0;margin-right:5px;box-sizing:content-box;vertical-align:middle}
    img:last-of-type{margin-right:auto}
    img:hover{border:1px solid #f90}
    img[is-more]{display:none}
    tr-icon{display:none;position:absolute;padding:0;margin:0;cursor:move;background:transparent;box-sizing:content-box;font-size:13px;text-align:left;border:0;color:black;z-index:${zIndex}}
    `;
    // iframe 工具库
    let iframe = document.createElement('iframe');
    let iframeWin = null;
    let iframeDoc = null;
    iframe.style.display = 'none';
    //设置set方法
    gm.set = function (key, value) {
        //这里要改成给background发送消息
        chrome.runtime.sendMessage({ask: "setItem", key:key, value:value});
    }
    let dataTransfer = {
        beforePopup: function (popup) {
            log("run beforePopup");
            text = window.getSelection().toString().trim();
            //保存用户选择的文本内容，这样在新打开的翻译引擎页面可以从后台读取
            gm.set(gm.TEXT, text);
            popup(text);
        },
        beforeCustom: function (custom) {
            log("run beforeCustom");
            //清空保存的网页地址
            gm.set(gm.REDIRECT_URL, "");
            //清空保存的用户文本
            gm.set(gm.TEXT, '');
            //执行翻译操作
            custom.forEach(function (cus) {
                cus(text);
            });
        }
    };






    //设置列表默认值
    customMadeIconArray = iconArray;

    let hideConfig = {};
    let sortConfig = [];
    let tempArray = [];
    let sorted = {};
    let allSortedIconArray = [];

    //获取引擎是否隐藏图标的数据
    chrome.runtime.sendMessage({ask: "getItem", key: gm.HIDE}, function(resHide) {
        if(resHide && resHide.value) {
            log("get hide: ", resHide.value);
            //赋值
            hideConfig = resHide.value;
        }

        //获取用户排序的翻译引擎列表
        chrome.runtime.sendMessage({ask: "getItem", key: gm.SORT}, function(resSort) {
            
            if(resSort && resSort.value) {
                log("get sort: ", resSort.value);
                //赋值
                sortConfig = resSort.value;
            }


            //所有操作，必须放在获取这个之后

            // hide
            iconArray.forEach(function (obj) {
                if (!isNotNull(hideConfig[obj.id])) {
                    tempArray.push(obj);
                }
            });
            // sort
            sortConfig.forEach(function (id) {
                tempArray.forEach(function (tObj) {
                    if (id == tObj.id) {
                        allSortedIconArray.push(tObj);
                        sorted[id] = true;
                    }
                });
            });
            tempArray.forEach(function (tObj) {
                if (!isNotNull(sorted[tObj.id])) {
                    allSortedIconArray.push(tObj);
                }
            });

            log("allSortedIconArray.length: " + allSortedIconArray.length);

            //最终赋值
            if (allSortedIconArray.length > 0) {
                customMadeIconArray = allSortedIconArray;
            }

            // id、host 唯一性校验
            let idMaps = {};
            let hostMaps = {};
            customMadeIconArray.forEach(function (obj) {
                if (obj.id in idMaps) {
                    alert('Duplicate Id: ' + obj.id);
                } else {
                    idMaps[obj.id] = obj.id;
                }
                obj.host.forEach(function (host) {
                    if (host in hostMaps) {
                        log('Duplicate Host: ' + host);
                    } else {
                        hostMaps[host] = host;
                    }
                });
            });
            log('idMaps:', idMaps, 'hostMaps:', hostMaps);


            // 初始化 hostCustomMap
            customMadeIconArray.forEach(function (obj) {
                obj.host.forEach(function (host) { // 赋值DOM加载后的自定义方法Map
                    if (host in hostCustomMap) {
                        hostCustomMap[host].push(obj.custom);
                    } else {
                        hostCustomMap[host] = [obj.custom];
                    }
                });
            });
            log('hostCustomMap:', hostCustomMap);


            log("customMadeIconArray:", customMadeIconArray);


            // 翻译引擎添加到图标
            let isIconImgMore = false;
            customMadeIconArray.forEach(function (obj) {
                let img = document.createElement('img');
                img.setAttribute('src', obj.image);
                img.setAttribute('alt', obj.name);
                img.setAttribute('title', obj.name);
                img.addEventListener('mouseup', function () {
                    dataTransfer.beforePopup(obj.popup);
                });
                //判断是不是"更多"按钮之后的引擎
                if (isIconImgMore) {
                    img.setAttribute('is-more', 'true');
                }
                //判断是不是"更多"按钮
                if (obj.id == 'more') {
                    isIconImgMore = true;
                }
                icon.appendChild(img);
            });

            // iframe 工具库加入 Shadow
            shadow.appendChild(iframe);
            iframeWin = iframe.contentWindow;
            iframeDoc = iframe.contentDocument;
            // 外部样式表
            let link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = createObjectURLWithTry(new Blob(['\ufeff', style.textContent], {
                type: 'text/css;charset=UTF-8'
            }));
            shadow.appendChild(style); // 内部样式表
            shadow.appendChild(link); // 外部样式表
            adoptedStyleSheets(shadow, style.textContent); // CSSStyleSheet 样式
            shadow.appendChild(icon); // 翻译图标加入 Shadow


            log('url: ' + window.location.href);
            log('host: ' + window.location.host);

            log('get data from background');
            //发送消息，要求获取保存的翻译引擎跳转网站
            chrome.runtime.sendMessage({ask: "getItem", key:gm.REDIRECT_URL}, function(response) {
              log("get response");
              log(gm.REDIRECT_URL + ": ");
              log(response);

              if (response.value) {
                redirect_url = response.value;

                //读取保存的用户文本内容
                chrome.runtime.sendMessage({ask: "getItem", key:gm.TEXT}, function(response2) {
                  log(gm.TEXT + ": ");
                  log(response2);

                  if(response2.value) {
                    text = response2.value;

                    //判断是否是打开的翻译引擎页面
                    if (window.location.host in hostCustomMap) {
                        //执行填充数据进行翻译的操作
                        dataTransfer.beforeCustom(hostCustomMap[window.location.host]);
                    }

                  } else {
                    text = "";
                  }

                });

              } else {
                redirect_url = "";
              }
            });

            // 鼠标事件：防止选中的文本消失
            document.addEventListener('mousedown', function (e) {
                if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) { // 点击了翻译图标
                    e.preventDefault();
                }
            });
            // 鼠标事件：防止选中的文本消失；显示、隐藏翻译图标
            document.addEventListener('mouseup', showIcon);
            // 选中变化事件
            document.addEventListener('selectionchange', showIcon);
            document.addEventListener('touchend', showIcon);


        });


    });




    /**带异常处理的 createObjectURL*/
    function createObjectURLWithTry(blob) {
        try {
            return iframeWin.URL.createObjectURL(blob);
        } catch (error) {
            log(error);
        }
        return '';
    }





    /**解决 Content-Security-Policy 样式文件加载问题（Chrome 实验功能）*/
    function adoptedStyleSheets(bindDocumentOrShadowRoot, cssText) {
        try {
            if (bindDocumentOrShadowRoot.adoptedStyleSheets) {
                cssText = cssText.replace(/\/\*.*?\*\//ig, ''); // remove CSS comments
                let cssSheet = new CSSStyleSheet();
                let styleArray = cssText.split('\n');
                for (let i = 0; i < styleArray.length; i++) {
                    let line = styleArray[i].trim();
                    if (line.length > 0) {
                        cssSheet.insertRule(line);
                    }
                }
                bindDocumentOrShadowRoot.adoptedStyleSheets = [cssSheet];
            }
        } catch (error) {
            log(error);
        }
    }




    /**显示 icon*/
    function showIcon(e) {
        log('showIcon event:', e);
        let offsetX = 4; // 横坐标翻译图标偏移
        let offsetY = 8; // 纵坐标翻译图标偏移
        // 更新翻译图标 X、Y 坐标
        if (e.pageX && e.pageY) { // 鼠标
            log('mouse pageX/Y');
            pageX = e.pageX;
            pageY = e.pageY;
        }
        if (e.changedTouches) { // 触屏
            if (e.changedTouches.length > 0) { // 多点触控选取第 1 个
                log('touch pageX/Y');
                pageX = e.changedTouches[0].pageX;
                pageY = e.changedTouches[0].pageY;
                // 触屏修改翻译图标偏移（Android、iOS 选中后的动作菜单一般在当前文字顶部，翻译图标则放到底部）
                offsetX = -26; // 单个翻译图标块宽度
                offsetY = 16 * 3; // 一般字体高度的 3 倍，距离系统自带动作菜单、选择光标太近会导致无法点按
            }
        }
        log('selected:' + selected + ', pageX:' + pageX + ', pageY:' + pageY)
        if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) { // 点击了翻译图标
            e.preventDefault();
            return;
        }
        selected = window.getSelection().toString().trim(); // 当前选中文本
        log('selected:' + selected + ', icon display:' + icon.style.display);
        if (selected && icon.style.display != 'block' && pageX && pageY) { // 显示翻译图标
            log('show icon');
            icon.style.top = pageY + offsetY + 'px';
            icon.style.left = pageX + offsetX + 'px';
            icon.style.display = 'block';
            // 兼容部分 Content Security Policy
            icon.style.position = 'absolute';
            icon.style.zIndex = zIndex;
        } else if (!selected) { // 隐藏翻译图标
            log('hide icon');
            hideIcon();
        }
    }


})();
