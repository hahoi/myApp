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
            <span class="body-1 blue--text" v-html="propData.t_startdate"></span>
          </v-col>
          <v-col cols="12" class="mb-2">
            完成日期：
            <span class="body-1 blue--text mb-1" v-html="propData.t_enddate"></span>
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
        <v-btn text color="orange" @click="workItemDetailEdit">編輯</v-btn>
        <v-spacer></v-spacer>
        <v-btn text color="indigo" @click="ProcessAdd(newProcess,true)">進度填報</v-btn>
      </v-card-actions>
    </v-card>

    <!-- ============================ 基本資料編輯 ======================== -->
    <v-dialog
      v-model="detailEditDialog"
      fullscreen
      hide-overlay
      transition="dialog-right-transition"
    >
      <workdetailEdit
        :propData2="editWorkItemDetailData"
        @listenToChild2="getChildData_ItemDetailEdit"
      ></workdetailEdit>
    </v-dialog>

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
                <tr v-for="item in propData.process" :key="item.id">
                  <td class="text-left px-0">
                    <v-menu bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn text v-on="on" class="text-left px-0">{{item.t_pgdate }}</v-btn>
                      </template>

                      <v-list>
                        <v-list-item>
                          <v-list-item-title @click="ProcessAdd(item,false)">修改</v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>刪除</v-list-item-title>
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
      v-model="ProcessAddDialog"
      fullscreen
      hide-overlay
      transition="dialog-right-transition"
    >
                   <!-- 傳入該項(item)的Process資料，以及判斷是否新增或修改 -->
      <workProcessAdd :propData4="ProcessAddData" :addProcess="addProcess" @listenToChild4="getChildData_ProcessAdd"></workProcessAdd>
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
import workdetailEdit from "./workdetailEdit";
import workProcessAdd from "./workProcessAdd";

// import { dbFirestore } from "@/fb";
import com_fun from "../utils/function";
import moment from "moment";

export default {
  name: "workdetail",
  props: ["propData"],
  data() {
    return {
      detailEditDialog: false,
      editWorkItemDetailData: {},

      ProcessAddDialog: false,
      ProcessAddData: {},
      addProcess: true,
      newProcess:{
        cfmpic: "",
        pgdate: {},
        pgdesc: "",
        pickey: "",
        t_pgdate: moment().format("YYYY-MM-DD")
      },

      PDFdialog: false,
      PDFURL: "",
      iframeHeight: "1000 px"
    };
  },
  components: {
    workdetailEdit,
    workProcessAdd
  },
  created() {},
  mounted() {},
  watch: {},
  computed: {},
  methods: {
    //==========================================基本資料================================
    workItemDetailEdit() {
      this.detailEditDialog = true;
      //深拷貝一份，送子component處理
      this.editWorkItemDetailData = com_fun.deepCopy(this.propData);
      // console.log("editWorkItemDetailData", this.editWorkItemDetailData);
    },
    getChildData_ItemDetailEdit(childData) {
      this.detailEditDialog = false;
      if (!childData) return false;
      //處理過資料，重新設定
      this.propData.title = this.propData.t_title; //還原title
      this.propData.depart = childData.depart;
      this.propData.t_enddate = childData.t_enddate;
      this.propData.t_startdate = childData.t_startdate;
      this.propData.status = childData.status;
      this.propData.process = childData.process;
      if (childData.memo) {
        this.propData.memo = childData.memo;
      }
      let days = "";
      let remdayshow = "";
      if (
        moment(this.propData.t_startdate) < moment() &&
        this.propData.status != "完成"
      ) {
        this.propData.remaindays = moment(
          moment(this.propData.t_enddate).diff(moment())
        ).format("D");
        days = moment(this.propData.t_enddate).diff(moment(), "day");
        this.propData.remaindays = `<span class="red--text">${days}天</span>`;
      } else {
        this.propData.remaindays = "";
      }

      //傳回 propData 資料給父層處理 資料庫存檔 及 更改陣列物件
      this.$emit("listenToChild", childData);
      this.dialog = false; //關閉視窗
    },
    //=================================進度填報新增修改===================================
    ProcessAdd(item,add) {
      this.addProcess = add
      this.ProcessAddDialog = true;
      //拷貝一份，送子component處理
      this.ProcessAddData = {...item};
    },
    getChildData_ProcessAdd(childData) {
      this.ProcessAddDialog = false;
      if (!childData) return false;
      // //處理過資料，重新設定
      this.propData.process = childData
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
    }
  }
};
</script>

<style>
</style>
