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
            <!-- <v-btn color="primary" dark class="mb-2" v-on="on">新增使用者</v-btn> -->
          </template>
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
                  <!-- <v-form> -->
                  <!-- <v-col cols="12">
                    <v-text-field
                      :rules="[rules.required, rules.email]"
                      label="輸入E-mail"
                      v-model="editedItem.email"
                      name="email"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" v-if="editedIndex === -1">
                    <v-text-field
                      label="登入代號"
                      v-model="editedItem.alias"
                      :rules="[rules.required]"
                      name="alias"
                    ></v-text-field>
                  </v-col>-->
                  <v-col cols="12">
                    <v-text-field
                      label="姓名"
                      v-model="editedItem.name"
                      :rules="[rules.required]"
                      name="name"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-select :items="department" v-model="editedItem.department" label="單位名稱"></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field label="連絡電話" v-model="editedItem.telphone" name="telphone"></v-text-field>
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
                  <!-- </v-form> -->
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
            <v-list-item-title @click="sendPasswordResetEmailFun(item)">
              <v-icon small class="mr-2">mdi-pencil-outline</v-icon>發送重設密碼電子郵件
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title @click="ForcePasswordChangeAndAuthentication(item)">
              <v-icon small class="mr-2">mdi-pencil-outline</v-icon>強制變更密碼及驗證
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
// import slugify from "slugify";
import moment from "moment";
import { dbFirestore, dbAuth, dbFunctions } from "@/fb";
import { powerRouter, copyPowerRouter } from "../router";

export default {
  data: () => ({
    dialog: false,
    ForcePasswordChangeDialog: false,
    headers: [
      // sortable: false,
      // align: "left",
      { text: "登入代號", value: "alias" },
      { text: "Email", value: "email" },
      { text: "姓名", value: "name" },
      { text: "單位部門", value: "department" },
      { text: "連絡電話", value: "telphone" },
      { text: "使用權限", value: "role" },
      { text: "修改時間", value: "createAt" },
      { text: "操作", value: "action", sortable: false }
    ],
    desserts: [],
    roles: [], //所有的權限
    editedIndex: -1,

    department: [], //所有單位
    slug: "",
    show1: false,
    show2: false,
    password: "",
    repassword: "",

    editedItem: {
      slug: "",
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
    const useralias = this.$store.getters.user.alias;
    const pwrRouter = useralias === "000614" ? copyPowerRouter : powerRouter;
    pwrRouter[0].children.forEach(item => {
      if (item.meta !== undefined) {
        this.roles.push(item.meta.role);
      }
    });

    this.initialize();
  },
  mounted() {
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

  methods: {
    initialize() {
      this.$store.commit("setLoading", true);
      dbFirestore
        .collection("MyAppUsers") //.orderBy("createAt", "desc")
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            // console.log(doc.data().createAt,typeof(doc.data().createAt))
            let data = {
              slug: doc.id,
              authId: doc.data().authId,
              alias: doc.data().alias,
              email: doc.data().email,
              name: doc.data().name,
              department: doc.data().department,
              telphone: doc.data().telphone || "",
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
          this.$store.commit("setLoading", false);
        });
    },

    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.desserts.indexOf(item);
      //刪除前端user表格資料
      confirm("確定要刪除這筆資料嗎？") && this.desserts.splice(index, 1);
      // console.log(item)
      //刪除cloud firestore 資料
      dbFirestore
        .collection("MyAppUsers")
        .doc(item.slug)
        .delete();
      //刪除Authentication email資料
      // console.log(item.authId)
      const AdminDeleteUser = dbFunctions.httpsCallable("AdminDeleteUser");
      AdminDeleteUser({ uid: item.authId }).then(result => {
        // console.log(result);
        return result.data;
      });
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    save() {
      // let vm = this;
      if (this.editedIndex > -1) {
        //=============修改================
        let newDate = new Date();
        this.editedItem.createAt = moment(newDate).format("YYYY-MM-DD"); //讓前台顯示字串日期
        //將資料寫入前台陣列
        Object.assign(this.desserts[this.editedIndex], this.editedItem);

        // 將資料寫入後台資料庫
        this.editedItem.createAt = newDate; //後台寫入物件日期
        // this.editedItem.alias = this.editedItem.slug; //登入代號不能變更
        dbFirestore
          .collection("MyAppUsers")
          .doc(this.editedItem.slug)
          .set(this.editedItem)
          .then(() => {
            console.log("Document successfully Update!");
          })
          .catch(function(error) {
            /* eslint-disable no-console */
            console.error("Error Update document: ", error);
            /* eslint-enable no-console */
          });
      } else {
        //不要從這邊新增，新增因需email認證，再修改權限即可
        // this.desserts.push(this.editedItem);
      }
      this.close();
    },

    sendPasswordResetEmailFun(item) {
      const emailAddress = item.email;
      dbAuth
        .sendPasswordResetEmail(emailAddress)
        .then(function() {
          // Email sent.
        })
        .catch(function(error) {
          // An error happened.
        });
    },

    ForcePasswordChangeAndAuthentication(item) {
      this.$dialog
        .prompt({
          text: "密碼空白時，強制完成email認證。",
          title: "請輸入變更的密碼"
        })
        .then(resPassword => {
          let Udata = {};
          if (resPassword !== undefined) {
            if (resPassword.length < 8) {
              this.$dialog.notify.info("密碼長度至少需8個字元以上！");
            } else {
              Udata = {
                uid: item.authId,
                emailVerified: true,
                password: resPassword
                // email: item.email,
                // phoneNumber: '+11234567890',
                // displayName: "Jane Doe"
                // photoURL: 'http://www.example.com/12345678/photo.png',
                // disabled: true
              };
            }
          } else {
            Udata = {
              uid: item.authId,
              emailVerified: true
            };
          }
          const AdminUpdateUser = dbFunctions.httpsCallable("AdminUpdateUser");
          AdminUpdateUser(Udata).then(result => {
            console.log(result.data);
            // if (typeof result.data == "string") alert(result.data);
          });
        });
    }
  }
};
</script>


<style>
</style>
