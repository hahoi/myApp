<template>
  <v-app id="signup">
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
                <v-toolbar-title>註冊新帳號</v-toolbar-title>
                <v-spacer />
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn link to="/" icon large v-on="on">Login</v-btn>
                  </template>
                  <span>離開註冊</span>
                </v-tooltip>
              </v-toolbar>
              <v-card-text>
                <v-form>
                  <!-- <v-text-field label="Login" name="login" prepend-icon="person" type="text" /> -->
                  <v-text-field
                    :rules="[rules.required, rules.email]"
                    label="輸入E-mail"
                    v-model="user.email"
                    name="email"
                  ></v-text-field>
                  <v-text-field
                    label="輸入姓名"
                    v-model="user.name"
                    :rules="[rules.required]"
                    name="name"
                  ></v-text-field>
                  <v-text-field
                    label="登入代號"
                    v-model="user.alias"
                    :rules="[rules.required]"
                    name="alias"
                  ></v-text-field>
                  <v-select :items="department" v-model="user.department" label="單位名稱"></v-select>
                  <!-- <v-text-field
                    label="單位名稱"
                    v-model="user.department"
                    :rules="[rules.required]"
                    name="department"
                  ></v-text-field>-->

                  <v-text-field
                    v-model="password"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :rules="[rules.required, rules.min]"
                    :type="show1 ? 'text' : 'password'"
                    name="password"
                    label="請輸入密碼"
                    hint="最少需要8個字元"
                    counter
                    @click:append="show1 = !show1"
                  ></v-text-field>
                  <v-text-field
                    v-model="repassword"
                    :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                    :rules="[rules.required, rules.min, rules.passwordMath]"
                    :type="show2 ? 'text' : 'password'"
                    name="repassword"
                    label="再輸入相同的密碼"
                    hint="最少需要8個字元"
                    counter
                    @click:append="show2 = !show2"
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn @click="sendEmailVerification">重新發送驗證郵件</v-btn>
                <v-spacer />
                <v-btn color="primary" @click="signup_handle">註冊</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-btn small @click="FirebaseAdminTest">admin測試</v-btn>
        <v-btn small @click="logout">logout</v-btn>

        <!-- 提示對話視窗 -->
        <!-- <div class="text-center">
          <v-dialog v-model="EmailVerificationDialog" width="400">
            <v-card>
              <v-card-title class="headline grey lighten-2" primary-title>提示</v-card-title>
              <v-card-text>請到註冊的郵件信箱收信，點擊連結回傳確認。</v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="EmailVerificationDialog = false">知道了</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>-->
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
// import db from "@/fb";
// import firebase from "firebase/app";
// import "firebase/auth";

import slugify from "slugify";
import { dbFirestore, dbAuth, dbFunctions } from "@/fb";

export default {
  name: "signup",
  data() {
    return {
      // EmailVerificationDialog: false,
      alertResult: "",
      alert: false,
      show1: false,
      show2: false,
      department: [], //單位
      slug: "",
        password: "00000000",
        repassword: "00000000",
      user: {
        //使用者資料
        authId: null,
        email: "a000614@oa.pthg.gov.tw",
        name: "謝孟良",
        alias: "000614",
        department: "研考處",
        role: null, //角色
        state: "",
        memo: ""
      },
      rules: {
        required: value => !!value || "這個欄位必須要輸入",
        min: v => v.length >= 8 || "最少需要8個字元",
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "不合格式的 e-mail.";
        },
        length: len => v => (v || "").length <= len || `最多${len}個字元`,
        password: v =>
          (v || "").match(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/
          ) || "密碼必須包含大寫英文、數字、特殊字元",
        passwordMath: v => v === this.user.password || "密碼必須相同"
        // emailMatch: () => "The email and password you entered don't match"
      }
    };
  },
  components: {},
  created() {},
  mounted() {
    let vm = this;
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
            this.department.push(item.title);
          });
      });
  },
  watch: {},
  computed: {},
  methods: {
    signup_handle() {
      //處理註冊
      let vm = this;

      this.slug = slugify(this.user.alias, {
        replacement: "-",
        remove: /[$*_+~.()'"!\-:@]/g,
        lower: true
      });
      dbFirestore //先檢查登入代號是否存在
        .collection("MyAppUsers")
        .doc(this.slug)
        .get()
        .then(doc => {
          if (doc.exists) {
            vm.ShowAlert("這個登入代號已經存在！");
          } else {
            // console.log(doc);
            //建立帳號
            dbAuth
              .createUserWithEmailAndPassword(vm.user.email, vm.password)
              .then(resUser => {
                console.log(resUser);
                //註冊成功，送出回傳認證，顯示提示視窗
                // dbAuth.currentUser.sendEmailVerification();
                vm.$confirm("請到註冊的郵件信箱收信，<br>點擊連結回傳確認。", {
                  title: "請注意",
                  buttonFalseText: "",
                  buttonTrueText: "知道了"
                });

                //================新增=================
                let newDate = new Date();
                vm.user.authId = resUser.user.uid;
                vm.user.createAt = newDate; //後台寫入物件日期
                console.log(vm.user);
                dbFirestore
                  .collection("MyAppUsers")
                  .doc(vm.slug)
                  .set(vm.user)
                  .then(() => {
                    console.log("Document successfully add!");
                  })
                  .catch(error => {
                    console.log("error")
                    console.log(error)
                  })
              }) //註冊失敗，顯示錯誤訊息經過三秒後關閉警示
              .catch(function(error) {
                // console.log(error)
                // Handle Errors here.
                var errorCode = error.code;
                // var errorMessage = error.message;
                if (errorCode == "auth/weak-password") {
                  errorCode = "這個密碼太簡單！";
                }
                if (errorCode == "auth/email-already-in-use") {
                  errorCode = "這個 email 帳號已經被使用過了！";
                }
                if (errorCode == "auth/invalid-email") {
                  errorCode = "email 不符規定！";
                }
                if (errorCode == "auth/operation-not-allowed") {
                  errorCode = "未啟用「電子郵件/密碼」登入方式！";
                }
                //alert 三秒後警示消失
                vm.ShowAlert(errorCode);
              });
          }
        })
        .catch(error => {
          console.log(error);
        });
    },

    sendEmailVerification() {
      let vm = this;
      console.log(dbAuth.currentUser);
      if (dbAuth.currentUser) {
        dbAuth.currentUser
          .sendEmailVerification()
          .then(function() {
            //註冊成功，顯示提示視窗
            vm.$confirm("請到註冊的郵件信箱收信，<br>點擊連結回傳確認。", {
              title: "請注意",
              buttonFalseText: "",
              buttonTrueText: "知道了"
            });
          })
          .catch(error => {
            var errorCode = error.code;
            var errorMessage = error.message;
            vm.alertResult = errorMessage;

            if (errorCode == "auth/too-many-requests") {
              errorCode = "已經送出確認連結了！";
            }
            vm.ShowAlert(errorCode);
            // console.log(errorCode);
          });
      } else {
        vm.ShowAlert("尚未註冊成功！");
      } // [END sendemailverification]
    },
    // 測試cloud function admin
    FirebaseAdminTest() {
      const getUserByEmail = dbFunctions.httpsCallable("getUserByEmail");
      getUserByEmail({ email: "a000614@oa.pthg.gov.tw" }).then(result => {
        console.log(result);
        return result.data;
      });

      const listUsers = dbFunctions.httpsCallable("listUsers");
      listUsers().then(result => {
        console.log(result);
      });
    },
    logout() {
      this.$store.dispatch("logout").then(() => {
          this.$router.push({ path: "/login" });
        })
        .catch(err => {
          throw new Error(error);
        });

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
