<template>
  <div class="tree">
    <v-container>
      <v-row>
        <v-col cols="12" sm="12" md="6" class="py-0">
          <v-text-field label="關鍵字搜尋..." v-model="searchword"></v-text-field>
        </v-col>
        <v-col cols="6" sm="6" md="1" class="py-0">
          <v-btn color="info"  @click="searchFun">搜尋</v-btn>
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
            </v-btn> -->
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
import { dbFirestore } from "@/fb";
import com_fun from "../utils/function";
import moment from "moment";

import workdetail from "../components/workdetail.vue";
export default {
  name: "worklist",
  data() {
    return {
      workDetailDialog: false,
      searchword: "",
      treeData: [],
      db_data: [],
      todo: {},
      ShowRecentReport: 10,

      snackbar: false,
      timeout: 2000,
      databasemessage: "",
      
    };
  },
  components: {
    workdetail
  },
  created() {
    this.$store.commit("setLoading", true);
    //監聽資料庫變化
    dbFirestore.collection("TLFMCD").onSnapshot(res => {
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
    this.readData();
  },
  watch: {},
  computed: {},
  methods: {
    nearreported() {
    //   this.ShowRecentReport = prompt(
    //     "請輸入幾天內填報才顯示：",
    //     this.ShowRecentReport
    //   );
    //   this.handleData();

      this.$dialog
        .prompt({
          text: "天數",
          title: "請輸入幾天內填報才顯示："
        })
        .then(res => {
          this.ShowRecentReport = res;
          this.handleData(this.db_data);
        });
    },
    readData() {
      dbFirestore
        .collection("TLFMCD")
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            this.db_data.push(doc.data());
          });
          this.handleData(this.db_data);
        });
    },
    handleData(handleArrayData) {
      let currentItem = handleArrayData.map(doc => {
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
          // if (vm.ShowAllitems) {
          doc.title = "<span class='grey--text'>" + doc.title + "</span>";
          // } else {
          //   return {}; // 不顯示
          // }
        }
        doc.ptitle = doc.title

        if (doc.process) {
          if (doc.process.length > 0) {
            //有填報的才顯示
            // console.log(doc.process[0].t_pgdate,moment().diff(moment(doc.process[0].t_pgdate), "day"))
            if (
              moment().diff(moment(doc.process[0].t_pgdate), "day") <=
              this.ShowRecentReport
            ) {
              // ?天以內填報的才顯示
              doc.title = `${doc.title}-${doc.depart} 【<span class="blue--text">${doc.process[0].t_pgdate} - ${doc.process[0].pgdesc}</span>】`;
            }
          }
        }

        return doc;
      });
      // console.log(currentItem)
      this.treeData = com_fun.arrayToJson(currentItem);
      this.$store.commit("setLoading", false);
    },

    searchFun() {
      this.$refs.tree1.searchNodes(this.searchword);
    },

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
                parentEndDate = this.$store.getters.projectEndDate
              } else {
                parentEndDate = parent.enddate || this.$store.getters.projectEndDate
              }
              let tempArrary = {
                // id : node.id ,
                // ptitle: node.title,
                parentEndDate,
                ...node
              };
              this.todo = com_fun.deepCopy(tempArrary)
            //   this.$store.commit('setWorkItemData',com_fun.deepCopy(tempArrary))
            //   console.log(this.$store.getters.workItemData,this.todo)
              //   vm.dialogScreen = true;
              //   vm.component_ok = true;
            //   console.log(this.todo);
              this.workDetailDialog = true;
            }}
          />
        </span>
      );
    },

    getChildData(childData) {
      console.log("childData",childData)//從子層傳回父層的資料，進行存檔
      //=====更改tree Array=======
      let nodeArray = this.$refs.tree1.getNodes() //取的全部陣列 []
      nodeArray.forEach(doc=>{
        if (doc.id === childData.id) { //找到要update的物件
          doc.title = doc.t_title //還原title
          doc.depart = childData.depart
          doc.t_enddate = childData.t_enddate
          doc.t_startdate = childData.t_startdate
          doc.status = childData.status
          doc.process = childData.process
          if (childData.memo){
            doc.memo = childData.memo
          }

              if (doc.process) {
                doc.process.sort(function(a, b) {
                  return moment(b.t_pgdate).diff(moment(a.t_pgdate)); //b - a > 0 天數大的排在前面
                })
              }
          
              let days = "";
              days = moment(doc.t_enddate).diff(moment(), "day");
              if (doc.status == "完成"){//完成顯示綠色          
                doc.title = "<span style='color: green'>" + doc.title + "</span>"}
              if (doc.status == "不顯示" || doc.status == "停止") return {}; // 不顯示、停止，回傳空物件

              if (days <= 0 && days !== "") {//剩餘天數為負數，顯示為紅色    
                doc.title = "<span style='color: red'>" + doc.title + "</span>";
              }
              if (moment().isBefore(doc.t_startdate) || doc.t_startdate == "") { //已設定開始日期，但時間未到          
                  doc.title ="<span style='color:#BDBDBD'>" + doc.title + "</span>";
              }
              if(doc.process) {
                if(doc.process.length > 0) {//?天有填報的才顯示
                  if (moment().diff(moment(doc.process[0].t_pgdate), "day") <= this.ShowRecentReport) {
                    doc.title = `${doc.title}-${doc.depart} 【<span class="blue--text">${doc.process[0].t_pgdate} - ${doc.process[0].pgdesc}</span>】`
                  }
                }
              }
        }
      })
      this.treeData = com_fun.arrayToJson(nodeArray)
      // window.location.reload()

      //=====更改fireStore資料庫=======
      let data = {
        depart: childData.depart,
        enddate: new Date( moment(childData.t_enddate) ),//轉換日期物件
        startdate: new Date( moment(childData.t_startdate) ),
        status: childData.status,
        process: childData.process || []
      }
      if (childData.memo){
        data.memo = childData.memo
      }
      // console.log(data)
      dbFirestore
        .collection("TLFMCD")
        .doc(childData.id)
        .update(data)
        .then(() => {
          console.log("Document successfully Update!");
        })



    }
  }
};
</script>

<style>
</style>
