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
    <img src="@/assets/loading.gif" height="40px" v-show="this.$store.state.loading" />
    <v-tree ref="tree1" :data="treeData" :tpl="tpl" />
    <v-container>
      <v-row>
        <v-dialog
          v-model="workDetailDialog"
          fullscreen
          hide-overlay
          transition="dialog-right-transition"
        >
          <v-card>
            <v-toolbar dark color="primary">
              <v-btn icon dark text class="mx-2" @click="workDetailDialog = false">
                <v-icon>mdi-backspace</v-icon>
                <span class="title">退回</span>
              </v-btn>
              <!-- <v-toolbar-title>退回</v-toolbar-title> -->
              <v-spacer></v-spacer>
              <v-btn icon dark text class="mx-2" @click="workDetailDialog = false">
                <v-icon>mdi-content-save-outline</v-icon>
                <span class="title">儲存</span>
              </v-btn>
            </v-toolbar>dfgdsgdsfgsdf
          </v-card>
        </v-dialog>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { dbFirestore } from "@/fb";
import com_fun from "../utils/function";
import moment from "moment";

export default {
  name: "",
  data() {
    return {
      workDetailDialog: false,
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
        let db_data = [];
        querySnapshot.forEach(doc => {
          db_data.push(doc.data());
        });
        this.treeData = com_fun.arrayToJson(db_data);
        this.$store.commit("setLoading", false);
      });
  },
  mounted() {},
  watch: {},
  computed: {},
  methods: {
    searchFun() {
      this.$refs.tree1.searchNodes(this.searchword);
    },
    tpl(...args) {
      let { 0: node, 1: ctx, 2: parent, 3: index } = args;
      let titleClass = node.selected
        ? "node-title node-selected"
        : "node-title";
      let vm = this;
      if (node.searched) titleClass += " node-searched";
      return (
        <span>
          <span
            class={titleClass}
            domPropsInnerHTML={node.title}
            onClick={() => {
              ctx.parent.nodeSelected(ctx.props.node);
              console.log(parent);
              let parentEndDate;
              if (parent === null) {
                parentEndDate = moment().format("YYYY-MM-DD");
              } else {
                parentEndDate = parent.enddate || moment().format("YYYY-MM-DD");
              }
              this.todo = {
                // id : node.id ,
                ptitle: node.title,
                parentEndDate,
                ...node
              };
              //   vm.dialogScreen = true;
              //   vm.component_ok = true;
              console.log(this.todo);
              this.workDetailDialog = true;
            }}
          />
        </span>
      );
    }
  }
};
</script>

<style>
</style>
