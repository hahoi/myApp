import Vue from 'vue'
import VueRouter from 'vue-router'
import com_fun from "./utils/function";


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
        path: '/Users',
        // name: 'Users',
        component: () => import('@/views/Users'),
        meta: { title: '使用者管理', role: '使用者管理', icon: "mdi-account" }
      },
      {
        path: '/page1',
        // name: 'page1',
        component: () => import('@/views/page1'),
        meta: { title: '第一頁', role: '第一頁', icon: "mdi-home" }
      },
      {
        path: '/page2',
        // name: 'page2',
        component: () => import('@/views/page2'),
        meta: { title: '第二頁', role: '第二頁', icon: "mdi-contact-mail" }
      }

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
