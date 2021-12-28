import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router'
import VueAudio from 'vue-audio-better'

import VueLivePreview from 'vue-live-preview'
import 'codemirror/lib/codemirror.css';



Vue.config.productionTip = false
Vue.use(ElementUI);

var VueCookie = require('vue-cookie');
Vue.use(VueCookie);

Vue.use(VueRouter)

Vue.use(VueAudio)

Vue.use(VueLivePreview, {
  theme: 'default',
  tabSize: 2,
  lineNumbers: true,
})


import store from './store/store'


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
