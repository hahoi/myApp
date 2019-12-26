import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import store from './store'
import router from './router'
import { dbFirestore, dbAuth, dbFunctions } from "@/fb";


import util from './utils/util.js'
Vue.prototype.$util = util


import VuetifyConfirm from 'vuetify-confirm'
Vue.use(VuetifyConfirm, { vuetify })

Vue.config.productionTip = false




//先複製下來，之後設計時參考
router.beforeEach((to, from, next) => {
  let vm = this
  if (store.getters.user) { //判断使用者是否存在store中，內含role
    console.log(store.getters.user.role)
    console.log(store.getters.newrouter.length)
    next()
  } else if (store.getters.userId) { //userid存在sessionStorage中，重新讀取使用者資料及權限
    console.log(store.getters.userId)

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
      });





    next()
  } else {//未豋入，沒有使用者資料
    // console.log(to.path)
    if (to.path == '/login' || to.path == '/signup') {
      next()     
    } else { // 在根目錄 / 時或沒認證的網頁，強迫導到login
      next('/login')
    }
  }
});

//  if (role) { 繼續執行}
//  else if (uid){
//   有uid，依據uid得到使用者權限role

//  }else {沒有uid
//     /login
//  }      

// router.beforeEach((to, from, next) => {
//   if (store.getters.role) { //判断role 是否存在
//     if (store.getters.newrouter.length !== 0) {
//       next();
//     } else {
//       let newrouter
//       if (store.getters.role == 'X') {  //判断权限
//         newrouter = powerRouter
//       } else {
//         let newchildren = powerRouter[0].children.filter(route => {
//           if (route.meta) {
//             // console.log('route.meta.role',route.meta.role)
//             // console.log('store.getters.role',store.getters.role)
//             // console.log(common_fun.in_array(route.meta.role, store.getters.role))

//             // if (route.meta.role == store.getters.role) {

//             if ( common_fun.in_array(route.meta.role, store.getters.role) ) {
//               return true
//             }

//             return false
//           } else {
//             return true
//           }
//         });
//         newrouter = powerRouter
//         newrouter[0].children = newchildren
//       }
//       router.addRoutes(newrouter) //添加动态路由
//       store.dispatch('Roles', newrouter).then(res => {
//         next({ ...to })
//       }).catch(() => {

//       })
//     }
//   } else {
//     if (['/login'].indexOf(to.path) !== -1) {
//       next()
//     } else {
//       next('/login')
//     }
//   }







new Vue({
  vuetify,
  store,
  router,
  render: h => h(App)
}).$mount('#app')
