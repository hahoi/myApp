<template>
  <div class="tree">
    <v-container>
      <v-row>
        <v-col cols="12" sm="12" md="6" class="py-0">
          <v-text-field label="關鍵字搜尋..." v-model="searchword"></v-text-field>
        </v-col>
        <v-col cols="3" sm="3" md="1" class="py-0">
          <v-btn color="info" @click="searchFun">搜尋</v-btn>
        </v-col>
        <v-col cols="3" sm="3" md="1" class="py-0">
          <v-btn color="blue lighten-4" @click="restsearchFun">重置</v-btn>
        </v-col>
        <v-col cols="6" sm="6" md="2" class="py-0">
          <v-btn color="orange" @click="nearreported">顯示近期填報</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <img src="@/assets/loading.gif" height="40px" v-show="this.$store.state.loading" />
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
            <v-btn dark text class="px-0" @click="workDetailDialog = false">
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
              <workdetail :propData="todo" @listenToChild="getChildData"></workdetail>
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
import { dbDatabase, dbFirestore, databaseName } from "@/fb";
import com_fun from "../utils/function";
import moment from "moment";

import workdetail from "../components/workdetail.vue";
export default {
  name: "worklist",
  data() {
    return {
      workDetailDialog: false,
      searchword: "",
      treeData: [],//樹狀
      treeDataArray:[], //一維陣列,處理顯示及搜尋
      db_data: [], //db讀取，一維陣列
      todo: {},
      ShowRecentReport: 10, //預設顯示10天內填報資料

      snackbar: false,
      timeout: 2000,
      databasemessage: ""
    };
  },
  components: {
    workdetail
  },
  created() {
    this.$store.commit("setLoading", true);
    //監聽資料庫變化
    dbFirestore.collection(databaseName).onSnapshot(res => {
      const changes = res.docChanges();
      changes.forEach(change => {
        if (change.type === "added" && !this.$store.state.loading) {
          // console.log(this.$store.getters.user.name, "added");
          this.databasemessage =
            this.$store.getters.user.name + " 正在新增資料！";
          this.snackbar = true;
        }
        if (change.type === "modified") {
          // console.log("modified");
          this.databasemessage =
            this.$store.getters.user.name + " 已經修改資料！";
          this.snackbar = true;
        }
        if (change.type === "removed") {
          // console.log("removed");
          this.databasemessage =
            this.$store.getters.user.name + " 已經刪除資料！";
          this.snackbar = true;
        }
      });
    });
  },
  mounted() {
    this.getServerTime();
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
          title: "顯示幾天內填報的資料："
          // persistent: true
        })
        .then(res => {
          if (res) {
            this.ShowRecentReport = res;
            this.handleData(this.db_data);
          }
        });
    },

    //讀取firestore資料
    readData() {
      // this.db_data.length = 0
      this.db_data= [] //清空陣列
      dbFirestore
        .collection(databaseName)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            this.db_data.push(doc.data());
          });
        })
        .then(() => {
          this.handleData(this.db_data);
        });
    },

    //處理所有節點顯示狀態
    handleData(handleArrayData) {
      let currentItem = handleArrayData.map(doc => {
        return this.handleNodeData(doc);
      });
      this.treeData = com_fun.arrayToJson(currentItem);
      this.$store.commit("setLoading", false);
    },

    //處理每個節點顯示狀態
    handleNodeData(doc) {
      // let currentItem = handleArrayData.map(doc => {
      if (!doc.t_title) {
        doc.t_title = doc.title; //第一次，先存起來
      } else {
        doc.title = doc.t_title; //還原
      }
      //   doc.expanded = true; //全部展開
      //   if(doc.pid == this.$store.state.LevelOneID ) doc.expanded = false //預設只打開第一層
      if (doc.enddate)
        doc.t_enddate = moment(doc.enddate.toDate()).format("YYYY-MM-DD");
      if (doc.startdate)
        doc.t_startdate = moment(doc.startdate.toDate()).format("YYYY-MM-DD");

      if (doc.process) {
        doc.process.forEach(element => {
          // console.log(element.pgdate);
          element.t_pgdate =
            moment(element.pgdate.toDate()).format("YYYY-MM-DD") || "";
        });
        doc.process.sort(function(a, b) {
          return moment(b.t_pgdate).diff(moment(a.t_pgdate)); //b - a > 0 天數大的排在前面
        });
      }
      let days = "";
      let remdayshow = "";
      if (moment(doc.t_startdate) < moment() && doc.status != "完成") {
        doc.remaindays = moment(moment(doc.t_enddate).diff(moment())).format(
          "D"
        );
        days = moment(doc.t_enddate).diff(moment(), "day");
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
        doc.title = "<span class='red--text'>" + doc.title + "</span>";
      }
      if (moment().isBefore(doc.t_startdate) || doc.t_startdate == "") {
        //已設定開始日期，但時間未到
        doc.title = "<span class='grey--text'>" + doc.title + "</span>";
      }
      doc.ptitle = doc.title;

      if (doc.process) {
        if (doc.process.length > 0) {
          //有填報的才顯示
          // console.log(doc.process[0].t_pgdate,moment().diff(moment(doc.process[0].t_pgdate), "day"))
          if (this.ShowRecentReport == 0) {
            //輸入0時，不顯示
            doc.title = doc.title; //還原
          } else if (
            moment().diff(moment(doc.process[0].t_pgdate), "day") <=
            this.ShowRecentReport
          ) {
            // ?天以內填報的才顯示
            doc.title = `${doc.title}-${doc.depart} 【<span class="blue--text">${doc.process[0].t_pgdate} - ${doc.process[0].pgdesc}</span>】`;
          }
        }
      }
      return doc; //object
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
      console.log(arrFilters);

      //搜尋的欄位
      const field = ["title", "depart", "status"]; //搜尋這些個欄位

      let nodeArray = this.$refs.tree1.getNodes(); //取的全部陣列 []
      console.log(nodeArray);

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

      console.log(matchArr);
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
              ctx.parent.nodeSelected(ctx.props.node);
              //   console.log(parent);
              let parentEndDate;
              if (parent === null) {
                parentEndDate = this.$store.getters.projectEndDate;
              } else {
                parentEndDate =
                  parent.enddate || this.$store.getters.projectEndDate;
              }
              this.todo = {
                // id : node.id ,
                // ptitle: node.title,
                parentEndDate, //加上上層專案結束日期·專案管理用
                ...node
              };

              this.workDetailDialog = true;
            }}
          />
        </span>
      );
    },

    getChildData(childData) {
      // console.log("childData", childData); //從子層傳回父層的資料，進行存檔
      //=====更改tree Array=======
      let nodeArray = this.$refs.tree1.getNodes(); //取的全部陣列 []

      nodeArray.forEach(doc => {
        if (doc.id === childData.id) {
          //找到要update的物件
          // console.log("childData", childData);
          doc.title = doc.t_title; //還原title
          doc.depart = childData.depart;
          doc.t_enddate = childData.t_enddate;
          doc.t_startdate = childData.t_startdate;
          doc.status = childData.status;
          doc.process = childData.process;
          if (childData.memo) {
            doc.memo = childData.memo;
          }

          //處理每個節點顯示狀態

          if (doc.process) {
            doc.process.sort(function(a, b) {
              return moment(b.t_pgdate).diff(moment(a.t_pgdate)); //b - a > 0 天數大的排在前面
            });
          }
          let days = "";
          let remdayshow = "";
          if (moment(doc.t_startdate) < moment() && doc.status != "完成") {
            doc.remaindays = moment(
              moment(doc.t_enddate).diff(moment())
            ).format("D");
            days = moment(doc.t_enddate).diff(moment(), "day");
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
            doc.title = "<span class='red--text'>" + doc.title + "</span>";
          }
          if (moment().isBefore(doc.t_startdate) || doc.t_startdate == "") {
            //已設定開始日期，但時間未到
            doc.title = "<span class='grey--text'>" + doc.title + "</span>";
          }
          doc.ptitle = doc.title;

          if (doc.process) {
            if (doc.process.length > 0) {
              //有填報的才顯示
              // console.log(doc.process[0].t_pgdate,moment().diff(moment(doc.process[0].t_pgdate), "day"))
              if (this.ShowRecentReport == 0) {
                //輸入0時，不顯示
                doc.title = doc.title; //還原
              } else if (
                moment().diff(moment(doc.process[0].t_pgdate), "day") <=
                this.ShowRecentReport
              ) {
                // ?天以內填報的才顯示
                doc.title = `${doc.title}-${doc.depart} 【<span class="blue--text">${doc.process[0].t_pgdate} - ${doc.process[0].pgdesc}</span>】`;
              }
            }
          }
        }
      });
      this.treeData = com_fun.arrayToJson(nodeArray);
      // this.$forceUpdate();
      // window.location.reload()

      //=====更改fireStore資料庫=======
      let data = {
        //設定符合firestore資料格式
        depart: childData.depart,
        enddate: new Date(moment(childData.t_enddate)), //轉換日期物件
        startdate: new Date(moment(childData.t_startdate)),
        status: childData.status,
        process: childData.process || []
      };
      if (childData.memo) {
        data.memo = childData.memo;
      }
      // console.log(data)
      dbFirestore
        .collection(databaseName)
        .doc(childData.id)
        .update(data)
        .then(() => {
          console.log("Document successfully Update!");
        });
    },
    getServerTime() {
      //取得系統時間
      const offsetRef = dbDatabase.ref(".info/serverTimeOffset");
      offsetRef.on("value", function(snap) {
        let offset = snap.val();
        let estimatedServerTimeMs = new Date().getTime() + offset;
        console.log(moment().format("YYYY-MM-DD hh:ss"));
        console.log(moment(estimatedServerTimeMs).format("YYYY-MM-DD hh:ss"));
        return estimatedServerTimeMs;
      });
    }
  }
};
</script>

<style>
</style>
