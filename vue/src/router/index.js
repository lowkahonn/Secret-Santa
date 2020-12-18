import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/components/Home'),
      props: true
    },
    {
      path: '/register',
      name: 'Registration',
      component: () => import('@/components/Registration'),
      props: true
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/components/Profile'),
      props: true
    },
    {
      path: '/create-room',
      name: 'CreateRoom',
      component: () => import('@/components/CreateRoom'),
      props: true
    },
    {
      path: '/room',
      name: 'Room',
      component: () => import('@/components/Room'),
      props: true
    }
  ]
})
