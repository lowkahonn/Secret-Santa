<template>
  <div class="profile">
    <p class="header-msg">Login successfully! <br /></p>
    <div class="profile-pic">
      <v-avatar size="50%">
        <img :src=avatar>
      </v-avatar>
      <p class="username">{{ username }}</p>
    </div>
    <div v-if="!joinRoom">
      <v-btn :to="{
        name: 'CreateRoom',
        params: {
          usernameProp: username,
          emailProp: email
        }}"
        class="btn-group"
        color="primary"
        rounded
      >Organize a Party</v-btn>
    </div>
    <div v-else>
      <fieldset class="form-group">
        <input class="form-control" type="text" v-model="invitationCode" placeholder="Invitation code"/>
      </fieldset>
    </div>
    <div v-if="!joinRoom">
      <v-btn @click="toggleJoinParty()" class="btn-group" color="primary" rounded>Join a Party</v-btn>
    </div>
    <div v-else class="join">
      <v-btn @click="toggleJoinParty()" class="btn-group" color="primary" rounded>Back</v-btn>
      <v-btn @click="join()" class="btn-group" color="primary" rounded>Join</v-btn>
    </div>
  </div>
</template>

<script>
import ApiService from '@/api/api.service'
export default {
  name: 'Profile',
  props: ['usernameProp', 'emailProp', 'roomsProp', 'avatarProp'],
  data () {
    return {
      username: this.usernameProp,
      email: this.emailProp,
      avatar: '',
      joinedRooms: this.roomsProp,
      invitationCode: '',
      joinRoom: false,
      joinRoomError: false
    }
  },
  async mounted () {
    if (this.avatarProp) {
      this.avatar = require(`../assets/avatars/${this.avatarProp}`)
    } else {
      await this.loadFromStorage()
    }
  },
  methods: {
    saveData (roomInfo) {
      let parsed = JSON.stringify(roomInfo)
      let encrypted = btoa(parsed)
      localStorage.setItem('roomInfo', encrypted)
    },
    async loadFromStorage () {
      let encrypted = localStorage.getItem('data')
      if (encrypted) {
        let decrypted = atob(encrypted)
        let data = JSON.parse(decrypted)
        await this.login(data)
      }
    },
    async login (data) {
      let res = await ApiService.login({
        username: data.username,
        password: data.password
      })
      if (res.data && res.data.result) {
        this.username = res.data.user.username
        this.email = res.data.user.email
        this.joinedRooms = res.data.user.rooms
        this.avatar = require(`../assets/avatars/${res.data.user.avatar}`)
        let parsed = JSON.stringify(res.data.user)
        let encrypted = btoa(parsed)
        localStorage.save('data', encrypted)
      }
    },
    toggleJoinParty () {
      this.joinRoom = !this.joinRoom
    },
    async join () {
      let data = {
        invitationCode: this.invitationCode,
        username: this.username,
        email: this.email
      }
      let res = await ApiService.join(data)
      if (res.data && res.data.result) {
        this.saveData(res.data.roomInfo)
        this.$router.push({
          name: 'Room',
          params: {
            roomInfoProp: res.data.roomInfo
          }
        })
      } else {
        this.joinRoomError = true
      }
    }
  },
  watch: {
    wishlist (val) {
      this.nonce++
      if (val.length > this.maxItem) {
        this.$nextTick(() => this.wishlist.splice(0, 1))
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.profile {
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

.header-msg {
  font-weight: bold;
  font-size: 1.5rem;
  margin-top: 2rem;
}

.input {
  margin-left: 50px;
  margin-right: 50px;
}

.wishlist {
  margin-left: 50px;
  margin-right: 50px;
}

.profile-pic {
  align-items: center;
  margin-top: 1.5rem;
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

.username {
  text-align: center;
  font-weight: bold;
  font-size: 2rem;
}

.join {
  display: inline-block;
  align-items: center;
}

.btn-group {
  margin: 10px;
}

@media screen and (max-width: 551px) {
  .header-msg {
    font-size: 1rem;
  }

  .btn-group {
    font-size: 0.7rem;
  }
}

@media screen and (min-width: 551px) and (max-width: 801px) {
  .header-msg {
    font-size: 2rem;
  }
}

@media screen and (min-width: 801px) and (max-width: 1080px) {
  .header-msg {
    font-size: 2.5rem;
  }
}
</style>
