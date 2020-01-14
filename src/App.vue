<template>
  <v-app>
    <transition mode="out-in">
      <router-view></router-view>
    </transition>
  </v-app>
</template>


<script>
export default {
  name: "App",
  computed: {},
  created() {
    let windowSize = this.$util.getWindowSize();
    // let pathArr = this.$route.path.split("/")
    if (windowSize.height > windowSize.width * 1.2) {
      // eslint-disable-next-line
      this.$store.commit('storeDevice',"Mobile")
      console.log("It's Mobile");
      // this.$router.push({ name: "mobileHome" }); /* "/views_mobile/Home" */
    }
    if (windowSize.height <= windowSize.width * 1.2) {
      // eslint-disable-next-line
      this.$store.commit('storeDevice',"PC")
      console.log("It's PC");
      // this.$router.push("/views/Home")
      // this.$router.push({name:'Home'});
    }
  }
};
</script>






<style >
</style>
