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
  checkUsername (username) {
    return axios.get(`register?username=${username}`)
  }
}

export default ApiService
