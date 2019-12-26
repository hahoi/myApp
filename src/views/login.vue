<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>2020 管理系統</v-toolbar-title>
                <v-spacer />
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn link to="/signup" icon large v-on="on">註冊</v-btn>
                  </template>
                  <span>沒有帳號，請按此註冊</span>
                </v-tooltip>
              </v-toolbar>
              <v-card-text>
                <v-form>
                  <!-- <v-text-field label="Login" name="login" prepend-icon="person" type="text" /> -->
                  <v-text-field label="輸入帳號" name="login" v-model="email" :rules="[rules.required]"></v-text-field>
                  <v-text-field
                    v-model="password"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :rules="[rules.required, rules.min]"
                    :type="show1 ? 'text' : 'password'"
                    name="input-10-1"
                    label="請輸入密碼"
                    counter
                    @click:append="show1 = !show1"
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" @click="login_handle">Login</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>


<script>
import slugify from "slugify";
import { dbFirestore, dbAuth, dbFunctions } from "@/fb";

export default {
  name: "login",
  data() {
    return {
      show1: false,
      email: "a000614@oa.pthg.gov.tw",
      password: "00000000",
      rules: {
        required: value => !!value || "Required.",
        min: v => v.length >= 8 || "最少需要8個字元",
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "不合格式的 e-mail.";
        }
      },
      user: null
    };
  },
  components: {},
  created() {},
  mounted() {},
  watch: {},
  computed: {},
  methods: {
    login_handle() {
      let vm = this;
      const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (pattern.test(vm.email)) {
        //用email登入
        // console.log("email");
        vm.LoginVerificationAndJump(vm.email, vm.password);
      } else {
        //不是用email登入，用代號登入
        // console.log("alias");
        let slug = slugify(vm.email, {
          replacement: "-",
          remove: /[$*_+~.()'"!\-:@]/g,
          lower: true
        });
        //找出代號的email
        dbFirestore
          .collection("MyAppUsers")
          .doc(slug)
          .get()
          .then(doc => {
            let email = doc.data().email;
            vm.LoginVerificationAndJump(email, vm.password);
          })
          .catch(() => {
            vm.$confirm("沒有這個帳號！", {
              color: "error",
              title: "錯誤",
              buttonFalseText: "",
              buttonTrueText: "重試"
            });
          });
      }
    }, //login_handle

    //=========登入驗證並跳轉=========
    LoginVerificationAndJump(id, ps) {
      let vm = this;
      dbAuth
        .signInWithEmailAndPassword(id, ps)
        .then(resUser => {
          if (resUser.user.emailVerified) {
            // console.log(resUser.user);
            dbFirestore
              .collection("MyAppUsers")
              .where("authId", "==", resUser.user.uid)
              .get()
              .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                  vm.User = {
                    authId: doc.data().authId,
                    email: doc.data().email,
                    department: doc.data().department,
                    name: doc.data().name,
                    alias: doc.data().alias,
                    role: doc.data().role,
                    state: doc.data().state,
                    memo: doc.data().memo
                  };
                });
                //登入成功後將使用者資料存入vuex store
                vm.$store
                  .dispatch("loginSet", vm.User)
                  .then(() => {
                    // ============跳轉到指定頁面============
                    vm.$router.push({ path: "/Main" });
                  })
                  .catch(() => {
                    console.log("loginSet error");
                  });
              });
          } else {
            vm.$confirm(
              "你註冊的Email帳號尚未驗證！<br>請到註冊的郵件信箱收信，點擊連結回傳確認。",
              { title: "警告", buttonFalseText: "", buttonTrueText: "好" }
            );
          }
        })
        .catch(error => {
          var errorCode = error.code;
          if (errorCode == "auth/invalid-email") {
            errorCode = "email 不符規定！";
          }
          if (errorCode == "auth/user-disabled") {
            errorCode = "這個email已被停用！";
          }
          if (errorCode == "auth/user-not-found") {
            errorCode = "找不到這個使用者！";
          }
          if (errorCode == "auth/wrong-password") {
            errorCode = " 密碼錯誤！";
          }
          if (errorCode == "auth/weak-password") {
            errorCode = "這個密碼太簡單！";
          }
          vm.$confirm(errorCode, {
            color: "error",
            title: "錯誤",
            buttonFalseText: "",
            buttonTrueText: "重試"
          });
        });
    }
  } //methods
};
</script>

<style>
</style>
