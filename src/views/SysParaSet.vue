<template>
  <v-app id="SystemParaSetting">
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <div class="text-center mb-4">
            <v-overlay :opacity="0.5" z-index="1" :value="alert">
              <v-alert color="red" dark transition="scale-transition">{{ alertResult }}</v-alert>
            </v-overlay>
          </div>
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>系統參數設定</v-toolbar-title>
                <!-- <v-spacer />
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn link to="/" icon large v-on="on">登入畫面</v-btn>
                  </template>
                  <span>離開註冊</span>
                </v-tooltip>-->
              </v-toolbar>
              <v-card-text>
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-text-field
                    :rules="[rules.required]"
                    label="系統標題"
                    v-model="data.ApplicationText"
                    name="ApplicationText"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="頁尾註腳"
                    v-model="data.footerText"
                    :rules="[rules.required]"
                    name="footerText"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="管理員電話"
                    v-model="data.admTelephone"
                    :rules="[rules.required]"
                    name="admTelephone"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="專案結束日期"
                    v-model="data.projectEndDate"
                    :rules="[rules.required]"
                    name="projectEndDate"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="結構最上層編號"
                    v-model="data.LevelOneID"
                    :rules="[rules.required]"
                    name="LevelOneID"
                    required
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn text color @click="close">取消</v-btn>
                <v-btn color="primary" @click="save">存檔</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { dbFirestore, dbAuth, dbFunctions } from "@/fb";

export default {
  name: "SysParaSet",
  data() {
    return {
      valid: false,
      alertResult: "",
      alert: false,

      data: {
        ApplicationText: "",
        footerText: "",
        admTelephone: "",
        projectEndDate: "",
        LevelOneID: ""
      },

      rules: {
        required: value => !!value || "這個欄位必須要輸入"
      }
    };
  },
  components: {},
  created() {},
  mounted() {
    dbFirestore
      .collection("SettingData")
      .doc("system") //單位
      .get()
      .then(doc => {
        let temp = doc.data();
        this.data.ApplicationText = temp.ApplicationText;
        this.data.footerText = temp.footerText;
        this.data.admTelephone = temp.admTelephone;
        this.data.projectEndDate = temp.projectEndDate;
        this.data.LevelOneID = temp.LevelOneID;
      });
  },
  watch: {},
  computed: {},
  methods: {
    save() {
      if (!this.$refs.form.validate()) {
        this.ShowAlert("輸入資料有錯誤！");
        return false;
      }
      //   console.log(this.data)
      //   return true
      dbFirestore
        .collection("SettingData")
        .doc("system") //單位
        .set(this.data)
        .then(() => {
          console.log("Document successfully add!");
        })
        .catch(error => {
          console.log(error);
        });
    },
    close() {
      this.$router.go(-1);
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
