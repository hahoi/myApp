<template>
  <div>
    <v-container>
      <v-row class="py-0">
        <v-spacer></v-spacer>
        <v-col cols="6" sm="6" md="4" class="py-0">
          <v-menu
            v-model="menu2"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
          >
            <template v-slot:activator="{ on }">
              <v-text-field v-model="checkDate" label="選擇檢核日期"  v-on="on"></v-text-field>
            </template>
            <v-date-picker
              v-model="checkDate"
              first-day-of-week="1"
              locale="zh-TW"
              @input="menu2 = false"
            ></v-date-picker>
          </v-menu>
        </v-col>

        <v-col cols="6" class="py-0">
          <v-btn color="orange" @click="checkDatehandle">檢核</v-btn>
        </v-col>
        <v-col cols="12">
          <img src="@/assets/loading.gif" height="40px" v-show="this.$store.state.loading" />
          <v-tree ref="tree1" :data="treeData" :tpl="tpl" />
        </v-col>
        <v-spacer></v-spacer>
      </v-row>
    </v-container>

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
          </v-toolbar>
          <v-card class="mx-auto" tile>
            <v-card-text class="px-3">
              <!-- 子組件渲染 -->
              <workdetailReadonly :propData="todo"></workdetailReadonly>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import workdetailReadonly from "../components/workdetailReadonly";
import { dbDatabase, dbFirestore, databaseName } from "@/fb";
import com_fun from "../utils/function";
import moment from "moment";
export default {
  name: "",
  data() {
    return {
      workDetailDialog: false,

      treeData: [], //樹狀
      db_data: [], //db讀取，一維陣列
      todo: {},
      checkDate: moment().format("YYYY-MM-DD"),
      menu2: false
    };
  },
  components: {
    workdetailReadonly
  },
  created() {},
  mounted() {
    this.readData();
  },
  watch: {},
  computed: {},
  methods: {
    //讀取firestore資料
    readData() {
      this.$store.commit("setLoading", true);
      // this.db_data.length = 0
      this.db_data = []; //清空陣列
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
      doc.expanded = true; //全部展開
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
      if (
        moment(doc.t_startdate) < moment(this.checkDate) &&
        doc.status != "完成"
      ) {
        //計算落後天數
        days = moment(doc.t_enddate).diff(moment(this.checkDate), "day");
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
                                <span class="deep-purple--text">(期限:${doc.t_enddate})</span >`;
      }
      if (
        moment(this.checkDate).isBefore(doc.t_startdate) ||
        doc.t_startdate == ""
      ) {
        //已設定開始日期，但時間未到
        doc.title = "<span class='grey--text'>" + doc.title + "</span>";
      }
      doc.ptitle = doc.title;

      //   if (doc.process) {
      //     if (doc.process.length > 0) {
      //       //有填報的才顯示
      //       // console.log(doc.process[0].t_pgdate,moment().diff(moment(doc.process[0].t_pgdate), "day"))
      //       if (this.ShowRecentReport == 0) {
      //         //輸入0時，不顯示
      //         doc.title = doc.title; //還原
      //       } else if (
      //         moment().diff(moment(doc.process[0].t_pgdate), "day") <=
      //         this.ShowRecentReport
      //       ) {
      //         // ?天以內填報的才顯示
      //         doc.title = `${doc.title}-${doc.depart} 【<span class="blue--text">${doc.process[0].t_pgdate} - ${doc.process[0].pgdesc}</span>】`;
      //       }
      //     }
      //   }

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

    checkDatehandle() {
      this.handleData(this.db_data);
    }
  }
};
</script>

<style>
</style>
