import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
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
    }
  ]
})
