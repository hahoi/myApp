<template>
  <div class="tree">
    <v-container>
      <v-row align="center" justify="center">
        <div class="text-center mb-4">
          <v-overlay :opacity="0.5" z-index="100" :value="loading">
            <img src="@/assets/loading.gif" style="height:125px" />
          </v-overlay>
        </div>
        <v-col cols="12" sm="12" md="6" class="py-0">
          <v-text-field label="關鍵字搜尋..." v-model="searchword"></v-text-field>
        </v-col>
        <v-col cols="3" sm="3" md="2" class="py-0">
          <v-btn color="info" @click="searchFun">搜尋</v-btn>
        </v-col>
        <v-col cols="3" sm="3" md="2" class="py-0 pl-0 pr-5">
          <v-btn color="blue lighten-4" @click="restsearchFun">重置</v-btn>
        </v-col>
        <v-col cols="6" sm="6" md="2" class="py-0">
          <v-btn color="orange" @click="nearreported">顯示近期填報</v-btn>
        </v-col>
        <!-- <v-img src="@/assets/loading.gif" height="40px" v-show="loading" /> -->
      </v-row>
    </v-container>
    <v-tree ref="tree1" :data="treeData" :tpl="tpl" />

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
              <workItem2Detail :propData="todo" @listenToChild="getChildData"></workItem2Detail>
            </v-card-text>
          </v-card>
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
import { dbDatabase, dbFirestore, databaseName2 } from "@/fb";
import com_fun from "../utils/function";
import moment from "moment";

import workItem2Detail from "../components/workItem2Detail.vue";
export default {
  name: "workItem",
  data() {
    return {
      loading: true,
      workDetailDialog: false,
      searchword: "",
      treeData: [], //樹狀
      db_data: [], //db讀取，一維陣列
      todo: {},
      ShowRecentReport: 10, //預設顯示10天內填報資料

      snackbar: false,
      timeout: 2000,
      databasemessage: ""
    };
  },
  components: {
    workItem2Detail
  },
  created() {
    //監聽資料庫變化
    dbFirestore.collection(databaseName2).onSnapshot(res => {
      const changes = res.docChanges();
      changes.forEach(change => {
        if (change.type === "added" && !this.loading) {
          // console.log(this.$store.getters.user.name, "added");
          this.databasemessage =
            this.$store.getters.user.name + " 正在新增資料！";
          this.snackbar = true;
          console.log("added data: ", change.doc.data());
        }
        if (change.type === "modified") {
          // console.log("modified");
          this.databasemessage =
            this.$store.getters.user.name + " 已經修改資料！";
          this.snackbar = true;
          console.log("modified data: ", change.doc.data());
        }
        if (change.type === "removed") {
          // console.log("removed");
          this.databasemessage =
            this.$store.getters.user.name + " 已經刪除資料！";
          this.snackbar = true;
          console.log("removed data: ", change.doc.data());
        }
      });
    });
  },
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
      let currentItem = handleArrayData.map(doc => {
        return this.handleNodeData(doc);
      });
      this.treeData = com_fun.arrayToJson(currentItem);
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
      let remdayshow = "";
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

    // =======搜尋=======
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

      //搜尋的欄位
      const field = ["title", "depart", "status"]; //搜尋這些個欄位

      let nodeArray = this.$refs.tree1.getNodes(); //取的全部陣列 []
      // console.log(nodeArray);

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
            if (!item[f]) return false;
            // 多個搜尋關鍵字迴圈
            arrFilters.forEach((str, index) => {
              let match = item[f].indexOf(str); //-1沒有符合
              if (match != -1) {
                //符合
                arr_flag[index] = true; //先把符合的記下來
              }
            });
          });
          //搜尋多條件，and 計算，其中一個是false就不符合
          arr_flag.forEach(function(a) {
            if (a == false) {
              contain_flag = false; //and
            }
          });
          return contain_flag;
        })
        .map(p => {
          //查到的關鍵字，紅色顯示
          if (this.searchword == "") return p; //開始查詢條件空白時，不處理
          let cache = JSON.parse(JSON.stringify(p)); //拷貝 p 物件
          field.forEach(f => {
            //處理多欄位
            arrFilters.forEach(s => {
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
          });
          // console.log(cache)
          cache.expanded = true; //全部展開
          return cache;
        });

      // console.log(matchArr);
      this.treeData = com_fun.arrayToTree(matchArr);
      // console.log(this.treeData);
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


    //從子層傳回父層的資料，更新螢幕畫面，並進行存檔
    getChildData(childData) {
      console.log("retuen childData", childData);

      //=====更改tree Array，更新螢幕畫面=======
      let nodeArray = this.$refs.tree1.getNodes(); //取的全部陣列 []

      nodeArray.forEach(doc => {
        //從全部的陣列，找到要update的物件，試過用find會失敗
        if (doc.id === childData.id) {
          // console.log("childData", childData);
          doc.title = doc.t_title; //還原title，處理螢幕畫面title顏色用
          doc.depart = childData.depart;
          doc.endDate = childData.endDate;
          doc.startDate = childData.startDate;
          doc.status = childData.status;
          doc.progress = childData.progress;
          if (childData.memo) {
            doc.memo = childData.memo;
          }
          //處理每個節點顯示狀態
          doc = this.handleNodeData(doc);
        }
      });


      //讓顯示近期填報資料一致
      this.db_data = nodeArray;
      this.treeData = com_fun.arrayToJson(nodeArray);
      // this.$forceUpdate();
      // window.location.reload()

      //=====更改fireStore資料庫=======
      let data = {
        //設定符合firestore資料格式
        depart: childData.depart,
        endDate: childData.endDate,
        startDate: childData.startDate,
        status: childData.status,
        //處理progress
        progress: childData.progress
      };
      if (childData.memo) {
        data.memo = childData.memo;
      }

      dbFirestore
        .collection(databaseName2)
        .doc(childData.id)
        .update(data)
        .then(() => {
          console.log("資料庫已被更新！", data);
        });
    },

    workDetailClose() {
      //若顯示資料必須重新整理時，目前暫時沒用到
      if (this.$store.state.mustUpdate) {
        this.handleData(this.db_data);
        this.$store.commit("setmustUpdate", false);
      }
      this.workDetailDialog = false;
    }
    // getServerTime() {
    //   //取得系統時間
    //   const offsetRef = dbDatabase.ref(".info/serverTimeOffset");
    //   offsetRef.on("value", function(snap) {
    //     let offset = snap.val();
    //     let estimatedServerTimeMs = new Date().getTime() + offset;
    //     console.log(moment().format("YYYY-MM-DD hh:ss"));
    //     console.log(moment(estimatedServerTimeMs).format("YYYY-MM-DD hh:ss"));
    //     return estimatedServerTimeMs;
    //   });
    // }
  }
};
</script>

<style scoped>
.halo-tree {
  padding: 0px;
}
</style>
