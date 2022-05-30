
(function () {
    'use strict';

    //init
    //设置set方法
    gm.set = function (key, value) {
        //set方法只能存放对象，因此key不能是个变量。所以要把ke:value先转换成一个对象
        let item = {};
        item[key] = value;
        chrome.storage.local.set(item);
    }

    //setting
    settings();
    function settings() {

        //init
        let hideConfig = {};
        let sortConfig = [];
        let customMadeIconArray = [];
        let tempArray = [];
        let sorted = {};
        let allSortedIconArray = [];

        //读取保存的各个引擎是否隐藏的数据
        chrome.storage.local.get([gm.HIDE], function(result){
            log(gm.HIDE, result[gm.HIDE]);
            if (result && result[gm.HIDE]) {
                hideConfig = result[gm.HIDE];
            }
            log('hideConfig: ', hideConfig);

            //读取排序的数据
            chrome.storage.local.get([gm.SORT], function(result){
                log(gm.SORT, result[gm.SORT]);
                if (result && result[gm.SORT]) {
                    sortConfig = result[gm.SORT];
                }
                log('sortConfig: ', sortConfig);

                // hide
                iconArray.forEach(function (obj) {
                    tempArray.push(obj);
                });
                // sort
                sortConfig.forEach(function (id) {
                    tempArray.forEach(function (tObj) {
                        if (id == tObj.id) {
                            customMadeIconArray.push(tObj);
                            sorted[id] = true;
                        }
                    });
                });
                tempArray.forEach(function (tObj) {
                    if (!isNotNull(sorted[tObj.id])) {
                        customMadeIconArray.push(tObj);
                    }
                });
                log('customMadeIconArray: ', customMadeIconArray);
                allSortedIconArray = customMadeIconArray;




                //所有设置操作，放在取到上面值之后
                document.body.innerHTML = '';
                document.body.style.padding = '20px';
                let desc = document.createElement('div');
                desc.innerHTML = '<h3>修改配置后，关闭配置页面，刷新网页后生效</h3>';
                let reset = document.createElement('button'); // 重置配置
                reset.innerHTML = '重置为默认设置';
                reset.addEventListener('click', function () {
                    let r = confirm("确定要重置吗？");
                    if (r == true) {
                        gm.reset();
                        settings();
                    }
                });
                document.body.appendChild(desc);
                document.body.appendChild(reset);
                document.body.appendChild(document.createElement('hr'));
                allSortedIconArray.forEach(function (obj, i) {
                    let item = document.createElement('div'),
                        name = document.createElement('span'),
                        up = document.createElement('a'),
                        down = document.createElement('a'),
                        show = document.createElement('a'),
                        span = document.createElement('span');
                    name.innerHTML = obj.name;
                    span.innerHTML = '&nbsp;&nbsp;';
                    up.innerHTML = '上移';
                    up.setAttribute('href', '');
                    up.setAttribute('index', i);
                    up.addEventListener('click', function (e) {
                        let index = myParseInt(this.getAttribute('index'));
                        log("move up index is: " + index);
                        let newIconArray = arrayMove(allSortedIconArray, index, index - 1);
                        let idArray = [];
                        newIconArray.forEach(function (sObj) {
                            idArray.push(sObj.id);
                        });
                        gm.set(gm.SORT, idArray);
                        settings();
                        //防止默认事件
                        e.preventDefault();
                    });
                    down.innerHTML = '下移';
                    down.setAttribute('href', '');
                    down.setAttribute('index', i);
                    down.addEventListener('click', function (e) {
                        let index = myParseInt(this.getAttribute('index'));
                        log("move down index is: " + index);
                        let newIconArray = arrayMove(allSortedIconArray, index, index + 1);
                        let idArray = [];
                        newIconArray.forEach(function (sObj) {
                            idArray.push(sObj.id);
                        });
                        gm.set(gm.SORT, idArray);
                        settings();
                        //防止默认事件
                        e.preventDefault();
                    });
                    show.innerHTML = '显示';
                    show.setAttribute('show-id', obj.id);
                    if (isNotNull(hideConfig[obj.id])) {
                        show.innerHTML = '隐藏';
                    }
                    show.setAttribute('href', '');
                    show.addEventListener('click', function (e) {
                        if (this.innerHTML == '显示') { // 隐藏
                            if (this.getAttribute('show-id') != 'settings') {
                                hideConfig[this.getAttribute('show-id')] = true;
                            }
                        } else { // 显示
                            delete hideConfig[this.getAttribute('show-id')];
                        }
                        gm.set(gm.HIDE, hideConfig);
                        settings();
                        //防止默认事件
                        e.preventDefault();
                    });
                    item.appendChild(up);
                    item.appendChild(span.cloneNode(true));
                    item.appendChild(down);
                    item.appendChild(span.cloneNode(true));
                    item.appendChild(show);
                    item.appendChild(span.cloneNode(true));
                    item.appendChild(name);
                    document.body.appendChild(item);
                    document.body.appendChild(document.createElement('hr'));
                });


            });


        });
            
    }




    /**数组移动*/
    function arrayMove(arr, oldIndex, newIndex) {
        if (oldIndex < 0 || oldIndex >= arr.length || newIndex < 0 || newIndex >= arr.length) {
            return arr;
        }
        if (newIndex >= arr.length) {
            let k = newIndex - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
        return arr;
    };




})();
