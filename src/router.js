import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export const powerRouter = [
  {
    path: '/',
    hidden: false,
    name: 'Main',
    component: () => import('@/views/Main'),
    meta: { title: 'Main'},
    children: [

      {
        path: '/Users',
        name: 'Users',
        component: () => import('@/views/Users'),
      },
      {
        path: '/page1',
        name: 'page1',
        component: () => import('@/views/page1'),
        meta: { title: '第一頁', role: 'G'}
      },
      {
        path: '/page2',
        name: 'page2',
        component: () => import('@/views/page2'),
        meta: { title: '第二頁', role: 'H'}
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

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
