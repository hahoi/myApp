<template>
  <v-data-table
    :headers="headers"
    :items="desserts"
    sort-by="createAt"
    class="elevation-1"
    locale="zh-TW"
  >
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>使用者管理</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <!-- max-width="500px" -->

        <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
          <template v-slot:activator="{ on }">
            <v-btn color="primary" dark class="mb-2" v-on="on">新增使用者</v-btn>
          </template>

          <div class="text-center mb-4">
            <v-overlay :opacity="0.5" z-index="1" :value="alert">
              <v-alert color="red" dark transition="scale-transition">{{ alertResult }}</v-alert>
            </v-overlay>
          </div>

          <v-card outlined>
            <v-toolbar dark color="primary">
              <v-toolbar-title>
                <span class="headline">{{ formTitle }}</span>
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-toolbar-items>
                <v-btn dark text @click="dialog = false">儲存</v-btn>
              </v-toolbar-items>
              <v-btn icon dark @click="dialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar>

            <!-- <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>-->

            <v-card-text>
              <v-container>
                <v-row>
                  <v-form>
                    <v-col cols="12">
                      <v-text-field
                        :rules="[rules.required, rules.email]"
                        label="輸入E-mail"
                        v-model="editedItem.email"
                        name="email"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        label="輸入姓名"
                        v-model="editedItem.name"
                        :rules="[rules.required]"
                        name="name"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" v-if="editedIndex === -1">
                      <v-text-field
                        label="登入代號"
                        v-model="editedItem.alias"
                        :rules="[rules.required]"
                        name="alias"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-select :items="department" v-model="editedItem.department" label="單位名稱"></v-select>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field label="連絡電話" v-model="editedItem.telphone" name="telphone"></v-text-field>
                    </v-col>
                    <v-col cols="12" v-if="editedIndex === -1">
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
                    </v-col>
                    <v-col cols="12" v-if="editedIndex !== -1">
                      <v-select
                        :items="roles"
                        v-model="editedItem.role"
                        :menu-props="{ maxHeight: '400' }"
                        label="權限"
                        multiple
                        persistent-hint
                      ></v-select>
                    </v-col>
                  </v-form>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">不存離開</v-btn>
              <v-btn color="blue darken-1" text @click="save">儲存</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.action="{ item }">
      <v-menu bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list class="text-left">
          <v-list-item>
            <v-list-item-title @click="editItem(item)">
              <v-icon small class="mr-2">mdi-pencil-outline</v-icon>編輯使用者資料
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title @click="editItem(item)">
              <v-icon small class="mr-2">mdi-pencil-outline</v-icon>發送重設密碼電子郵件
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title @click="editItem(item)">
              <v-icon small class="mr-2">mdi-pencil-outline</v-icon>重新進行email驗證
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title @click="deleteItem(item)">
              <v-icon small class="mr-2">mdi-delete</v-icon>刪除使用者
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize">重新載入資料</v-btn>
    </template>
  </v-data-table>
</template>

<script>
import slugify from "slugify";
import moment from "moment";
import { dbFirestore, dbAuth, dbFunctions } from "@/fb";
import { powerRouter } from "../router";

export default {
  data: () => ({
    alertResult: "",
    alert: false,
    dialog: false,
    headers: [
      // sortable: false,
      // align: "left",
      { text: "登入代號", value: "alias" },
      { text: "Email", value: "email" },
      { text: "姓名", value: "name" },
      { text: "單位部門", value: "department" },
      { text: "連絡電話", value: "telphone" },
      { text: "使用權限", value: "role" },
      { text: "建立時間", value: "createAt" },
      { text: "操作", value: "action", sortable: false }
    ],
    desserts: [],
    roles: [], //所有的權限
    editedIndex: -1,

    department: [], //單位
    slug: "",
    show1: false,
    show2: false,
    password: "",
    repassword: "",

    editedItem: {
      alias: "",
      authId: null,
      email: "",
      name: "",
      department: "",
      telphone: "",
      role: [],
      state: "",
      memo: "",
      createAt: null
    },
    defaultItem: {
      alias: "",
      authId: null,
      email: "",
      name: "",
      department: "",
      telphone: "",
      role: [],
      state: "",
      memo: "",
      createAt: null
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
        (v || "").match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/) ||
        "密碼必須包含大寫英文、數字、特殊字元"
      // passwordMath: v => v === this.password || "密碼必須相同"
      // emailMatch: () => "The email and password you entered don't match"
    }
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "新增使用者" : "使用者資料編輯";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  created() {
    //讀取所有的權限
    powerRouter[0].children.forEach(item => {
      // console.log(item.meta)
      if (item.meta !== undefined) {
        this.roles.push(item.meta.role);
      }
    });

    this.initialize();
    // console.log(this.$store.state.device);
  },

  methods: {
    initialize() {
      this.$store.commit("Update_Loading", true);
      dbFirestore
        .collection("MyAppUsers") //.orderBy("createAt", "desc")
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            // console.log(doc.data().createAt,typeof(doc.data().createAt))
            let data = {
              slug: doc.id,
              alias: doc.data().alias,
              email: doc.data().email,
              name: doc.data().name,
              department: doc.data().department,
              telphone: doc.data().telphone,
              memo: doc.data().memo,
              role: doc.data().role,
              state: doc.data().state,
              // 判斷是否為物件日期
              createAt:
                typeof doc.data().createAt === "object"
                  ? moment(doc.data().createAt.toDate()).format("YYYY-MM-DD")
                  : doc.data().createAt || ""
            };
            this.desserts.push(data);
          });
          this.$store.commit("Update_Loading", false);
        });
    },

    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.desserts.indexOf(item);
      confirm("Are you sure you want to delete this item?") &&
        this.desserts.splice(index, 1);
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    save() {
      if (this.editedIndex > -1) {
        //=============修改================
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
      } else {
        //===========新增===================
        //處理註冊
        let vm = this;
        let user = vm.editedItem;

        this.slug = slugify(this.editedItem.alias, {
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
                .createUserWithEmailAndPassword(user.email, vm.password)
                .then(resUser => {
                  console.log(resUser);
                  //================新增=================
                  let newDate = new Date();
                  user.authId = resUser.user.uid;
                  user.createAt = newDate; //後台寫入物件日期
                  console.log(user);
                  dbFirestore
                    .collection("MyAppUsers")
                    .doc(vm.slug)
                    .set(user)
                    .then(() => {
                      console.log("Document successfully add!");
                    })
                    .catch(error => {
                      console.log("error", error);
                    });
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

        this.desserts.push(this.editedItem);
      }
      this.close();
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
