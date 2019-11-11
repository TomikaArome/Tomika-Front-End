// Dependencies
import Vue from 'vue'

// Components
import App from './components/tomika-app.vue'

// Store
import store from './store/store'

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App)
}).$mount('#app');
