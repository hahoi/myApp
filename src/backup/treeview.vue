<template>
  <div class="text-left">
    <v-treeview shaped hoverable activatable :items="treeCombine" item-key="id">
    <template slot="label" slot-scope="{ item }">
      <a @click="CliceHandle(item)">{{ item.name }}</a>
    </template>

    </v-treeview>

    <!-- =========== 顯示詳細資料 ========= -->
    <v-container>
      <v-row>
        <v-dialog
          v-model="workDetailDialog"
          fullscreen
          hide-overlay
          transition="dialog-right-transition"
        >
          <v-toolbar dark color="primary">
            <v-btn dark text class="px-0" @click="workDetailDialog = false">
              <v-icon>mdi-backspace</v-icon>
              <span class="title">退回</span>
            </v-btn>
            <!-- <v-toolbar-title>退回</v-toolbar-title> -->
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card class="mx-auto" tile>
            <v-card-text class="px-3">
              <!-- 子組件渲染 -->
              <workdetailReadonly :propData="todo"></workdetailReadonly>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-row>
    </v-container>


  </div>
</template>

<script>
import workdetailReadonly from "../components/workdetailReadonly";


import { dbFirestore, databaseName } from "@/fb";
import com_fun from "../utils/function";

export default {
  name: "",
  data() {
    return {
      treeCombine: [],
      workDetailDialog: false,

      todo: {},
    };
  },
  components: {
    workdetailReadonly
  },
  created() {
    let vm = this;
    dbFirestore
      .collection(databaseName)
      .get()
      .then(function(querySnapshot) {
        let dbRecord = [];
        querySnapshot.forEach(function(doc) {
          // console.log( doc.data().title);
          let title = doc.data().title
          let node = { name: title, ...doc.data() };
          dbRecord.push(node);

          //   console.log(doc.id, " => ", doc.data());
        });
        vm.treeCombine = com_fun.arrayToJson(dbRecord);
      });
  },
  mounted() {},
  watch: {},
  computed: {},
  methods: {
    CliceHandle(item){
      this.workDetailDialog = true
      console.log(item)
      this.todo = {...item}
    }
  }
};
</script>

<style>
</style>
