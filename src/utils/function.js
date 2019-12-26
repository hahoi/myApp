export default {

    //樹狀結構操作


    //樹狀JSON深層拷貝（可選擇欄位）
    cloneJSON(obj) {
        // basic type deep copy
        if (obj === null || obj === undefined || typeof obj !== 'object') {
            return obj
        }
        // array deep copy
        if (obj instanceof Array) {
            let cloneA = [];
            for (let i = 0; i < obj.length; ++i) {
                cloneA[i] = this.cloneJSON(obj[i]);
            }
            return cloneA;
        }
        // object deep copy
        let cloneO = {};
        for (let i in obj) {
            //只選擇要拷貝的個欄位，注意 呼叫此函數 這裡要修改
            if (i == 'title' || i == 'id' || i == 'children' || i == 'expanded'
                // || i == 'depart' || i == 'status' || i == 'remaindays' || i == 'memo'
                // || i == 'remaindays' || i == 'pgdesc' || i == 'cfmpic' || i == 'process'
            )
                cloneO[i] = this.cloneJSON(obj[i]);
        }
        return cloneO;
    },
    //樹狀JSON深層拷貝
    deepCopy(obj) {
        // basic type deep copy
        if (obj === null || obj === undefined || typeof obj !== 'object') {
            return obj
        }
        // array deep copy
        if (obj instanceof Array) {
            let cloneA = [];
            for (var i = 0; i < obj.length; ++i) {
                cloneA[i] = this.deepCopy(obj[i]);
            }
            return cloneA;
        }
        // object deep copy
        let cloneO = {};
        for (var i in obj) {
            cloneO[i] = this.deepCopy(obj[i]);
        }
        return cloneO;
    },

    //樹狀JSON深層拷貝，加上 array_key 在object上
    DBdeepCopy(obj, key = 0) {
        // basic type deep copy
        if (obj === null || obj === undefined || typeof obj !== 'object') {
            return obj
        }
        // array deep copy
        if (obj instanceof Array) {
            let cloneA = [];
            for (var i = 0; i < obj.length; ++i) {
                cloneA[i] = this.DBdeepCopy(obj[i], i); // i=key
            }
            return cloneA;
        }
        // object deep copy
        let cloneO = {};
        cloneO.key = key // set key
        for (let i in obj) {
            cloneO[i] = this.DBdeepCopy(obj[i], key);
        }
        return cloneO;
    },

    // 樹狀 => 一維陣列
    jsonToArray(nodes, pid = 0) {
        let r = [];
        if (Array.isArray(nodes)) {
            for (var i = 0, l = nodes.length; i < l; i++) {

                nodes[i]['pid'] = pid
                r.push(nodes[i]);
                if (Array.isArray(nodes[i]["children"]) && nodes[i]["children"].length > 0)
                    //将children递归的push到最外层的数组r里面
                    r = r.concat(this.jsonToArray(nodes[i]["children"], nodes[i]['id']));
                delete nodes[i]["children"]

            }
        }
        // nodes.length = 0
        return r;
    },

    //  一維陣列 => 樹狀  ========//問題 無父層的無法顯示
    arrayToJson(data) {
        let tree = data.filter((father) => {       //循环所有项
            let branchArr = data.filter((child) => {
                return father.id == child.pid      //返回每一项的子级数组
            });
            if (branchArr.length > 0) {
                father.children = branchArr;    //如果存在子级，则给父级添加一个children属性，并赋值
            }
            // return father.pid == "1234567890";   //返回第一层
            return father.pid == 0;           //返回第一层
        });
        // console.log("json",tree)
        return tree     //返回树形数据
    },

    //=======一維陣列 => 樹狀======= //使用有問題 nodes會重複拷貝nodes越來越大，===========
    arrayTransTree(list, idstr = "id", pidstr = "pid") {
        var result = [], temp = {};
        for (var i = 0; i < list.length; i++) {
            temp[list[i][idstr]] = list[i];//将nodes数组转成对象类型
        }
        for (var j = 0; j < list.length; j++) {
            let tempVp = temp[list[j][pidstr]]; //获取每一个子对象的父对象
            if (tempVp) {//判断父对象是否存在，如果不存在直接将对象放到第一层
                if (!tempVp["nodes"]) tempVp["nodes"] = [];//如果父元素的nodes对象不存在，则创建数组
                tempVp["nodes"].push(list[j]);//将本对象压入父对象的nodes数组
            } else {
                result.push(list[j]);//将不存在父对象的对象直接放入一级目录
            }
        }
        // console.log("tree",result)
        return result;
    },

    //=======一維陣列 => 樹狀 ====//問題 children 會重複拷貝，顯示的tree會越來越大==============
    arrayToTree(treeArray) {
        let r = []
        let tmpMap = {};
        for (let i = 0, l = treeArray.length; i < l; i++) {
            // 以每条数据的id作为obj的key值，数据作为value值存入到一个临时对象里面
            //将nodes数组转成对象类型 array => object {1234567890: treeArray[i] }
            tmpMap[treeArray[i]["id"]] = treeArray[i];
        }
        for (let i = 0, l = treeArray.length; i < l; i++) {
            let key = tmpMap[treeArray[i]["pid"]]; //获取每一个子对象的父对象

            //循环每一条数据的pid，假如这个临时对象有这个key值，就代表这个key对应的数据有children，需要Push进去
            if (key) { //判断父对象是否存在，如果不存在直接将对象放到第一层
                if (!key["children"]) key["children"] = []; //如果父元素的children对象不存在，则创建数组
                key["children"].push(treeArray[i]); //将本对象压入父对象的children数组
            } else {
                //如果没有这个Key值，那就代表没有父级,直接放在最外层 放入一级目录
                r.push(treeArray[i]);
            }
        }
        return r
    },

    //show Tree
    render(treeJson) {
        if (!Array.isArray(treeJson) || treeJson.length <= 0) { return "" }
        let str = "<ul>"
        treeJson.forEach( item => {
            let type = (Array.isArray(item.children) && item.children.length > 0) ? "dir":"file"
            str += "<li>" + this.RemoveHTML(item.title) +type
            if (Array.isArray(item.children) && item.children.length > 0) {
                type = "dir"
                str += this.render(item.children) 
            }
            str += "</li>"
        })
        str += "</ul>"
        return str
    },


    RemoveHTML( strText ) {
        const regEx = /<[^>]*>/g;
        return strText.replace(regEx, "");
    },

    //數字加上千分逗號
    addCommas(nStr) {
        nStr += '';
        let x = nStr.split('.');
        let x1 = x[0];
        let x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    },
    //數字十位數補0
    pad(n) { return n < 10 ? '0' + n : n },

    //產生隨機ID，利用時間函數
    DateStringID(d) {
        return d.getUTCFullYear() +
            pad(d.getUTCMonth() + 1) +
            pad(d.getUTCDate())
    },
    cal_quality(size) {
        let quality = (480000 / parseFloat(size))
        if (quality < 0.1) {
            quality = 0.1
        } else if (quality >= 0.9) {
            quality = 0.9
        }
        return quality.toFixed(1)

    },
    //经纬度转换为十进制   
    change_latlng(latlng) {
        var arr = latlng;
        // console.log( arr )
        // let a = arr[0].numerator / arr[0].denominator //Number object 原型計算
        // let b = arr[1].numerator / arr[1].denominator
        // let c = arr[2].numerator / arr[2].denominator

        return parseFloat(arr[0] + arr[1] / 60 + arr[2] / 3600)
    },

    //檢查是否在陣列中(string, "string,string,...")
    in_array(stringToSearch, stringToSplit) {
        let arrayToSearch = stringToSplit.split(',')
        for (let s = 0; s < arrayToSearch.length; s++) {
            let thisEntry = arrayToSearch[s].toString();
            if (thisEntry == stringToSearch) {
                return true;
            }
        }
        return false;
    },
    //檢查是否存在陣列中
    inArray: function (value, arr) {
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] === value) {
                return true;
            }
        }
        return false;
    },
    //數字金額轉換成國字大寫金額
    capitalMoney(tranvalue) {
        try {
            var i = 1;
            var dw2 = new Array("", "萬", "億"); //大单位
            var dw1 = new Array("拾", "佰", "仟"); //小单位
            var dw = new Array("零", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖"); //整数部分用
            //以下是小写转换成大写显示在合计大写的文本框中     
            //分离整数与小数
            var source = this.splits(tranvalue);
            var num = source[0];
            var dig = source[1];
            //转换整数部分
            var k1 = 0; //计小单位
            var k2 = 0; //计大单位
            var sum = 0;
            var str = "";
            var len = source[0].length; //整数的长度
            for (i = 1; i <= len; i++) {
                var n = source[0].charAt(len - i); //取得某个位数上的数字
                var bn = 0;
                if (len - i - 1 >= 0) {
                    bn = source[0].charAt(len - i - 1); //取得某个位数前一位上的数字
                }
                sum = sum + Number(n);
                if (sum != 0) {
                    str = dw[Number(n)].concat(str); //取得该数字对应的大写数字，并插入到str字符串的前面
                    if (n == '0') sum = 0;
                }
                if (len - i - 1 >= 0) { //在数字范围内
                    if (k1 != 3) { //加小单位
                        if (bn != 0) {
                            str = dw1[k1].concat(str);
                        }
                        k1++;
                    } else { //不加小单位，加大单位
                        k1 = 0;
                        var temp = str.charAt(0);
                        if (temp == "万" || temp == "亿") //若大单位前没有数字则舍去大单位
                            str = str.substr(1, str.length - 1);
                        str = dw2[k2].concat(str);
                        sum = 0;
                    }
                }
                if (k1 == 3) //小单位到千则大单位进一
                {
                    k2++;
                }
            }
            //转换小数部分
            var strdig = "";
            if (dig != "") {
                let n = dig.charAt(0);
                if (n != 0) {
                    strdig += dw[Number(n)] + "角"; //加数字
                }
                n = dig.charAt(1);
                if (n != 0) {
                    strdig += dw[Number(n)] + "分"; //加数字
                }
            }
            str += "元" + strdig;
        } catch (e) {
            return "0元";
        }
        return str;
    },
    //拆分整数与小数
    splits(tranvalue) {
        var value = new Array('', '');
        let temp = tranvalue.split(".");
        for (var i = 0; i < temp.length; i++) {
            value = temp;
        }
        return value;
    },

}