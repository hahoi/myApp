<template>
  <v-data-table :headers="headers" :items="desserts" sort-by="calories" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat color="blue lighten-4">
        <v-toolbar-title>機關單位</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>

        <!-- 彈跳編輯視窗，因新增slot須放在toolbar裡面，改為全螢幕-->
        <v-dialog v-model="dialog" fullscreen>
          <template v-slot:activator="{ on }">
            <v-btn color="primary" dark class="mb-2" v-on="on">新增</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.order" label="排列順序"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.title" label="單位名稱"></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">放棄</v-btn>
              <v-btn color="blue darken-1" text @click="save">儲存</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.action="{ item }">
      <v-icon small  color="teal" class="mr-2" @click="editItem(item)">edit</v-icon>
      <v-icon small color="pink" @click="deleteItem(item)">delete</v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize">Reset</v-btn>
    </template>
  </v-data-table>
</template>

<script>
import { dbFirestore } from "@/fb";
export default {
  name: "",
  data() {
    return {
      dialog: false,
      headers: [
        {
          text: "順序",
          align: "left",
          sortable: true,
          value: "order"
        },
        { text: "單位名稱", value: "title" },
        { text: "編輯", value: "action", sortable: false } //這一行特別注意要加入才有編輯功能
      ],
      desserts: [],
      editedIndex: -1,
      editedItem: {
        order: "",
        title: ""
      },
      defaultItem: {
        order: "",
        title: ""
      }
    };
  },
  components: {},
  created() {
    this.initialize();
  },
  mounted() {},

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "新增" : "修改";
    }
  },
  methods: {
    initialize() {
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
              this.desserts.push(item);
            });
        });
    },

    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.desserts.indexOf(item);
      //   confirm("Are you sure you want to delete this item?") &&
      //     this.desserts.splice(index, 1);

      this.$confirm("確定要刪除這筆資料嗎？", {
        color: "orange",
        title: "警告"
      }).then(res => {
        if (res) {
          //前端
          this.desserts.splice(index, 1);
          //刪除cloud firestore 資料
          let obj_depart = { depart: this.desserts }; //整個陣列更換
          dbFirestore
            .collection("SettingData")
            .doc("Department")
            .set(obj_depart)
            .then(() => {
              console.log("Document successfully delete!");
            })
            .catch(function(error) {
              console.error("Error delete : ", error);
            });
        }
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
      //將資料寫入前台陣列
      if (this.editedIndex > -1) {
        //==修改==
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
      } else {
        //==新增==
        this.desserts.push(this.editedItem);
        this.desserts.sort(function(a, b) {
          return a.order - b.order; //小的排在前面，注意字串排序，用減號 不是 <
        });
      }

      let obj_depart = { depart: this.desserts }; //整個陣列更換
      // 將資料寫入後台資料庫
      dbFirestore
        .collection("SettingData")
        .doc("Department")
        .set(obj_depart)
        .then(() => {
          console.log("Document successfully Update!");
        })
        .catch(function(error) {
          /* eslint-disable no-console */
          console.error("Error Update document: ", error);
          /* eslint-enable no-console */
        });

      this.close();
    }
  }
};
</script>

<style>
</style>
