import axios from 'axios'

axios.defaults.baseURL = process.env.VUE_APP_API || 'http://localhost:3000/'
axios.defaults.headers.post['Content-Type'] = 'application/json'
const ApiService = {
  register (params) {
    return axios.post('register', params)
  },
  login (params) {
    return axios.post('login', params)
  },
  createRoom (params) {
    return axios.post('room/create', params)
  },
  join (params) {
    return axios.post('room/join', params)
  }
}

export default ApiService
