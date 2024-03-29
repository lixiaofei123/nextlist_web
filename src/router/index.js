import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/FileList.vue')
  },
  {
    path: '/preview',
    name: 'preview',
    component: () => import('../views/Preview.vue')
  },
  {
    path: '/install',
    name: 'install',
    component: () => import('../views/Install.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
