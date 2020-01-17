<template>
  <div class="text-left">
    <v-treeview shaped hoverable activatable :items="treeCombine"></v-treeview>
  </div>
</template>

<script>
import { dbFirestore, databaseName } from "@/fb";
import com_fun from "../utils/function";

export default {
  name: "",
  data() {
    return {
      treeCombine: []
    };
  },
  components: {},
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
  methods: {}
};
</script>

<style>
</style>
