import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import CheatRoom from '../views/CheatRoom.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  }, {
    path: '/CheatRoom',
    name: 'CheatRoom',
    component: CheatRoom,
    props: true
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
