<template>
  <div>
    <v-container>
      <v-row align="center" justify="center" class="py-0">
        <div class="text-center mb-4">
          <v-overlay :opacity="0.5" z-index="100" :value="loading">
            <img src="@/assets/loading.gif" style="height:125px" />
          </v-overlay>
        </div>
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

        <v-col cols="6" class="py-0">
          <v-btn color="orange" @click="checkDatehandle">檢核</v-btn>
        </v-col>
        <v-col cols="12">
          <v-tree ref="tree1" :data="treeData" :tpl="tpl" />
        </v-col>
        <v-spacer></v-spacer>
        <scroll-up :scroll-duration="1000"></scroll-up>
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
              <workItem2DetailReadonly :propData="todo"></workItem2DetailReadonly>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import workItem2DetailReadonly from "../components/workItem2DetailReadonly";
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

      treeData: [], //樹狀
      db_data: [], //db讀取，一維陣列
      todo: {},
      checkDate: moment().format("YYYY-MM-DD"),
      menu2: false
    };
  },
  components: {
    workItem2DetailReadonly,
    ScrollUp
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
      // doc.expanded = true; //全部展開
      //預設只打開第一層
      if (doc.pid == this.$store.state.LevelOneID) doc.expanded = false;

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
