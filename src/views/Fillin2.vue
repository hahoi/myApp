<template>
  <div>
    <v-container>
      <v-row align="center" justify="center" class="py-0">
        <div class="text-center mb-4">
          <v-overlay :opacity="0.5" z-index="100" :value="loading">
            <img src="@/assets/loading.gif" style="height:125px" />
          </v-overlay>
        </div>
        <div class="text-center mb-4">
          <v-overlay :opacity="0.5" z-index="100" :value="alert">
            <v-alert color="red" dark transition="scale-transition">{{ alertResult }}</v-alert>
          </v-overlay>
        </div>
        <v-col cols="12" class="py-0">
          <v-btn text color="orange" @click="nearreported">顯示近期填報</v-btn>
        </v-col>
        <v-col cols="12">
          <v-tree ref="tree1" :data="treeData" :tpl="tpl" />
        </v-col>
      </v-row>
    </v-container>
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
            <v-btn dark text class="px-0" @click="workDetailBackHandle">
              <v-icon>mdi-backspace</v-icon>
              <span class="title">退回</span>
            </v-btn>
            <!-- <v-toolbar-title>退回</v-toolbar-title> -->
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card class="mx-auto" tile>
            <v-card-text class="px-3">
              <!-- 子組件渲染 -->
              <Fillin2Detail :propData="todo" @listenToChild="getChildData"></Fillin2Detail>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Fillin2Detail from "../components/Fillin2Detail";
import { dbDatabase, dbFirestore, databaseName2 } from "@/fb";
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

      alertResult: "",
      alert: false,

      treeData: [], //樹狀
      db_data: [], //db讀取，一維陣列
      todo: {},
      ShowRecentReport: 10 //預設顯示10天內填報資料
    };
  },
  components: {
    Fillin2Detail,
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
            //取的已被限制填報單位的陣列 []
            let nodeArray = this.$refs.tree1.getNodes();
            this.handleData(nodeArray);
          }
        });
    },
    //讀取firestore資料
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
          //搜尋填報單位
          this.$refs.tree1.searchNodes(
            `(${this.$store.state.user.department})`
          );
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
    },

    //處理每個節點顯示狀態，將負責單位加到title，再利用searchNode方法過濾出需填報的工項
    handleNodeData(doc) {
      // let currentItem = handleArrayData.map(doc => {
      if (!doc.t_title) {
        doc.t_title = doc.title; //第一次，先存起來
      } else {
        doc.title = doc.t_title; //還原
      }
      doc.expanded = true; //全部展開
      //   if(doc.pid == this.$store.state.LevelOneID ) doc.expanded = false //預設只打開第一層

      let days = "";
      if (moment(doc.startDate) < moment() && doc.status != "完成") {
        //計算落後天數
        days = moment(doc.endDate).diff(moment(), "day");
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
        doc.title = `<span class="red--text">${doc.title}</span>`;
      }
      if (moment().isBefore(doc.startDate) || doc.startDate == "") {
        //已設定開始日期，但時間未到
        doc.title = "<span class='grey--text'>" + doc.title + "</span>";
      }
      //==============將負責單位加到title，注意有括號 (單位)===========
      if (doc.depart) {
        doc.title = `${doc.title}-<span class="deep-purple--text">(${doc.depart})</span >`;
      } else {
        doc.title = `${doc.title}<span class="deep-purple--text">${doc.depart}</span >`;
      }
      doc.ptitle = doc.title;

      if (doc.progress && doc.progress.length > 0) {
        //有填報的才顯示
        // console.log(doc.progress[0].t_pgdate,moment().diff(moment(doc.progress[0].t_pgdate), "day"))
        if (this.ShowRecentReport == 0) {
          //輸入0時，不顯示
          doc.title = doc.title; //還原
        } else if (
          moment().diff(moment(doc.progress[0].pgdate), "day") <=
          this.ShowRecentReport
        ) {
          // ?天以內填報的才顯示，這裡跟其他功能不同的是不必再顯示單位
          doc.title = `${doc.title}【<span class="blue--text">${doc.progress[0].pgdate} - ${doc.progress[0].pgdesc}</span>】`;
        }
      }

      return doc; //object
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

              //不是負責的單位，不能填報
              if (this.$store.state.user.department !== node.depart) {
                this.ShowAlert("不是負責的單位，不能填報！", 1000);
                return false;
              }

              //   console.log(parent);
              let parentEndDate;
              if (parent === null) {
                parentEndDate = this.$store.getters.projectEndDate;
              } else {
                parentEndDate =
                  parent.enddate || this.$store.getters.projectEndDate;
              }

              //先處理一天之內填報的才可編輯
              let ServerTime = this.getServerTime(); //
              if (node.progress) {
                node.progress.forEach(item => {
                  // 比對伺服器時間，更改local時間沒有用
                  let pd =
                    moment(ServerTime).diff(moment(item.pgdate)) / 86400000;
                  item.showEdit = pd < 1; // 一天之內
                  // 加入時間內(一天之內)是否可以修改編輯，加入showEdit屬性
                });
              }
              this.todo = {
                //拷貝一份
                ...node
              };
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
      //取的已被限制填報單位的陣列 []
      let nodeArray = this.$refs.tree1.getNodes();

      // let nodeArray = this.db_data;
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

      //arrayToTree 更新螢幕畫面
      let tempArray = com_fun.deepCopy(nodeArray); //深拷貝一份避免副作用
      this.treeData = com_fun.arrayToTree(tempArray);
      //限制只顯示填報單位
      // this.$refs.tree1.searchNodes(`(${this.$store.state.user.department})`);

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

    //按退回鍵
    workDetailBackHandle() {
      this.workDetailDialog = false;
    },
    ShowAlert(alertMsg, showtime = 3000) {
      this.alertResult = alertMsg;
      this.alert = true;
      setTimeout(() => {
        this.alertResult = "";
        this.alert = false;
      }, showtime);
    },

    getServerTime() {
      // console.log(moment().format("YYYY-MM-DD hh:ss"));
      //取得伺服器系統時間
      const offsetRef = dbDatabase.ref(".info/serverTimeOffset");
      offsetRef.on("value", function(snap) {
        let offset = snap.val();
        let estimatedServerTimeMs = new Date().getTime() + offset;
        // console.log(moment(estimatedServerTimeMs).format("YYYY-MM-DD hh:ss"));
        // console.log(dbFirestore.FieldValue.serverTimestamp())//更新資料時取得伺服器系統時間
        return estimatedServerTimeMs;
      });
    }
  }
};
</script>

<style scoped>
.node-title.node-searched {
  margin: 0px;
  padding: 0px;
}
</style>
