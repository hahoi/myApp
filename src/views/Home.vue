<template>
  <div>
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12"  class="text-center">
            <h3 class="headline text-center">最新訊息</h3>
            <div v-for="(msg,k) in message">
              <v-divider class="my-3"></v-divider>
              <div class="title mb-3" v-html="msg.title"></div>
              <div class="subtitle-1 mb-3" v-html="msg.subtitle"></div>
              <div class="body-2 mb-3" v-html="msg.explanation"></div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-content>

  </div>
</template>

<script>
import { dbFirestore } from "@/fb";
  export default {
    name: "",
    data () {
      return {
          message: [],
      }
    },
    components: {

    },
    created() {
        dbFirestore
          .collection("SettingData").doc("Messages")
          .get()
          .then(doc => {
            this.message = [...doc.data().message]
            this.message.sort(function(a, b) {
              return a.order - b.order //a-b 小的排在前面，字串數字排序
                                       //b-a 大的排前面
            })
          });

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
