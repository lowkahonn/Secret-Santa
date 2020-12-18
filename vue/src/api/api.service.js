import axios from 'axios'

axios.defaults.baseURL = 'https://ko-stan-secret-santa.herokuapp.com'
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
  },
  updateWish (params) {
    return axios.post('room/updateWish', params)
  }
}

export default ApiService
