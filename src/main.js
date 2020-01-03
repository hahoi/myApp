import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import store from './store'
import router from './router'
import { dbFirestore, dbAuth, dbFunctions } from "@/fb";
import { powerRouter } from './router'

import util from './utils/util.js'
Vue.prototype.$util = util


import VuetifyConfirm from 'vuetify-confirm'
Vue.use(VuetifyConfirm, { vuetify })

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
  let vm = this
  if (store.getters.userId) { //userid不存在，需login
    if (store.getters.newRouter.length !== 0) {
      // console.log("有store Router", store.getters.newRouter)
      next()
    } else {//有使用者，但沒有store Router
      if (!store.getters.user) { //沒有使用者資料，要重load
        // console.log("沒有使用者資料，要重load")

        dbFirestore
          .collection("MyAppUsers")
          .where("authId", "==", store.getters.userId)
          .get()
          .then(querySnapshot => {
            let user = null
            querySnapshot.forEach(doc => {
              user = {
                authId: doc.data().authId,
                email: doc.data().email,
                department: doc.data().department,
                name: doc.data().name,
                alias: doc.data().alias,
                role: doc.data().role,
                state: doc.data().state,
                memo: doc.data().memo
              };
            });
            //存入vuex store
            store.dispatch("loginSet", user)
              .then(() => {
                console.log("重新讀取使用者資料成功");
              })
              .catch(() => {
                console.log("重新讀取使用者資料失敗");
              });
            let newrouter = powerRouter //路由換成主要功能的路由 
            let newchildren = powerRouter[0].children.filter(route => {
              if (route.meta) {
                //檢查 route.mata.role 是否存在 使用者權限陣列 store.getters.role 中
                if (store.getters.user.role.indexOf(route.meta.role) === -1) {
                  return false
                } else {
                  return true
                }
              }
            })
            // console.log("重新讀取使用者資料，並儲存newrouter")
            newrouter[0].children = newchildren //使用者權限的路由
            router.addRoutes(newrouter) //添加动态路由
            store.dispatch('saveRoles', newrouter).then((res) => { //儲存到 VUEX store.getters.newrouter
              // console.log("",res)
              next({ ...to })
            })
          });
      } else { //有使用者，但沒有store Router，重新儲存newrouter
        // console.log("有使用者資料，但沒有store Router，剛login，重新儲存newrouter")
        let newrouter =  powerRouter //路由換成主要功能的路由 
        let newchildren = powerRouter[0].children.filter(route => {
          if (route.meta) {
            //檢查 route.mata.role 是否存在 使用者權限陣列 store.getters.role 中
            // console.log("store.getters.user.role",store.getters.user.role)
            // console.log("route.meta.role",route.meta.role)
            if (store.getters.user.role.indexOf(route.meta.role) === -1) {
              return false
            } else {
              return true
            }
          }
        })
        newrouter[0].children = newchildren //使用者權限的路由
        router.addRoutes(newrouter) //添加动态路由
        store.dispatch('saveRoles', newrouter).then((res) => { //儲存到 VUEX store.getters.newrouter
          // console.log("",res)
          next({ ...to }) //此部分為callback function，依續會先跳轉到23列執行，此部分再回傳，可能太晚，故出現錯誤，原因待查
        })
      }
    }
  } else {//未豋入，沒有使用者資料
    // console.log("尚未登入，沒有使用者資料")
    if (to.path == '/login' || to.path == '/signup') {
      next()
    } else { // 在根目錄 / 時或沒認證的網頁，強迫導到login
      next('/login')
    }
  }
});





new Vue({
  vuetify,
  store,
  router,
  render: h => h(App)
}).$mount('#app')
