import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/components/Home')
    },
    {
      path: '/register',
      name: 'Registration',
      component: () => import('@/components/Registration')
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/components/Profile')
    },
    {
      path: '/create-room',
      name: 'CreateRoom',
      component: () => import('@/components/CreateRoom')
    }
  ]
})
