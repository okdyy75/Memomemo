import Vue from "vue";
import VueRouter from "vue-router";

import Index from '@/views/Index'
import Home from '@/views/Home'
import Memo from '@/views/Memo'
import Mypage_Memo from '@/views/Mypage_Memo'

Vue.use(VueRouter);
const vueRouter = new VueRouter({
  routes: [
    {
      path: '/',
      component: Index,
      children: [
        {
          path: "",
          name: "Home",
          component: Home
        },
        {
          path: "memos/:memoid",
          name: "Memo",
          component: Memo
        },
        {
          path: "mypage/memos/:memoid?",
          name: "Mypage",
          component: Mypage_Memo
        }
      ]
    }
  ]
});

export default vueRouter;
