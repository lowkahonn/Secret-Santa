import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:3000/'
axios.defaults.headers.post['Content-Type'] = 'application/json'
const ApiService = {
  register (params) {
    return axios.post('register', params)
  },
  login (params) {
    return axios.post('login', params)
  }
}

export default ApiService
