<template>
  <div class="tree">
    <v-container>
      <v-row align="center" justify="space-around" class="mx-0 px-0">
        <div class="text-center mb-4">
          <v-overlay :opacity="0.5" z-index="100" :value="loading">
            <img src="@/assets/loading.gif" style="height:125px" />
          </v-overlay>
        </div>

        <v-expansion-panels accordion>
          <v-expansion-panel>
            <v-expansion-panel-header class>
              <span class="subtitle-1 font-weight-bold">功能選項</span>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row align="center" justify="space-around" class="mx-0 px-0">
                <v-col cols="8" class="py-0 px-0">
                  <v-text-field label="關鍵字搜尋..." v-model="searchword"></v-text-field>
                </v-col>
                <v-col cols="2" class="py-0 px-0 mx-0">
                  <v-btn color="info" @click="searchFun">搜尋</v-btn>
                </v-col>
              </v-row>
              <v-row align="center" justify="space-around" class="mx-0 px-0">
                <v-col cols="6" class="py-0">
                  <v-btn text color="orange" @click="nearreported">顯示幾天內填報的資料</v-btn>
                </v-col>
                <v-col cols="2" class="py-0">
                  <v-switch v-model="searchProgress"></v-switch>
                </v-col>
                <v-col cols="4" class="py-0 px-0">搜尋填報資料</v-col>
              </v-row>
              <v-row align="center" justify="space-around" class="mx-0 px-0">
                <v-col cols="8" class="py-0">
                  <v-menu
                    v-model="menu2"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field v-model="checkDate" label="選擇檢核日期" v-on="on"></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="checkDate"
                      first-day-of-week="1"
                      locale="zh-TW"
                      @input="menu2 = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>

                <v-col cols="4" class="py-0 px-0 mx-0">
                  <v-btn text color="orange" @click="checkDatehandle">
                    <span class="title">期程檢核</span>
                  </v-btn>
                </v-col>
              </v-row>
              <v-row align="center" justify="space-around" class="mx-0 px-0">
                <v-col cols="3" class="py-0 px-0 mx-0">
                  <v-checkbox v-model="multiple" label="挑選框"></v-checkbox>
                </v-col>

                <v-col cols="8">
                  <v-btn text color="indigo lighten-2" @click="report">
                    <span class="title">列印輸出</span>
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-row>
    </v-container>

    <!-- ==== v-tree ========-->
    <v-tree
      ref="tree1"
      :data="treeData"
      :tpl="tpl"
      :multiple="multiple"
      :halfcheck="halfcheck"
      @node-click="nodeCheckClick"
      @node-check="nodeCheckClick"
    />

    <scroll-up :scroll-duration="1000"></scroll-up>

    <!-- =========== 顯示詳細資料 ========= -->
    <v-container>
      <v-row>
        <v-dialog
          v-model="workDetailDialog"
          fullscreen
          hide-overlay
          transition="dialog-right-transition"
        >
          <v-toolbar dark color="primary">
            <v-btn dark text class="px-0" @click="workDetailClose">
              <v-icon>mdi-backspace</v-icon>
              <span class="title">退回</span>
            </v-btn>
            <!-- <v-toolbar-title>退回</v-toolbar-title> -->
            <v-spacer></v-spacer>
            <!-- <v-btn icon dark text class="mx-2" @click="workDetailDialog = false">
              <v-icon>mdi-content-save-outline</v-icon>
              <span class="title">儲存</span>
            </v-btn>-->
          </v-toolbar>
          <!-- max-width="550" tile="true" outlined -->
          <v-card class="mx-auto" tile>
            <v-card-text class="px-3">
              <!-- <v-divider></v-divider> -->
              <!-- 子組件渲染 -->
              <workItem2DetailReadonly :propData="todo"></workItem2DetailReadonly>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-row>
    </v-container>

    <!-- =========== 列印輸出 ========= -->
    <v-container>
      <v-row>
        <v-dialog
          v-model="ReportDialog"
          fullscreen
          hide-overlay
          transition="dialog-right-transition"
        >
          <!-- 子組件渲染 -->
          <Report :propData="selectedItems" @listenToChild="getChildData"></Report>
        </v-dialog>
      </v-row>
    </v-container>
    <v-snackbar v-model="snackbar" :timeout="timeout">
      {{ databasemessage }}
      <v-btn dark text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import workItem2DetailReadonly from "../components/workItem2DetailReadonly.vue";
import Report from "../components/Report.vue";

import { dbFirestore, databaseName2 } from "@/fb";
import com_fun from "../utils/function";
import moment from "moment";
import ScrollUp from "vue-scroll-up";
import "vue-scroll-up/dist/style.css";

export default {
  name: "",
  data() {
    return {
      loading: true,
      workDetailDialog: false,
      ReportDialog: false,
      searchword: "",

      treeData: [], //樹狀
      db_data: [], //db讀取，一維陣列
      todo: {},
      ShowRecentReport: 10, //預設顯示10天內填報資料
      searchProgress: false, //預設不搜尋填報資料

      snackbar: false,
      timeout: 2000,
      databasemessage: "",

      checkDate: moment().format("YYYY-MM-DD"), //檢核日期
      menu2: false,

      //v-tree屬性
      halfcheck: false,
      multiple: false,
      selectedItems: []
    };
  },
  components: {
    workItem2DetailReadonly,
    Report,
    ScrollUp
  },
  created() {},
  mounted() {
    // this.getServerTime();
    this.readData();
  },
  watch: {},
  computed: {},
  methods: {
    //顯示幾天內填報的資料
    nearreported() {
      this.$dialog
        .prompt({
          text: "天數",
          title: "顯示幾天內填報的資料：",
          persistent: false
        })
        .then(res => {
          if (res) {
            this.ShowRecentReport = res;
            this.handleData(this.db_data);
          }
        });
    },
    //輸入檢核日期處理檢核
    checkDatehandle() {
      //處理檢核前重置所有節點顯示狀態
      let handleArrayData = com_fun.deepCopy(this.db_data); //深拷貝一份避免副作用

      let currentItem = handleArrayData.map(doc => {
        return this.handleCheckDateNode(doc);
      });
      this.treeData = com_fun.arrayToJson(currentItem);
    },

    //讀取DB資料
    readData() {
      this.loading = true;
      this.db_data = []; //清空陣列
      dbFirestore
        .collection(databaseName2)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            this.db_data.push(doc.data());
          });
        })
        .then(() => {
          this.handleData(this.db_data);
        })
        .then(() => {
          this.loading = false;
        });
    },

    //處理所有節點顯示狀態
    handleData(handleArrayData) {
      let currentArrayData = handleArrayData.map(doc => {
        return this.handleNodeData(doc);
      });
      // 此處要特別注意，arrayToTree前一定要深拷貝一份避免副作用(被加入children)
      let tempArray = com_fun.deepCopy(currentArrayData); //深拷貝一份避免副作用
      this.treeData = com_fun.arrayToJson(tempArray);
      // console.log(currentArrayData, this.db_data)//測試是否被加入children
      return currentArrayData;
    },

    //處理每個節點顯示狀態
    handleNodeData(doc) {
      // let currentItem = handleArrayData.map(doc => {
      if (!doc.t_title) {
        doc.t_title = doc.title; //第一次，先存起來
      } else {
        doc.title = doc.t_title; //還原
      }

      //先將填報進度排序，最後填報(日期近的)排上面
      if (doc.progress && doc.progress.length > 0) {
        doc.progress.sort(function(a, b) {
          return moment(b.pgdate).diff(moment(a.pgdate)); //b - a > 0 天數大的排在前面
        });
      }
      //計算落後天數
      let days = "";
      //已經開始，還沒完成，結束日已超過今天，就是落後，天數顯示紅色
      if (moment(doc.startDate) < moment() && doc.status != "完成") {
        days = moment(doc.endDate).diff(moment(), "day");
        doc.remaindays = `<span class="red--text">${days}天</span>`;
      } else {
        doc.remaindays = "";
      }
      //完成顯示綠色
      if (doc.status == "完成") {
        doc.title = "<span class='green--text'>" + doc.title + "</span>";
      }
      // 不顯示、停止，回傳空物件
      if (doc.status == "不顯示" || doc.status == "停止") return {};

      //剩餘天數為負數，title顯示為紅色
      if (days <= 0 && days !== "") {
        doc.title = "<span class='red--text'>" + doc.title + "</span>";
      }
      //已設定開始日期，但時間未到，title顯示灰色
      if (moment().isBefore(doc.startDate) || doc.startDate == "") {
        doc.title = "<span class='grey--text'>" + doc.title + "</span>";
      }
      //給詳細畫面的標題用(不顯示填報進度訊息)
      doc.ptitle = doc.title;

      //有填報的才顯示
      if (doc.progress && doc.progress.length > 0) {
        //輸入0時，不顯示
        if (this.ShowRecentReport == 0) {
          doc.title = doc.title; //還原
        } else if (
          // ?天以內填報的才顯示
          moment().diff(moment(doc.progress[0].pgdate), "day") <=
          this.ShowRecentReport
        ) {
          doc.title = `${doc.title}-${doc.depart} 【<span class="blue--text">${doc.progress[0].pgdate} - ${doc.progress[0].pgdesc}</span>】`;
        }
      }
      return doc; //object ，注意有回傳值
    },

    //重置收尋
    restsearchFun() {
      this.searchword = "";
      this.readData();
      return true;
    },

    // ==================搜尋======================
    searchFun() {
      // this.$refs.tree1.searchNodes(this.searchword);
      if (this.searchword === "") {
        this.readData();
        return true;
      }

      this.searchword = this.searchword.trim();
      //過濾條件用空白分割成字串，用正則可一個或多個空白去分割
      let arrFilters = this.searchword.split(/\s+/);
      // console.log(arrFilters);

      // let nodeArray = this.$refs.tree1.getNodes(); //取的全部陣列 []

      //處理搜尋前重置所有節點顯示狀態
      let nodeArray = this.db_data.map(doc => {
        return this.handleNodeData(doc);
      });

      let field = []; //搜尋欄位
      let progressField = []; //搜尋填報資料欄位
      if (this.searchProgress === true) {
        //要搜尋填報資料
        //搜尋的欄位，progress是陣列，需特殊處理
        field = [
          "title",
          "depart",
          "startDate",
          "endDate",
          "status",
          "progress"
        ]; //搜尋這些個欄位
        progressField = ["pgdate", "pgdesc"]; //progress 搜尋這些個欄位
      } else {
        //不要搜尋填報資料
        field = ["title", "depart", "startDate", "endDate", "status"]; //搜尋這些個欄位
      }

      //底下程式碼可以搜尋所有的欄位，目前搜尋欄位用指定的
      //列出所有欄位，field過濾只有是string或是array性質的欄位，才可以搜尋
      // let field = []
      // Object.keys(nodeArray[0]).forEach((a)=>{
      //   if(typeof nodeArray[0][a] === "string" ) field.push(a)
      //   if(typeof nodeArray[0][a] === "object" ) field.push(a)
      // })
      // console.log(field)

      let matchArr = nodeArray
        .filter(item => {
          let contain_flag = true; // and 都符合
          let arr_flag = [];
          let x = arrFilters.length; // flag陣列長度=要搜尋關鍵字的個數
          while (x--) {
            arr_flag[x] = false; //先將判斷flag，全部設為 false
          }
          // 多個欄位迴圈
          field.forEach(f => {
            //每個欄位名稱
            if (!item[f]) return false;

            //如果欄位是陣列的話，是陣列並且裡面有值，才需另外處理
            if (Array.isArray(item[f]) && item[f].length > 0) {
              // console.log(item[f][0]);

              // 多個搜尋關鍵字迴圈
              arrFilters.forEach((str, index) => {
                //pregress陣列有多項，須一一搜尋
                item[f].forEach(a => {
                  // // 底下程式碼可以搜尋所有的欄位，目前搜尋欄位用指定的
                  // Object.keys(a).forEach(b => { //把物件轉換成陣列處理
                  //   // console.log(a, b, a[b]); //a= progress[...], b= object key ,a[b]=pregress中某個欄為值
                  //   if (typeof a[b] === "string") {
                  //     //只有字串欄位才搜尋
                  //     if (a[b].indexOf(str) != -1) {
                  //       //符合
                  //       // console.log(b,index);
                  //       arr_flag[index] = true; //先把符合的記下來
                  //       // console.log(arr_flag);
                  //     }
                  //   }
                  // });
                  progressField.forEach(b => {
                    //progress 搜尋這些個欄位 ["pgdate","pgdesc"]
                    if (a[b].indexOf(str) != -1) {
                      //符合
                      arr_flag[index] = true; //先把符合的記下來
                    }
                  });
                });
              });
            } else {
              //一般的字串欄位
              // 多個搜尋關鍵字迴圈
              arrFilters.forEach((str, index) => {
                let match = item[f].indexOf(str); //-1沒有符合
                if (match != -1) {
                  //符合
                  arr_flag[index] = true; //先把符合的記下來
                }
              });
            }
          });
          //搜尋多條件，and 計算，其中一個是false就不符合
          arr_flag.forEach(function(a) {
            if (a == false) {
              contain_flag = false; //and
            }
          });
          return contain_flag; //已過濾符合條件的陣列 matchArr
        })
        .map(p => {
          // console.log(p);
          //查到的關鍵字，紅色顯示
          if (this.searchword == "") return p; //開始查詢條件空白時，不處理
          let cache = JSON.parse(JSON.stringify(p)); //拷貝 p 物件
          field.forEach(f => {
            // console.log(f, cache[f]);
            //如果欄位是陣列的話，不管有沒有值，都需另外處理
            if (Array.isArray(cache[f])) {
              if (cache[f].length > 0) {
                //有內容才置換
                // console.log(cache[f][0]);

                // 多個搜尋關鍵字迴圈
                arrFilters.forEach(str => {
                  //pregress陣列有多項，須一一搜尋
                  cache[f].forEach(a => {
                    // 底下程式碼可以搜尋所有的欄位，目前搜尋欄位用指定的
                    // Object.keys(a).forEach(b => { //把物件轉換成陣列處理
                    //   // console.log(a, b, a[b]); //a= progress[...], b= object key ,a[b]=pregress中某個欄為值
                    //   if (typeof a[b] === "string") {
                    //     //只有字串欄位才搜尋並且置換
                    //     let regex = new RegExp(str, "i");
                    //     let match = a[b].match(regex);
                    //     // console.log(match)
                    //     if (match)
                    //       a[b] = a[b].replace(
                    //         regex,
                    //         "<span class='red white--text'>" + match[0] + "</span>"
                    //       );
                    //   }
                    // });
                    progressField.forEach(b => {
                      //progress 搜尋這些個欄位 ["pgdate","pgdesc"]
                      let regex = new RegExp(str, "i");
                      let match = a[b].match(regex);
                      // console.log(match)
                      if (match)
                        a[b] = a[b].replace(
                          regex,
                          "<span class='red white--text'>" +
                            match[0] +
                            "</span>"
                        );
                    });
                  });
                });
              }
            } else {
              //一般字串欄位
              //每個欄位名稱
              //處理多欄位
              arrFilters.forEach(s => {
                //每個搜尋關鍵字
                //處理多查詢條件
                if (typeof cache[f] === "undefined") {
                  return false;
                }
                let regex = new RegExp(s, "i");
                let match = cache[f].match(regex);
                // console.log(match)
                if (match)
                  cache[f] = cache[f].replace(
                    regex,
                    "<span class='red white--text'>" + match[0] + "</span>"
                  );
              });
            }
          });
          // console.log(cache)
          cache.expanded = true; //全部展開
          return cache; //回傳複製替換過的一份
        });
      // console.table(matchArr);
      this.treeData = com_fun.arrayToTree(matchArr);
    },

    //處理樹狀結構，按一下顯示詳細資料
    tpl(...args) {
      let { 0: node, 1: ctx, 2: parent, 3: index } = args;
      let titleClass = node.selected
        ? "node-title node-selected"
        : "node-title";
      if (node.searched) titleClass += " node-searched";
      return (
        <span>
          <span
            class={titleClass}
            domPropsInnerHTML={node.title}
            onClick={() => {
              this.$store.commit("setLoading", true);

              ctx.parent.nodeSelected(ctx.props.node);

              let parentEndDate;
              //最上層沒有patent
              if (parent === null) {
                parentEndDate = this.$store.getters.projectEndDate;
              } else {
                parentEndDate =
                  parent.endDate || this.$store.getters.projectEndDate;
              }

              this.todo = {
                parentEndDate, //加上上層專案結束日期·專案管理用，要轉成文字日期
                ...node
              };
              // console.log(this.todo);
              this.workDetailDialog = true;
            }}
          />
        </span>
      );
    },

    workDetailClose() {
      this.workDetailDialog = false;
    },

    //處理檢核日期每個節點顯示狀態
    handleCheckDateNode(doc) {
      // let currentItem = handleArrayData.map(doc => {
      if (!doc.t_title) {
        doc.t_title = doc.title; //第一次，先存起來
      } else {
        doc.title = doc.t_title; //還原
      }
      // doc.expanded = true; //全部展開
      //預設只打開第一層
      if (doc.pid == this.$store.getters.LevelOneID) doc.expanded = false;

      let days = "";
      if (
        moment(doc.startDate) < moment(this.checkDate) &&
        doc.status != "完成"
      ) {
        //計算落後天數
        days = moment(doc.endDate).diff(moment(this.checkDate), "day");
        // console.log(days);
        doc.remaindays = `<span class="red--text">${days}天</span>`;
      } else {
        doc.remaindays = "";
      }

      if (doc.status == "完成") {
        //完成顯示綠色
        doc.title = "<span class='green--text'>" + doc.title + "</span>";
      }
      if (doc.status == "不顯示" || doc.status == "停止") return {}; // 不顯示、停止，回傳空物件

      if (days <= 0 && days !== "") {
        //剩餘天數為負數，顯示為紅色
        // doc.title = "<span class='red--text'>" + doc.title + "</span>";
        doc.title = `<span class="red--text">${doc.title}</span>
                                <span class="deep-purple--text">(期限:${doc.endDate})</span >`;
      }
      if (
        moment(this.checkDate).isBefore(doc.startDate) ||
        doc.startDate == ""
      ) {
        //已設定開始日期，但時間未到
        doc.title = "<span class='grey--text'>" + doc.title + "</span>";
      }
      doc.ptitle = doc.title;

      return doc; //object
    },
    report() {
      let checkedNode = [];
      if (this.multiple) {
        checkedNode = this.$refs.tree1.getCheckedNodes(true);
        // console.log(checkedNode);
      }
      this.selectedItems = checkedNode.map(x => {
        let progress = "";
        if (x.progress.length > 0) {
          progress = `${x.progress[0].pgdesc}(${x.progress[0].pgdate})`;
        }
        let status = (x.status === "完成") ? x.status : x.remaindays 

        return {
          id: x.id,
          depart: x.depart,
          endDate: x.endDate,
          title: x.title,
          status: status,
          progress: progress,
          // depart: com_fun.RemoveHTML(x.depart),
          // endDate: com_fun.RemoveHTML(x.endDate),
          // title: com_fun.RemoveHTML(x.t_title),
          // status: com_fun.RemoveHTML(x.status),
          // progress: com_fun.RemoveHTML(progress)
        };
      });
      this.ReportDialog = true;
    },
    nodeCheckClick(node, selected) {
      // console.log(node, selected);
    },
    copyText() {},
    getChildData(childData) {
      console.log("retuen childData", childData);
      this.ReportDialog = false;
    },

    //Callback練習
    searchCallback() {
      let a = b => {
        console.log("a");
        if (typeof b === "function") {
          b();
        }
      };

      let b = c => {
        console.log("b");
        if (typeof c === "function") {
          c();
        }
      };

      let c = () => {
        console.log("c");
      };
      // a();
      // b();
      // c();
      // a(c(b));
      b(a(c));
    }
  }
};
</script>

<style scoped>
.halo-tree {
  padding: 0px;
}

@media print {
  .backButton {
    display: none;
  }
}
</style>
