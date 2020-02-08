import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import store from './store'
import router from './router'

import util from './utils/util.js'
Vue.prototype.$util = util //綁定到VUE實例的屬性，可以 this.$util 呼叫使用，不必再import

import VuetifyConfirm from 'vuetify-confirm'
Vue.use(VuetifyConfirm, { vuetify }) //以 this.$confirm 呼叫

import VuetifyDialog from 'vuetify-dialog'
import 'vuetify-dialog/dist/vuetify-dialog.css'
Vue.use(VuetifyDialog, { //以 this.$dialog 呼叫
  context: {
    vuetify
  }
})

import 'vue-tree-halower/dist/halower-tree.min.css' // 你可以自定义树的样式
import VTree from 'vue-tree-halower'
Vue.use(VTree)


import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer'
Vue.use(Viewer)







Vue.config.productionTip = false

new Vue({
  vuetify,
  store,
  router,
  render: h => h(App)
}).$mount('#app')
