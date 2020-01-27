<template>
  <div>
    <h1>這是測試第二頁</h1>
    <v-btn small @click="$router.push({ path: '/DBstructureEX' })">第一頁</v-btn>
    <v-btn small @click="$router.go(-1)">返回</v-btn>
  </div>
</template>

<script>
  export default {
    name: "",
    data () {
      return {

      }
    },
    components: {

    },
    created() {

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
