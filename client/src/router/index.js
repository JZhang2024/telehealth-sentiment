import AboutView from '@/views/AboutView.vue';
import HomeView from '@/views/HomeView.vue';
import JoinView from '@/views/JoinView.vue';
import RoomView from '@/views/RoomView.vue';
import ContactView from '@/views/ContactView.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  // the history mode determines how vue router interacts with the url.
  // createWebHistory() simulates the default browser behavior of changing
  // the path of the url based on the current document.
  // import.meta.env.BASE_URL is a vite feature that you don't need to worry about
  // and can safely use. it refers to the current path to the directory being
  // served by vite, which in this project is always the same directory
  // (and therefore import.meta.env.BASE_URL is '/')
  history: createWebHistory(import.meta.env.BASE_URL),

  // each entry to this routes array has a path (what goes in the URL to access
  // this page), a name (check out components/AppHeader.vue for how this is used)
  // and, most importantly, the component that should be rendered for the view
  routes: [
    {
      path: '/',
      component: HomeView
    },
    {
      path: '/join',
      component: JoinView
    },
    {
      path: '/room/:channelName',
      component: RoomView
    },
    {
      path: '/about',
      component: AboutView
    },
    {
      path: '/contact',
      component: ContactView
    }
  ]
});

export default router;
