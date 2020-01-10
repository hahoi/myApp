<template>
  <div class="tree">
    <v-container>
      <!-- <v-row>
        <v-overlay :opacity="0.5" z-index="1000" :value="alert">
          <v-alert color="red" dark transition="scale-transition">存檔中請稍後...</v-alert>
        </v-overlay>
      </v-row>-->
      <v-row>
        <v-col cols="6">
          <v-text-field label="關鍵字搜尋..." v-model="searchword"></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-btn color="info" @click="searchFun">搜尋</v-btn>
        </v-col>
      </v-row>
    </v-container>
      <img src="@/assets/loading.gif" height="40px" v-show="this.$store.state.loading"/>
      <v-tree ref="tree1" :data="treeData" :tpl="tpl" :draggable="true" @drag-node-end="MyDrag" />
      <v-btn color="info" @click="saveCurrentState" v-show="!this.$store.state.loading">儲存階層收合狀態</v-btn>
    <v-snackbar v-model="snackbar" :timeout="timeout">
      {{ databasemessage }}
      <v-btn dark text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import { dbFirestore } from "@/fb";
import com_fun from "../utils/function";
export default {
  name: "project",
  data() {
    return {
      alert: false,

      snackbar: false,
      timeout: 2000,
      databasemessage: "",

      searchword: "",
      treeData: []
    };
  },
  components: {},
  created() {
    this.$store.commit("setLoading", true);
    dbFirestore
      .collection("TLFMCD")
      .get()
      .then(querySnapshot => {
        let TLFM_data = [];
        querySnapshot.forEach(doc => {
          TLFM_data.push(doc.data());
        });
        this.treeData = com_fun.arrayToJson(TLFM_data);
        this.$store.commit("setLoading", false);
      });

    //監聽資料庫變化
    dbFirestore.collection("TLFMCD").onSnapshot(res => {
      const changes = res.docChanges();
      changes.forEach(change => {
        if (change.type === "added") {
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
  mounted() {},
  watch: {
    search(val) {
      val && val !== this.select && this.querySelections(val);
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
                  .collection("TLFMCD")
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
        expanded: true
        // depart:"", 不再此處設定初值，在程式中判定物件屬性是否存在
        // enddate: new Date(),
        // startdate: {},
        // status: "",
        // process: [],
        // remaindays: 0,
      };
      dbFirestore
        .collection("TLFMCD")
        .doc(timestamp)
        .set(data)
        .then(function() {
          // console.log("資料庫儲存成功！", timestamp, data);
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
      if (typeof node.children == "object") {
        if (node.children.length >= 1) {
          // console.log(node, node.children);
          this.$confirm("包含子項目，不能刪除！請先刪除子項目。");
        } else {
          this.$confirm(
            "刪除後無法復原，<br>確定要刪除【" + node.title + "】嗎？",
            { color: "red", title: "嚴重警告" }
          ).then(res => {
            if (res) {
              // console.log(node.id,"parent->",parent,"index->",index);
              dbFirestore
                .collection("TLFMCD")
                .doc(node.id)
                .delete()
                .then(function() {
                  // console.log("資料刪除成功！", node.id);
                  vm.$refs.tree1.delNode(node, parent, index);
                })
                .catch(function(error) {
                  console.error("Error removing document: ", error);
                });
            }
          });
        }
      } else {
        this.$confirm(
          "刪除後無法復原，<br>確定要刪除【" + node.title + "】嗎？",
          {
            color: "red",
            title: "嚴重警告"
          }
        ).then(res => {
          if (res) {
            // console.log(node.id, "parent->", parent, "index->", index);
            dbFirestore
              .collection("TLFMCD")
              .doc(node.id)
              .delete()
              .then(function() {
                // console.log("資料刪除成功！", node.id);
                vm.$refs.tree1.delNode(node, parent, index);
              })
              .catch(function(error) {
                console.error("Error removing document: ", error);
              });
          }
        });
      }
    },
    //===========搬移資料======================
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
            .collection("TLFMCD")
            .doc(Node.dragNode.id)
            .update({ pid: Node.targetNode.id })
            .then(function() {
              window.location.reload();
              // console.log("資料存檔完成！", Node.targetNode.title);
            })
            .catch(function(error) {
              // console.error("資料存檔失敗！", error);
            });
        } else {
          let vm = this;
          dbFirestore
            .collection("TLFMCD")
            .get()
            .then(function(querySnapshot) {
              let TLFM_data = [];
              querySnapshot.forEach(function(doc) {
                TLFM_data.push(doc.data());
              });
              vm.treeData = com_fun.arrayToJson(TLFM_data);
              // window.location.reload()
            });
        }
        // window.location.reload()
      });
    },

    saveCurrentState() {
      // console.log(this.$refs.tree1.getNodes({}))
      let arrayRecord = this.$refs.tree1.getNodes({});
      this.snackbar = true;
      this.databasemessage = "存檔中，請稍後...";
      // this.timeout = 10000;

      arrayRecord.forEach(item => {
        dbFirestore
          .collection("TLFMCD")
          .doc(item.id)
          .get()
          .then(doc => {
            if (doc.data().expanded !== item.expanded) {
              // console.log(doc.data().expanded,item.expanded)
              dbFirestore
                .collection("TLFMCD")
                .doc(item.id)
                .update({ expanded: item.expanded })
                .then(() => {
                  this.snackbar = false;
                });
            } else {
              this.snackbar = true;
            }
          });
      });
      this.snackbar = false;
    }
  }
};
</script>

<style>
</style>
