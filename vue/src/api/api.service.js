import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios)
Vue.axios.defaults.baseURL = 'http://localhost:3000/'
const ApiService = {
  register (params) {
    return Vue.axios.post('register', params)
  }
}

export default ApiService
