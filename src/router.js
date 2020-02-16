import Vue from 'vue'
import VueRouter from 'vue-router'
import com_fun from "./utils/function";
import store from './store'
import { dbFirestore, databaseName } from "@/fb";

Vue.use(VueRouter)

export const powerRouter = [
  {
    path: '/',
    hidden: false,
    // name: 'Main',
    component: () => import('@/views/Main'),
    meta: { title: 'Main' },
    children: [
      {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home'),
        meta: { title: '首頁', role: '首頁', icon : 'home' , divider: true}
      },
      {
        path: '/Fillin2',
        // name: 'Fillin',
        component: () => import('@/views/Fillin2'),
        meta: { title: '進度填報', role: '進度填報', icon: "mdi-progress-check" }
      },
      {
        path: '/Calendars',
        // name: 'Fillin',
        component: () => import('@/views/Calendars'),
        meta: { title: '行事曆', role: '行事曆', icon: "mdi-calendar-range" }
      },
      // {
      //   path: '/Calendars1',
      //   // name: 'Fillin',
      //   component: () => import('@/views/Calendars1'),
      //   meta: { title: '行事曆1', role: '行事曆1', icon: "mdi-calendar-range" }
      // },
      {
        path: '/Pcalendar2',
        // name: 'Pcalendar2',
        component: () => import('@/views/Pcalendar2'),
        meta: { title: '期程檢核', role: '期程檢核', icon: "mdi-calendar-multiple-check" }
      },
      {
        path: '/Share',
        // name: 'Share',
        component: () => import('@/views/Share'),
        meta: { title: '合作分享', role: '合作分享', icon: "mdi-share-variant", divider: true}
      },
      {
        path: '/project2',
        // name: 'project',
        component: () => import('@/views/project2'),
        meta: { title: '專案管理', role: '專案管理', icon: "mdi-sitemap" }
      },
      {
        path: '/workItem2',
        // name: 'workItem',
        component: () => import('@/views/workItem2'),
        meta: { title: '工項管理', role: '工項管理', icon: "mdi-playlist-edit", divider: true }
      },
      {
        path: '/DBstructureEX',
        // name: 'DBstructureEX',
        component: () => import('@/views/DBstructureEX'),
        meta: { title: '資料庫結構練習', role: '資料庫結構練習', icon: "mdi-home" }
      },
      {
        path: '/MultiDatabase',
        // name: 'MultiDatabase',
        component: () => import('@/views/MultiDatabase'),
        meta: { title: '兩個資料庫', role: '兩個資料庫', icon: "mdi-contact-mail"  , divider: true}
      },
      {
        path: '/Message',
        // name: 'Message',
        component: () => import('@/views/Message'),
        meta: { title: '訊息管理', role: '訊息管理', icon: "mdi-message-alert-outline"  }
      },
      {
        path: '/Department',
        // name: 'department',
        component: () => import('@/views/Department'),
        meta: { title: '單位管理', role: '單位管理', icon: "mdi-account-group"  , divider: true}
      },

      {
        path: '/Users',
        // name: 'Users',
        component: () => import('@/views/Users'),
        meta: { title: '使用者管理', role: '使用者管理', icon: "mdi-account" }
      },

    ]
  }
]

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login'),
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/signup'),
  },
]

//給User.vue 讀取所有的權限用
export const copyPowerRouter = com_fun.deepCopy(powerRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router







/********** 權限路由 ********************/
router.beforeEach((to, from, next) => {
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
            let user = {}
            querySnapshot.forEach(doc => {
              user = {
                authId: doc.data().authId,
                email: doc.data().email,
                department: doc.data().department,
                name: doc.data().name,
                alias: doc.data().alias,
                role: doc.data().role,
                state: doc.data().state,
                memo: doc.data().memo,
                telephone: doc.data().telephone,
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

