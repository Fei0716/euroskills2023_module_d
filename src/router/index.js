import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Chatterblast from '../views/Chatterblast.vue'
import Dreamweaver from '../views/Dreamweaver.vue'
import Mindreader from '../views/Mindreader.vue'

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHistory('euroskills2023_module_d'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/chatterblast',
      name: 'chatterblast',
      component: Chatterblast,
    },
    {
      path: '/dreamweaver',
      name: 'dreamweaver',
      component: Dreamweaver,
    },
    {
      path: '/mindreader',
      name: 'mindreader',
      component: Mindreader,
    },
    //to redirect all invalid route back to the home page
    {
      path: '/:catchAll(.*)',
      redirect: '/'
    }
  ]
})

export default router
