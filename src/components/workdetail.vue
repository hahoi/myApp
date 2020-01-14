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
        <v-btn text color="orange" @click="detailEditDialog=true">編輯</v-btn>
      </v-card-actions>
    </v-card>

    <!-- ============================ 基本資料編輯 ======================== -->
    <v-dialog
      v-model="detailEditDialog"
      fullscreen
      hide-overlay
      transition="dialog-right-transition"
    >
      <v-toolbar dark color="indigo">
        <v-btn dark text class="px-0" @click="recordClose">
          <v-icon>mdi-backspace</v-icon>
          <span class="title">退回</span>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn dark text class="px-0" @click="recordSave">
          <v-icon>mdi-content-save-outline</v-icon>
          <span class="title">儲存</span>
        </v-btn>
      </v-toolbar>

      <v-card class>
        <v-card-title>基本資料編輯</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-container class="text-center">
              <div class="text-center mb-4">
                <v-overlay :opacity="0.5" z-index="1" :value="alert">
                  <v-alert color="red" dark transition="scale-transition">{{ alertResult }}</v-alert>
                </v-overlay>
              </div>

              <!-- 選擇開始日期 -->
              <v-col cols="12">
                <v-dialog
                  ref="startDateDialog"
                  v-model="startDateDialogModal"
                  :return-value.sync="propData.t_startdate"
                  persistent
                  width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="propData.t_startdate"
                      label="開始日期"
                      :rules="[rules.required]"
                      readonly
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="propData.t_startdate"
                    first-day-of-week="1"
                    locale="zh-TW"
                    scrollable
                  >
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="startDateDialogModal = false">Cancel</v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.startDateDialog.save(propData.t_startdate)"
                    >OK</v-btn>
                  </v-date-picker>
                </v-dialog>
              </v-col>

              <!-- 選擇結束日期 -->
              <v-col cols="12">
                <v-dialog
                  ref="endDateDialog"
                  v-model="endDateDialogModal"
                  :return-value.sync="propData.t_enddate"
                  persistent
                  width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="propData.t_enddate"
                      label="結束日期"
                      :rules="[rules.required]"
                      readonly
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="propData.t_enddate"
                    first-day-of-week="1"
                    locale="zh-TW"
                    scrollable
                  >
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="endDateDialogModal = false">Cancel</v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.endDateDialog.save(propData.t_enddate)"
                    >OK</v-btn>
                  </v-date-picker>
                </v-dialog>
              </v-col>

              <v-col cols="12">
                <v-select :items="depart" v-model="propData.depart" label="負責單位"></v-select>
              </v-col>

              <v-col cols="12">
                <v-select
                  label="狀態"
                  :items="status"
                  v-model="propData.status"
                  :rules="[rules.required]"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="propData.memo"
                  auto-grow
                  color="deep-purple"
                  label="備註"
                  rows="1"
                  :rules="[rules.length(50)]"
                ></v-textarea>
              </v-col>
            </v-container>
          </v-form>
        </v-card-text>
      </v-card>
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
                          <v-list-item-title>編輯</v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>刪除</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </td>
                  <td class="text-left">{{ item.pgdesc }}</td>
                  <td v-html="`<img src='${item.cfmpic}' style='height:80px;width:80px'>`"></td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
      </v-card-text>

      <v-card-actions></v-card-actions>
    </v-card>
  </div>
</template>





<script>
import { dbFirestore } from "@/fb";
import com_fun from "../utils/function";
import moment from "moment";
export default {
  name: "workdetail",
  props: ["propData"],
  data() {
    return {
      detailEditDialog: false,
      alertResult: "",
      alert: false,
      valid: false,

      rules: {
        email: v => (v || "").match(/@/) || "Please enter a valid email",
        length: len => v => (v || "").length <= len || `最多${len}個字元`,
        password: v =>
          (v || "").match(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/
          ) ||
          "Password must contain an upper case letter, a numeric character, and a special character",
        required: v => !!v || "這個欄位必須要輸入"
      },
      startDateDialogModal: false,
      endDateDialogModal: false,
      depart: [],
      status: []
    };
  },
  components: {},
  created() {
    dbFirestore
      .collection("SettingData")
      .doc("Department") //單位
      .get()
      .then(doc => {
        let temp = doc.data().depart;
        temp
          .sort(function(a, b) {
            return a.order - b.order; //小的排在前面，注意字串排序，用減號 不是 <
          })
          .forEach(item => {
            this.depart.push(item.title);
          });
      });

    dbFirestore
      .collection("SettingData")
      .doc("WorkItemStatus") //工作項目狀態
      .get()
      .then(doc => {
        this.status = doc.data().status;
      });
  },
  mounted() {},
  watch: {},
  computed: {},
  methods: {
    //基本資料存檔
    recordClose() {
      //關閉不存
      // this.$refs.form.reset() //清除所有欄位資料
      // this.formHasErrors = false
      // this.alert = false
      this.detailEditDialog = false;
    },
    recordSave() {
      //存檔
      if(moment(this.propData.t_startdate).isAfter(this.propData.t_enddate)) {
        this.ShowAlert("開始日期 ＞ 結束日期！");
      }

      if (!this.$refs.form.validate()) {
        //有錯
        console.log(this.$refs.form.validate());
        this.ShowAlert("輸入資料有錯誤！");
        return false;
      } else {
        console.log("else",this.$refs.form.validate());
      }
    },
    
    ShowAlert(alertMsg, showtime = 3000) {
      this.alertResult = alertMsg;
      this.alert = true;
      setTimeout(() => {
        this.alertResult = "";
        this.alert = false;
      }, showtime);
    }
  }
};
</script>

<style>
</style>
