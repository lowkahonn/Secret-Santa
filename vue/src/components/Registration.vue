<template>
  <div class="register">
    <p class="welcome-msg">Welcome to Secret Santa</p>
    <div class="profile-pic">
      <v-btn @click="decreaseIndex()" rounded elevation="2">
        <v-icon size="50">mdi-menu-left</v-icon>
      </v-btn>
      <v-avatar size="50%">
        <img :src="avatars[avatarIndex]" v-bind:alt="avatars[0]">
      </v-avatar>
      <v-btn @click="increaseIndex()" rounded elevation="2">
        <v-icon size="50">mdi-menu-right</v-icon>
      </v-btn>
    </div>
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
  },
  methods: {
    importAll (avatars) {
      avatars.keys().forEach(key => (this.avatars.push(avatars(key))))
    },
    decreaseIndex () {
      var index = (this.avatarIndex - 1)
      this.avatarIndex = index < 0 ? this.avatars.length - 1 : index
    },
    increaseIndex () {
      this.avatarIndex = (this.avatarIndex + 1) % this.avatars.length
    },
    async onSubmit () {
      const data = {
        username: this.username,
        email: this.email,
        password: this.password
      }
      const res = await ApiService.register(data)
      if (res.data && res.data.result) {
        this.$router.push({ name: 'Profile', params: { usernameProp: this.username } })
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

.profile-pic {
  align-items: center;
  margin: 20px;
}

.v-btn {
  width: 80px;
}

.v-icon {
  font-size: 25px;
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

  .selection-msg {
    font-size: 5vw;
  }

  .v-btn {
    width: 50px;
  }

  .form-control {
    font-size: 3vw;
  }

  .v-btn:not(.v-btn--round).v-size--default {
    padding: 0 3vw;
  }

  .btn {
    font-size: 3vw;
  }
}

@media screen and (min-width: 601px) and (max-width: 801px) {
  .v-btn {
    width: 60px;
  }
  .form-control {
    font-size: default;
  }
}

@media screen and (min-width: 801px) and (max-width: 1080px) {
  .v-btn {
    width: 80px;
  }

  .form-control {
    font-size: default;
  }
}
</style>
