<template>
  <div>
    <h1>這是測試第ㄧ頁</h1>
    <v-btn small @click="$router.push({ path: '/page2' })">第二頁</v-btn>
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
