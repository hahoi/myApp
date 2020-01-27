<template>
  <div>
    <!-- =========================== 基本資料顯示 ============================ -->
    <v-card class="mx-auto blue lighten-5" max-width="550" align="left" outlined>
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="12">
            <div class="subtitle-1 mb-1" v-html="propData.ptitle"></div>
          </v-col>
          <v-col cols="12">
            開始日期：
            <span class="body-1 blue--text" v-html="propData.startDate"></span>
          </v-col>
          <v-col cols="12" class="mb-2">
            完成日期：
            <span class="body-1 blue--text mb-1" v-html="propData.endDate"></span>
          </v-col>
          <v-col cols="12">
            負責單位：
            <span class="body-1" v-html="propData.depart"></span>
          </v-col>
          <v-col cols="12">
            剩餘天數：
            <span class="body-1 blue--text" v-html="propData.remaindays"></span>
          </v-col>
          <v-col cols="12">
            狀態：
            <span class="body-1" v-html="propData.status"></span>
          </v-col>
          <v-col cols="12">
            <span class="body-2" v-html="propData.memo"></span>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <!-- 單位填報不可編輯基本資料 -->
        <!-- <v-btn text color="orange" @click="workItemDetailEdit">編輯</v-btn> -->
        <v-spacer></v-spacer>
        <v-btn color="indigo" dark @click="ProgressAdd(newProgress,propData.id,true,-1)">進度填報</v-btn>
      </v-card-actions>
    </v-card>

    <!-- ============================ 基本資料編輯 ======================== -->
    <!-- <v-dialog
      v-model="detailEditDialog"
      fullscreen
      hide-overlay
      transition="dialog-right-transition"
    >
      <workdetailEdit
        :propData2="editWorkItemDetailData"
        @listenToChild2="getChildData_ItemDetailEdit"
      ></workdetailEdit>
    </v-dialog> -->

    <!-- =============================顯示填報進度列表============================ -->
    <v-card
      class="mx-auto lighten-5"
      max-width="550"
      align="left"
      outlined
      tile
      style="border-width:0px"
    >
      <v-card-text class="px-0">
        <div>
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">填報日期</th>
                  <th class="text-left">進度說明</th>
                  <th class="text-left">佐證資料</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item,index) in propData.progress">
                  <td class="text-left px-0">
                    <v-menu bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn text v-on="on" class="text-left px-0">{{item.pgdate }}</v-btn>
                      </template>
                      <!-- 單位填報不同處 -->
                      <!-- 一天之內顯示此按鈕 -->
                      <v-list v-if="item.showEdit">
                        <v-list-item>
                          <v-list-item-title @click="ProgressAdd(item,propData.id,false,index)">修改</v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title @click="ProgressDelete(item,propData.id,index)">刪除</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </td>
                  <td class="text-left">{{ item.pgdesc }}</td>
                  <td v-if="item.pdf" class="text-center">
                    <span class="blue--text" @click="openPDF(`${item.cfmpic}`)">檢視</span>
                  </td>
                  <td
                    v-else
                    v-viewer="{'inline': false, 'button': true, 'navbar': false, 'title': true, 'toolbar': false, 'tooltip': false, 'movable': false, 'zoomable': true, 'rotatable': false, 'scalable': false, 'transition': false, 'fullscreen': true, 'keyboard': true, 'url': 'data-source' }"
                    v-html="`<img src='${item.cfmpic}' style='height:80px;width:80px'>`"
                  ></td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
      </v-card-text>

      <v-card-actions></v-card-actions>
    </v-card>

    <!-- ====================填報進度新增修改=================== -->
    <v-dialog
      v-model="ProgressAddDialog"
      fullscreen
      hide-overlay
      transition="dialog-right-transition"
    >
      <!-- 傳入該項(item)的Progress資料，以及判斷是否新增或修改 -->
      <workItem4Progress
        :propData4="ProgressItem"
        :addProgress="addProgress"
        :ProgressNodeId="ProgressNodeId"
        :ProgressItemIndex="ProgressItemIndex"
        :ifProgressReport = true
        @listenToChild4="getChildData_ProgressAdd"
      ></workItem4Progress>
    </v-dialog>

    <!--=================== PDFdialog 顯示PDF==========-->
    <v-dialog v-model="PDFdialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn dark text class="px-0" @click="PDFdialog = false">
            <v-icon>mdi-backspace</v-icon>
            <span class="title">關閉</span>
          </v-btn>
        </v-toolbar>

        <v-card-text class="px-0">
          <iframe
            id="PDFiframe"
            ref="PDFiframe"
            :src="PDFURL"
            width="100%"
            height="1500px"
            frameborder="0"
          ></iframe>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>





<script>
import workItem4Progress from "./workItem4Progress";

import { dbFirestore, dbStorage, databaseName2 } from "@/fb";
import com_fun from "../utils/function";
import moment from "moment";

export default {
  name: "Fillin2Detail",
  props: ["propData"],
  data() {
    return {
      // detailEditDialog: false,
      // editWorkItemDetailData: {},

      ProgressAddDialog: false,
      ProgressItem: {},
      addProgress: true,
      ProgressNodeId: "",
      ProgressItemIndex: -1,

      newProgress: {
        cfmpic: "",
        pgdate: moment().format("YYYY-MM-DD"),
        pgdesc: "",
        pickey: "",
      },

      PDFdialog: false,
      PDFURL: "",
      iframeHeight: "1000 px"
    };
  },
  components: {
    // workdetailEdit,
    workItem4Progress
  },
  created() {},
  mounted() {},
  watch: {},
  computed: {},
  methods: {
    // //==========================================基本資料================================
    // //編輯詳細資料，呼叫子元件
    // workItemDetailEdit() {
    //   this.detailEditDialog = true;
    //   this.editWorkItemDetailData = this.propData;
    //   this.tempDetailData = Object.assign({}, this.propData); //複製一份
    //   // console.log("editWorkItemDetailData", this.editWorkItemDetailData);
    // },
    // //編輯後，子元件返回
    // getChildData_ItemDetailEdit(childData) {
    //   this.detailEditDialog = false;
    //   if (!childData) {
    //     //按取消
    //     //還原
    //     this.propData.title = this.tempDetailData.t_title; //還原title
    //     this.propData.depart = this.tempDetailData.depart;
    //     this.propData.t_enddate = this.tempDetailData.t_enddate;
    //     this.propData.t_startdate = this.tempDetailData.t_startdate;
    //     this.propData.status = this.tempDetailData.status;
    //     this.propData.progress = this.tempDetailData.progress;
    //     this.propData.memo = this.tempDetailData.memo;
    //     // console.log("取消",this.propData)
    //     return false;
    //   }
    //   //被編輯處理過的資料，為符合ＤＢ資料格式，需重新設定
    //   this.propData.title = this.propData.t_title; //還原title
    //   this.propData.depart = childData.depart;
    //   this.propData.t_enddate = childData.t_enddate;
    //   this.propData.t_startdate = childData.t_startdate;
    //   this.propData.status = childData.status;
    //   this.propData.progress = childData.progress;
    //   if (childData.memo) {
    //     this.propData.memo = childData.memo;
    //   }
    //   let days = "";
    //   let remdayshow = "";
    //   if (
    //     moment(this.propData.t_startdate) < moment() &&
    //     this.propData.status != "完成"
    //   ) {
    //     this.propData.remaindays = moment(
    //       moment(this.propData.t_enddate).diff(moment())
    //     ).format("D");
    //     days = moment(this.propData.t_enddate).diff(moment(), "day");
    //     this.propData.remaindays = `<span class="red--text">${days}天</span>`;
    //   } else {
    //     this.propData.remaindays = "";
    //   }
    //   console.log("save", this.propData);
    //   //傳回 propData 資料給父層處理 資料庫存檔 及 更改陣列物件
    //   this.$emit("listenToChild", childData);
    //   this.dialog = false; //關閉視窗
    // },
    //=================================進度填報新增修改===================================
    //呼叫子元件，注意 progress 格式是[{},{}...]
    //參數
    //item:progress item,
    //nodeid: detail node id
    //add: 新增   編輯,
    //index: progress item index
    ProgressAdd(item, nodeid, add, index) {
      this.addProgress = add;
      // console.log(item,nodeid,index)
      this.ProgressNodeId = nodeid;
      this.ProgressItemIndex = index;
      this.ProgressItem = Object.assign({}, item); //複製一份，傳到子元件
      // 傳入資料是
      console.log("傳入資料", this.ProgressItem);
      //開啟進度填報視窗
      this.ProgressAddDialog = true;
    },
    //子元件返回
    getChildData_ProgressAdd(childData, nodeid, add, index) {
      this.ProgressAddDialog = false;
      //按取消鍵時，時麼事都不用做
      if (!childData) {
        return false;
      }
      console.log(childData);
      //===========螢幕畫面更新============
      if (add) {
        //新增時
        this.propData.progress.unshift(childData);
      } else {
        // this.propData.progress[index]=childData //不可以：用指定array[index]去儲存內容。
        Object.assign(this.propData.progress[index], childData);
        //更新螢幕
        // this.$forceUpdate();
      }

      console.log("要上傳到第一層的存檔資料", this.propData);
      //上傳到第一層存檔，基本資料加上填報進度
      this.$emit("listenToChild", this.propData);
    },

    //刪除一筆填報進度
    ProgressDelete(item, nodeid, index) {
      // console.log(this.propData, item, nodeid, index);
      this.$dialog["warning"]({
        title: "警告",
        text: "確定要刪除這個進度嗎？",
        persistent: false
      }).then(res => {
        if (res) {
          //1.更新螢幕
          Object.assign(this.propData.progress.splice(index, 1));

          console.log(item.pickey);
          //2.已上傳圖檔刪除
          if (item.pickey != "") {
            dbStorage
              .ref()
              .child(item.pickey)
              .delete();
          }

          //3.更新資料庫，上傳到第一層存檔
          this.$emit("listenToChild", this.propData);
        }
      });

      this.ProgressAddDialog = true;
      // return false;
    },

    //=============PDF============
    openPDF(url) {
      this.setiframe("PDFiframe");
      // console.log(this.$refs.PDFiframe);
      this.PDFURL = url;
      this.PDFdialog = true;
    },
    setiframe(id) {
      //使用diaglog 第一次會取不到值
      // const Iframe = document.getElementById(id);
      const Iframe = this.$refs.PDFiframe;
      // 取最大值
      const iheight = Math.max(
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
      );
      // console.log(Iframe);
      if (Iframe) {
        Iframe.height = iheight + "px";
      }
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

<style>
</style>
