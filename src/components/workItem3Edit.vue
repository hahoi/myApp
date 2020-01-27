<template>
  <div class="grey lighten-2">
    <v-toolbar dark color="orange">
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

    <v-card height="100vh" max-width="550"  class="mx-auto">
      <v-card-title class="pb-0">基本資料編輯</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-container class="text-center">
            <div class="text-center mb-4">
              <v-overlay :opacity="0.5" z-index="1" :value="alert">
                <v-alert color="red" dark transition="scale-transition">{{ alertResult }}</v-alert>
              </v-overlay>
            </div>

            <!-- 選擇開始日期 -->
            <v-col cols="12" class="py-1">
              <v-dialog
                ref="startDateDialog"
                v-model="startDateDialogModal"
                :return-value.sync="propData2.startDate"
                persistent
                width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="propData2.startDate"
                    label="開始日期"
                    :rules="[rules.required]"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="propData2.startDate"
                  first-day-of-week="1"
                  locale="zh-TW"
                  scrollable
                >
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="startDateDialogModal = false">Cancel</v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.startDateDialog.save(propData2.startDate)"
                  >OK</v-btn>
                </v-date-picker>
              </v-dialog>
            </v-col>

            <!-- 選擇結束日期 -->
            <v-col cols="12" class="py-1">
              <v-dialog
                ref="endDateDialog"
                v-model="endDateDialogModal"
                :return-value.sync="propData2.endDate"
                persistent
                width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="propData2.endDate"
                    label="結束日期"
                    :rules="[rules.required]"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="propData2.endDate"
                  first-day-of-week="1"
                  locale="zh-TW"
                  scrollable
                >
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="endDateDialogModal = false">Cancel</v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.endDateDialog.save(propData2.endDate)"
                  >OK</v-btn>
                </v-date-picker>
              </v-dialog>
            </v-col>

            <v-col cols="12" class="py-1">
              <v-select :items="depart" v-model="propData2.depart" label="負責單位"></v-select>
            </v-col>

            <v-col cols="12" class="py-1">
              <v-select
                label="狀態"
                :items="status"
                v-model="propData2.status"
                :rules="[rules.required]"
              ></v-select>
            </v-col>
            <v-col cols="12" class="py-1">
              <v-textarea
                v-model="propData2.memo"
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
  </div>
</template>

<script>
import { dbFirestore, databaseName2 } from "@/fb";
import com_fun from "../utils/function";
import moment from "moment";
export default {
  name: "workItem3Edit",
  props: ["propData2"],
  data() {
    return {
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
    recordClose() {
      //關閉不存
      this.$emit("listenToChild2", false);
    },
    recordSave() {
      //存檔
      if (
        moment(this.propData2.endDate).isAfter(this.propData2.parentEndDate)
      ) {
        this.ShowAlert(
          `結束日期 ＞ 專案結束日期！(${this.propData2.parentEndDate})`
        );
        return false;
      }

      if (
        moment(this.propData2.startDate).isAfter(this.propData2.endDate)
      ) {
        this.ShowAlert("開始日期 ＞ 結束日期！");
        return false;
      }

      if (!this.$refs.form.validate()) {
        //有錯
        // console.log(this.$refs.form.validate());
        this.ShowAlert("輸入資料有錯誤！");
        return false;
      } else {
        // console.log("else", this.$refs.form.validate());
        //將所有更動資料傳給上層上層(第一層)處理，這裡不存檔
        this.$emit("listenToChild2", this.propData2);
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
