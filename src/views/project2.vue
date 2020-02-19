<template>
  <div class="tree">
    <v-container>
      <v-row>
        <v-col cols="6">
          <v-text-field label="關鍵字搜尋..." v-model="searchword"></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-btn color="info" @click="searchFun">搜尋</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <img src="@/assets/loading.gif" height="40px" v-show="this.$store.getters.loading" />
    <v-tree ref="tree1" :data="treeData" :tpl="tpl" :draggable="true" @drag-node-end="MyDrag" />
    <scroll-up :scroll-duration="1000"></scroll-up>
    <v-container>
      <v-row>
        <v-spacer></v-spacer>
        <v-col cols="6">
          <v-btn
            color="info"
            @click="saveCurrentState"
            v-show="!this.$store.getters.loading"
          >儲存階層收合狀態</v-btn>
        </v-col>

        <span v-show="progressShow" class="mx-10">
          <v-progress-circular
            :size="100"
            :width="15"
            :value="progressValue"
            color="primary"
          >{{ progressValue }}%</v-progress-circular>
        </span>
        <v-spacer></v-spacer>
      </v-row>
    </v-container>

    <v-snackbar v-model="snackbar" :timeout="timeout">
      {{ databasemessage }}
      <v-btn dark text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import { dbFirestore, dbStorage, databaseName2 } from "@/fb";
import com_fun from "../utils/function";
import moment from "moment";
import ScrollUp from "vue-scroll-up";
import "vue-scroll-up/dist/style.css";

export default {
  name: "project2",
  data() {
    return {
      alert: false,

      snackbar: false,
      timeout: 2000,
      databasemessage: "",

      searchword: "",
      treeData: [],
      progressValue: 0,
      progressShow: false
    };
  },
  components: {
    ScrollUp
  },
  created() {
    //監聽資料庫變化
    dbFirestore.collection(databaseName2).onSnapshot(res => {
      const changes = res.docChanges();
      changes.forEach(change => {
        if (change.type === "added" && !this.$store.getters.loading) {
          // console.log(this.$store.getters.user.name, "added");
          this.databasemessage =
            this.$store.getters.user.name + " 正在新增資料！";
          this.snackbar = true;
        }
        if (change.type === "modified") {
          // console.log("modified");
          this.databasemessage =
            this.$store.getters.user.name + " 已經修改資料！";
          this.snackbar = true;
        }
        if (change.type === "removed") {
          // console.log("removed");
          this.databasemessage =
            this.$store.getters.user.name + " 已經刪除資料！";
          this.snackbar = true;
        }
      });
    });
  },
  mounted() {
    this.$store.commit("setLoading", true);
    let MyApp_data = [];
    dbFirestore
      .collection(databaseName2)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          MyApp_data.push(doc.data());
        });
        this.treeData = com_fun.arrayToJson(MyApp_data);
        this.$store.commit("setLoading", false);
      })
      .then(() => {
        if (MyApp_data.length == 0) {
          let data = {
            title: this.$store.getters.ApplicationText,
            id: this.$store.getters.LevelOneID,
            pid: "0",
            expanded: true,
            depart: "", //設定初值，db在update時有key name才不會出錯
            endDate: moment().format("YYYY-MM-DD") || "",
            startDate: moment().format("YYYY-MM-DD") || "",
            status: "",
            progress: []
          };

          dbFirestore
            .collection(databaseName2)
            .doc(this.$store.getters.LevelOneID)
            .set(data)
            .then(() => {
              MyApp_data.push(data);
              this.treeData = com_fun.arrayToJson(MyApp_data);
            });
        }
      });
  },
  watch: {
    search(val) {
      val && val !== this.select && this.querySelections(val);
    },
    progressValue() {
      this.progressShow =
        this.progressValue === 0 || this.progressValue === 100 ? false : true;
    }
  },
  computed: {},
  methods: {
    querySelections(v) {
      this.loading = true;
      // Simulated ajax query
      setTimeout(() => {
        this.items = this.dbRecord.map(e => {
          if (e.title.indexOf(v) > -1) return e.title;
        });
        this.loading = false;
      }, 500);
    },

    searchFun() {
      this.$refs.tree1.searchNodes(this.searchword);
    },
    /////////////樹狀節點操作///////////////////////
    // tpl (node, ctx, parent, index, props)
    tpl(...args) {
      let { 0: node, 2: parent, 3: index } = args;
      let titleClass = node.selected
        ? "node-title node-selected"
        : "node-title";
      if (node.searched) titleClass += " node-searched";
      return (
        <span>
          <span
            class={titleClass}
            domPropsInnerHTML={node.title}
            onClick={() => {
              this.$refs.tree1.nodeSelected(node);
              // console.log(ctx.parent.getSelectedNodes())
              let tmp = node.title;
              node.title = prompt("請更改工作項目名稱：", node.title) || tmp;
              if (node.title !== tmp) {
                //按取消不會變更
                dbFirestore
                  .collection(databaseName2)
                  .doc(node.id)
                  .update({ title: node.title })
                  .then(function() {
                    console.log("Document successfully updated!");
                  })
                  .catch(function(error) {
                    console.error("Error updating document: ", error);
                  });
              }
            }}
          />
          <button
            style="color:blue; background-color:pink;border-radius:4px;"
            onClick={() => this.asyncAddNode(node)} //增加節點
          >
            +增加
          </button>
          &nbsp;&nbsp;
          <button
            style="color:red; background-color:pink;border-radius:4px;"
            onClick={() => this.deleteNode(node, parent, index)} //刪除節點
          >
            -刪除
          </button>
        </span>
      );
    }, //tpl
    // ===========增加節點==============
    asyncAddNode(node) {
      let vm = this;
      this.$set(node, "loading", true);
      let timestamp = Math.floor(Date.now() / 1).toString();
      timestamp = timestamp.toString();
      let data = {
        title: "新增項目" + timestamp,
        id: timestamp,
        pid: node.id,
        expanded: true,
        depart: "", //設定初值，db在update時有key name才不會出錯
        endDate: moment().format("YYYY-MM-DD") || "",
        startDate: moment().format("YYYY-MM-DD") || "",
        status: "",
        progress: []
        // remaindays: 0,
      };
      dbFirestore
        .collection(databaseName2)
        .doc(timestamp)
        .set(data)
        .then(function() {
          console.log("節點建立成功！", timestamp, data);
          vm.$refs.tree1.addNode(node, data);
        })
        .catch(function(error) {
          // console.error("資料庫儲存失敗！", error);
        });
      this.$set(node, "loading", false);
    },
    //===========刪除節點======================
    deleteNode(node, parent, index) {
      let vm = this;
      //刪除分成兩種情況，含有children key name 及 沒有的
      if (typeof node.children == "object") {
        if (node.children.length >= 1) {
          // console.log(node, node.children);
          this.$confirm("包含子項目，不能刪除！請先刪除子項目。");
        } else {
          vm.deleteNodeHandle(node, parent, index);
        }
      } else {
        vm.deleteNodeHandle(node, parent, index);
      }
    },
    //===處理節點刪除動作===
    deleteNodeHandle(node, parent, index) {
      this.$confirm(
        "刪除後無法復原，<br>確定要刪除【" + node.title + "】嗎？",
        { color: "red", title: "嚴重警告(第一次)" }
      ).then(res => {
        if (res) {
          this.$confirm(
            "此節點中的填報資料及佐證資料都會被刪除！<br>確定要刪除嗎？",
            {
              color: "orange",
              title: "嚴重警告(第二次)"
            }
          ).then(res => {
            if (res) {
              // console.log(node.id, "parent->", parent, "index->", index);
              dbFirestore
                .collection(databaseName2)
                .doc(node.id)
                .delete()
                .then(() => {
                  console.log("資料刪除成功！", node.id, node.progress);
                  if (node.progress) {
                    let DeleteRef = "/" + databaseName2 + "/" + node.id + "/";
                    // 刪除fireStorage儲存的圖檔
                    this.deleteStorageFile(DeleteRef);
                  }
                  this.$refs.tree1.delNode(node, parent, index);
                })
                .catch(function(error) {
                  console.error("Error removing document: ", error);
                });
            }
          });
        }
      });
    },
    // 刪除fireStorage儲存的圖檔
    deleteStorageFile(DeleteRef) {
      console.log("刪除fireStorage儲存的圖檔", DeleteRef);
      // 刪除fireStorage儲存的圖檔
      dbStorage
        .ref()
        .child(DeleteRef)
        .delete()
        .then(function() {
          console.log("File deleted successfully");
        })
        .catch(function(error) {
          console.log("Uh-oh, an error occurred!");
        });
    }, //===========搬移資料======================
    MyDrag(...args) {
      let { 0: Node } = args;
      // console.log("node-title", Node.dragNode.title);
      // console.log("node-id", Node.dragNode.id);
      // console.log("node-old-pid", Node.dragNode.pid);
      // console.log("node-new-pid", Node.targetNode.id);
      // console.log("node-new-pid-title", Node.targetNode.title);

      this.$confirm("你已經搬移了資料，確定要存檔嗎？", {
        color: "red",
        title: "警告"
      }).then(res => {
        if (res) {
          dbFirestore
            .collection(databaseName2)
            .doc(Node.dragNode.id)
            .update({ pid: Node.targetNode.id })
            .then(function() {
              // window.location.reload();
              // console.log("資料存檔完成！", Node.targetNode.title);
            })
            .catch(function(error) {
              // console.error("資料存檔失敗！", error);
            });
        } else {
          let vm = this;
          dbFirestore
            .collection(databaseName2)
            .get()
            .then(function(querySnapshot) {
              let MyApp_data = [];
              querySnapshot.forEach(function(doc) {
                MyApp_data.push(doc.data());
              });
              vm.treeData = com_fun.arrayToJson(MyApp_data);
              // window.location.reload()
            });
        }
        // window.location.reload()
      });
    },

    saveCurrentState() {
      // console.log(this.$refs.tree1.getNodes({}))
      let arrayRecord = this.$refs.tree1.getNodes({});
      // this.timeout = 10000;
      this.progressShow = true;
      let arrayRecordLength = arrayRecord.length;
      let i = 0;
      arrayRecord.forEach(item => {
        dbFirestore
          .collection(databaseName2)
          .doc(item.id)
          .get()
          .then(doc => {
            this.progressValue = Math.round((++i * 100) / arrayRecordLength);
            // console.log(this.progressValue,i)
            if (doc.data().expanded !== item.expanded) {
              // console.log(doc.data().expanded,item.expanded)
              dbFirestore
                .collection(databaseName2)
                .doc(item.id)
                .update({ expanded: item.expanded })
                .then(() => {});
            }
          });
      });
    }
  }
};
</script>

<style scoped>
.node-title.node-searched {
  margin: 0px;
  padding: 0px;
}
</style>
