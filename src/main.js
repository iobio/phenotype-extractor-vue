import Vue from 'vue'
import App from './App.vue'
// import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

import 'material-design-icons-iconfont/dist/material-design-icons.css'

//Filters
Vue.filter('to-firstCharacterUppercase', function(value){
  if (!value) return '';
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1);
});


//Bus event
export const bus = new Vue();


new Vue({
  // router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
