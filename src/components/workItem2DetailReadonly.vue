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
        <!-- <v-btn text color="orange" @click="workItemDetailEdit">編輯</v-btn>
        <v-spacer></v-spacer>
        <v-btn text color="indigo" @click="ProcessAdd(newProcess,propData.id,true,-1)">進度填報</v-btn> -->
      </v-card-actions>
    </v-card>


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
                  <td class="text-left px-0" v-html="item.pgdate"></td>
                  <td class="text-left" v-html="item.pgdesc"></td>
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

import { dbFirestore, dbStorage, databaseName } from "@/fb";
import com_fun from "../utils/function";
import moment from "moment";

export default {
  name: "workItem2DetailReadonly",
  props: ["propData"],
  data() {
    return {
      // detailEditDialog: false,
      // editWorkItemDetailData: {},
      // tempDetailData: {},

      // ProcessAddDialog: false,
      // ProcessAddData: {},
      // tempProcessAddData: {},
      // tempIndex: -1,
      // addProcess: true,
      // ProcessNodeId: "",
      // ProcessItemIndex: -1,

      // newProcess: {
      //   cfmpic: "",
      //   pgdate: new Date(moment()), //轉換日期物件
      //   pgdesc: "",
      //   pickey: "",
      //   t_pgdate: moment().format("YYYY-MM-DD")
      // },

      PDFdialog: false,
      PDFURL: "",
      iframeHeight: "1000 px"
    };
  },
  components: {

  },
  created() {},
  mounted() {
  },
  watch: {},
  computed: {},
  methods: {


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
