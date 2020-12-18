<template>
  <div class="home">
      <p class="welcome-msg">Welcome to Secret Santa</p>
      <div class="santa">
        <img src="../assets/secret-santa.png">
      </div>
      <form @submit.prevent="login()" class="form">
        <fieldset class="form-group">
          <input class="form-control" type="text" v-model="username" placeholder="Username"/>
        </fieldset>
        <fieldset class="form-group">
          <input class="form-control" type="password" v-model="password" placeholder="Password"/>
        </fieldset>
        <div v-if="error" class="invalid-username">
          The username or password is incorrect.
        </div>
        <button class="btn">Login</button>
      </form>
      <div class="register">
        Don't have an account yet?
        <router-link
          :to="{ name: 'Registration' }"
          class="sign-up"
        >Sign up</router-link>
      </div>
  </div>
</template>

<script>
import ApiService from '@/api/api.service'
export default {
  name: 'Home',
  data () {
    return {
      username: '',
      submittedUsername: '',
      password: '',
      error: false
    }
  },
  watch: {
    username: function (_, __) {
      if (this.error && this.submittedUsername === this.username) {
        this.submittedUsername = ''
      }
      this.error = false
    },
    password: function (_, __) {
      this.error = false
    }
  },
  async mounted () {
    await this.loadFromStorage()
  },
  methods: {
    saveData (data) {
      let parsed = JSON.stringify(data)
      let encrypted = btoa(unescape(encodeURIComponent(parsed)))
      localStorage.setItem('data', encrypted)
    },
    async loadFromStorage () {
      let encrypted = localStorage.getItem('data')
      if (encrypted) {
        encrypted = encrypted.replace(/\s/g, '')
        let decrypted = decodeURIComponent(escape(atob(encrypted)))
        let data = JSON.parse(decrypted)
        this.username = data.username
        this.password = data.password
        await this.login()
        this.error = false
      }
    },
    async login () {
      if (!this.username || !this.password) return
      const data = {
        username: this.username,
        password: this.password
      }
      let res = await ApiService.login(data)
      if (res.data && res.data.result) {
        data.user = res.data.user
        this.saveData(data)
        this.$router.push({
          name: 'Profile',
          params: {
            usernameProp: res.data.user.username,
            emailProp: res.data.user.email,
            avatarProp: res.data.user.avatar,
            roomsProp: res.data.user.rooms
          }
        })
      } else {
        this.error = true
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.home {
  position: fixed;
  width: 100%;
  height: 100%;
  background: url("../assets/snowing.gif") no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  align-items: center;
}

.welcome-msg {
  align-items: center;
  font-size: 2rem;
  padding: 1rem;
  margin: 0px;
  margin-top: 2rem;
}

.santa {
  align-items: center;
  width: 100%;
}

img {
  padding: 1rem;
  max-width: 20%;
  max-height: 20%;
}

.v-btn:not(.v-btn--round).v-size--default {
  padding: 1rem;
}

.login {
  padding: 1rem;
  font-size: 1rem;
}

.register {
  margin: 1rem 0rem;
  font-size: 1rem;
}

.sign-up {
  padding: 0rem;
}

.form {
  margin: 1rem;
}

.form-group {
  border: none;
}

.form-control {
  border: none;
  background-color: white;
  border-bottom: 2px solid darkslategray;
  padding: 12px 20px;
  margin: 5px;
  box-sizing: border-box;
  border-radius: 5px;
}

.form-control:focus {
  background-color: lightblue;
}

.btn {
  background-color: cornflowerblue;
  border: none;
  border-bottom: 2px solid darkblue;
  border-radius: 5px;
  color: white;
  padding: 16px 32px;
  text-decoration: none;
  margin: 20px 2px;
  cursor: pointer;
}

.invalid-username {
  color: red;
}

@media screen and (max-width: 601px) {
  .welcome-msg {
    font-size: 5vw;
  }

  img {
    max-width: 50%;
    max-height: 50%;
  }

  .register {
    font-size: 3vw;
  }

  .v-btn:not(.v-btn--round).v-size--default {
    padding: 0 3vw;
  }
}

@media screen and (min-width: 601px) and (max-width: 801px) {
  .register {
    font-size: 1.5vw;
  }

  .v-btn:not(.v-btn--round).v-size--default {
    padding: 0 1.5vw;
  }
}

@media screen and (min-width: 801px) and (max-width: 1080px) {
  .register {
    font-size: 2vw;
  }

  .v-btn:not(.v-btn--round).v-size--default {
    padding: 0 2vw;
  }
}

</style>
