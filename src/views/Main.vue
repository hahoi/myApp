<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <template v-for="(item, i) in newrouter[0].children">
          <v-list-item link :key="i" :to="item.path">
            <v-list-item-action>
              <v-icon>{{ item.meta.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                <span class="title">{{item.meta.title}}</span>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider dark class="my-3" v-if="item.meta.divider"></v-divider>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="indigo" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>{{$store.state.ApplicationText}}</v-toolbar-title>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-spacer></v-spacer>
      <v-menu bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list class="text-left">
          <v-list-item>
            <v-list-item-title>
              <span class="blue--text">{{username}}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>
              <span class="body-2" @click="resetPassword">密碼重設</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout()">
            <v-list-item-title>退出</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <main>
      <v-content>
        <router-view></router-view>
      </v-content>
    </main>
    <v-footer color="indigo" app>
      <span class="white--text">{{$store.state.footerText}}</span>
    </v-footer>
  </v-app>
</template>

<script>
// import store from "../store";
import { powerRouter } from "../router";
import { dbFirestore, dbAuth } from "@/fb";
export default {
  props: {
    source: String
  },

  data: () => ({
    drawer: false
  }),
  created() {
    if(this.$store.getters.ApplicationText == ""){
      this.loadSysPara()
    }
  },
  mounted() {
    if (powerRouter[0].children.length == 0) {
      let tel = this.$store.getters.admTelephone
      console.log(tel)
      this.$confirm(`功能權限尚未設定，請電洽系統管理員！(${tel})`, {
        title: "警告",
        buttonFalseText: "",
        buttonTrueText: "好"
      });
    }
  },
  computed: {
    newrouter() {
      return this.$store.getters.newRouter;
    },
    username() {
      if (this.$store.getters.user !== null)
        return this.$store.getters.user.name;
      else return "";
    }
  },
  methods: {
    loadSysPara(){
    dbFirestore
      .collection("SettingData")
      .doc("system") 
      .get()
      .then(doc => {
        let temp = doc.data();
        this.$store.commit("setApplicationTexte", temp.ApplicationText);
        this.$store.commit("setfooterText", temp.footerText);
        this.$store.commit("setadmTelephone", temp.admTelephone);
        this.$store.commit("setprojectEndDate", temp.projectEndDate);
        this.$store.commit("setLevelOneID", temp.LevelOneID);
      })
      // .then(()=>{
      //         console.log(this.$store.getters.ApplicationText)
      // });
    },
    logout() {
      this.$store
        .dispatch("logout")
        .then(() => {
          this.$router.push({ path: "/login" });
        })
        .catch(err => {
          throw new Error(error);
        });
    },
    resetPassword() {
      this.$dialog["warning"]({
        title: "警告",
        text: "確定要發送重設密碼電子郵件嗎？",
        persistent: false
      }).then(res => {
        if (res) {
          const emailAddress = this.$store.getters.user.email;
          dbAuth
            .sendPasswordResetEmail(emailAddress)
            .then(function() {
              // Email sent.
            })
            .catch(function(error) {
              // An error happened.
            });
        }
      });
    }
  }
};
</script>