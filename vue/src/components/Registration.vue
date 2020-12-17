<template>
  <div class="register">
    <p class="welcome-msg">Welcome to Secret Santa</p>
    <v-row align="center" justify="center">
      <button class="arrow-btn" @click="decreaseIndex()">
        <v-icon size="50">mdi-menu-left</v-icon>
      </button>
      <img class="avatar" :src="avatars[avatarIndex]" v-bind:alt="avatars[0]">
      <button class="arrow-btn" @click="increaseIndex()">
        <v-icon size="50">mdi-menu-right</v-icon>
      </button>
    </v-row>
    <p class="selection-msg">Choose your avatar!</p>
    <form @submit.prevent="onSubmit()" class="form">
      <fieldset class="form-group">
        <input class="form-control" type="text" v-model="username" placeholder="Username"/>
      </fieldset>
      <fieldset class="form-group">
        <input class="form-control" type="text" v-model="email" placeholder="Email"/>
      </fieldset>
      <fieldset class="form-group">
        <input class="form-control" type="password" v-model="password" placeholder="Password"/>
      </fieldset>
      <button class="btn">Sign up</button>
    </form>
  </div>
</template>

<script>
import ApiService from '@/api/api.service'
export default {
  name: 'Registration',
  data () {
    return {
      username: '',
      email: '',
      password: '',
      avatarIndex: 0,
      avatars: []
    }
  },
  mounted () {
    this.importAll(require.context('../assets/avatars/', false, /\.png$/))
    this.avatars.sort()
  },
  methods: {
    importAll (avatars) {
      avatars.keys().forEach(key => (this.avatars.push(avatars(key))))
      this.avatars.sort()
    },
    decreaseIndex () {
      var index = (this.avatarIndex - 1)
      this.avatarIndex = index < 0 ? this.avatars.length - 1 : index
    },
    increaseIndex () {
      this.avatarIndex = (this.avatarIndex + 1) % this.avatars.length
    },
    getAvatarName () {
      if (this.avatarIndex < 10) {
        return `avatar-0${this.avatarIndex}.png`
      }
      return `avatar-${this.avatarIndex}.png`
    },
    saveData (data) {
      let parsed = JSON.stringify(data)
      let encrypted = btoa(parsed)
      localStorage.setItem('data', encrypted)
    },
    async onSubmit () {
      const data = {
        username: this.username,
        email: this.email,
        password: this.password,
        avatar: this.getAvatarName()
      }
      const res = await ApiService.register(data)
      if (res.data && res.data.result) {
        this.saveData(data)
        this.$router.push({
          name: 'Profile',
          params: {
            usernameProp: this.username,
            emailProp: this.email,
            avatarProp: data.avatar
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.register {
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
  padding: 2rem;
  margin: 0px;
  margin-top: 2rem;
}

.selection-msg {
  font-weight: bold;
  font-size: 2rem;
}

.form {
  margin: 50px 50px;
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

.avatar-selection {
  background-color: wheat;
  margin: 20px;
}

.avatar{
  width: 200px;
}

.arrow-btn{
  background-color: white;
  border: none;
  border-radius: 10px;
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

@media screen and (max-width: 601px) {
  .welcome-msg {
    font-size: 5vw;
  }

  .avatar {
    max-width: 50%;
    max-height: 50%;
  }

  .selection-msg {
    font-size: 5vw;
  }

  .form {
    margin: 10px 10px;
  }
  .form-control {
    font-size: 4vw;
  }

  .arrow-btn{
    transform: scale(0.8);
  }

  .btn {
    font-size: 4vw;
  }
}
</style>
