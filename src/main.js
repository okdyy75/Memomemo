import Vue from "vue";
import Vuetify from 'vuetify'
import App from "@/App.vue";
import router from "@/router/index";
import util from '@/utils/util'

import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.config.productionTip = false

var firebase = require('firebase');
firebase.initializeApp(process.env.FIREBASE_CONFIG);

Vue.use(Vuetify)
Vue.mixin(util)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
