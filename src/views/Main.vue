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
              <v-list-item-title>{{item.meta.title}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="indigo" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>Application</v-toolbar-title>
    </v-app-bar>

    <main>
      <v-content>
        <router-view></router-view>
      </v-content>
    </main>
    <v-footer color="indigo" app>
      <span class="white--text">&copy; 2019</span>
    </v-footer>
  </v-app>
</template>

<script>
import store from "../store";
export default {
  props: {
    source: String
  },

  data: () => ({
    drawer: null
  }),
  computed: {
    newrouter() {
      return store.getters.newRouter;
    }
  }
};
</script>