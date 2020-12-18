<template>
  <div class="profile">
    <p class="header-msg">Login successfully! <br /></p>
    <div class="profile-pic">
      <v-avatar color="white" :size="avatarSize">
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
            <v-btn @click="join()" class="btn-group" color="primary" rounded>Join</v-btn>
      <v-btn @click="toggleJoinParty()" class="btn-group" color="primary" rounded>Back</v-btn>
      <br/>
      <v-btn @click="toggleShowRoom()" class="btn-group" color="primary" rounded>Join My Rooms</v-btn>
    </div>
    <div v-if="!joinRoom">
      <v-btn @click="logOut()" class="btn-group" color="primary darken-1" rounded>Log out</v-btn>
    </div>
    <div v-if="showRoom" class="overlay">
      <v-list-item-group v-model="selectedIndex" class="table">
        <v-list-item
          v-for="(room, index) in joinedRooms"
          :key="index"
          active-class="room-name-active"
          class="room-name"
        >
          <v-spacer></v-spacer>
          <v-avatar><img :src="getImgURL(room.background)"></v-avatar>
          <v-spacer></v-spacer>
          <h3>{{room.roomName}}</h3>
          <v-spacer></v-spacer>
        </v-list-item>
        <v-btn @click="joinSelectedRoom()" class="btn-group">Join</v-btn>
        <v-btn @click="toggleShowRoom()" class="btn-group">Cancel</v-btn>
      </v-list-item-group>
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
      avatarSize: 150,
      joinedRooms: this.roomsProp,
      invitationCode: '',
      selectedIndex: null,
      joinRoom: false,
      showRoom: false,
      joinRoomError: false
    }
  },
  async mounted () {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
    })
    if (this.avatarProp) {
      this.avatar = require(`../assets/avatars/${this.avatarProp}`)
    } else {
      await this.loadFromStorage()
    }
  },
  methods: {
    saveData (roomInfo) {
      let parsed = JSON.stringify(roomInfo)
      let encrypted = btoa(unescape(encodeURIComponent(parsed)))
      localStorage.setItem('roomInfo', encrypted)
    },
    async loadFromStorage () {
      let encrypted = localStorage.getItem('data')
      if (!encrypted) {
        this.$router.push('Home')
      } else {
        encrypted = encrypted.replace(/\s/g, '')
        let decrypted = decodeURIComponent(escape(atob(encrypted)))
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
        let encrypted = btoa(unescape(encodeURIComponent(parsed)))
        localStorage.setItem('data', encrypted)
      }
    },
    toggleJoinParty () {
      this.joinRoom = !this.joinRoom
    },
    toggleShowRoom () {
      this.showRoom = !this.showRoom
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
            usernameProp: this.username,
            roomInfoProp: res.data.roomInfo
          }
        })
      } else {
        this.joinRoomError = true
      }
    },
    getAvatarSize () {
      if (screen.width < 235) return 100
      else if (screen.width >= 235 && screen.width <= 382) return 150
      else if (screen.width >= 382 && screen.width <= 834) return 200
      else return 250
    },
    getImgURL (name) {
      return require('../assets/backgrounds/' + name)
    },
    onResize () {
      this.avatarSize = this.getAvatarSize()
    },
    joinSelectedRoom () {
      if (this.selectedIndex == null) return
      this.invitationCode = this.joinedRooms[this.selectedIndex].roomId
      this.join()
    },
    logOut () {
      localStorage.removeItem('data')
      this.$router.push({name: 'Home'})
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
  margin: 5px;
}

.overlay {
  background-color: rgba(0,0,0,0.5);
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  text-align: center;
  overflow-y: auto;
}

.table {
  background-color: rgb(224, 153, 106);
  border-radius: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  padding: 50px 50px;
  max-width: 500px;
  width: 80%;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  text-align: center;
}

.room-name {
  margin: 10px auto;
  max-width: 250px;
  border-radius: 10px;
  background-color: rgb(255, 186, 126);
  padding: 5px 5px;
}

.room-name-active {
  border: 3px dashed black;
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
