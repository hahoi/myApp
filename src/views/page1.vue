<template>
  <div>
    <h1>這是測試第ㄧ頁</h1>
    <v-btn small @click="$router.push({ path: '/page2' })">第二頁</v-btn>
    <v-btn small @click="$router.go(-1)">返回</v-btn>
  </div>
</template>

<script>
import { dbFirestore, dbStorage, databaseName } from "@/fb";
  export default {
    name: "",
    data () {
      return {
        TLFM_data:[],
      }
    },
    components: {

    },
    created() {
    dbFirestore
      .collection(databaseName)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          this.TLFM_data.push(doc.data());
        });
      })
      .then(()=>{
        this.TLFM_data.forEach(item=>{
          console.log(item)
        })
        
      })
      
    },
    mounted() {



    },
    watch: {

    },
    computed: {

    },
    methods: {

    }
  }
</script>

<style>

 
</style>
