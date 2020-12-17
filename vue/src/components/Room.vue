<template>
  <div class="room" :style="{ 'background-image': 'url(' + background + ')'}">
    <div class="container">
      <img src="../assets/wood-sign.png" width="200">
      <div class="room-name"> {{roomName}}</div>
    </div>
    <p class="countdown">Time Remaining<br>{{ countdownDay }} days {{ countdownHour }} hours {{ countdownMin }} mins {{ countdownSec }} secs</p>
    <v-row justify="center">
      <v-slide-group
        v-model="selectedIndex"
        class="pa-4"
        center-active
        show-arrows
        prev-icon="mdi-arrow-left-drop-circle"
        next-icon="mdi-arrow-right-drop-circle"
      >
        <v-slide-item
          v-for="(m, index) in members"
          :key="index"
          active-class="border"
          v-slot="{ active, toggle }"
        >
          <div>
            <v-avatar
              :color="active ? 'primary' : 'grey lighten-1'"
              class="avatar"
              :size="avatarSize"
              @click="toggle"
            >
              <img
                :src="getImgURL(m.avatar)"
                :alt="getShortName(m.name)"
              >
            </v-avatar>
            <v-sheet
             :color="m.secretSanta == username ? 'red lighten-1' : 'lunarblush lighten-1'"
             class="avatar-name"
             @click="toggle"
            >
              {{getShortName(m.name)}}
            </v-sheet>
          </div>
        </v-slide-item>
      </v-slide-group>
    </v-row>
    <div class="info">
      <v-expand-transition>
        <v-sheet
          v-if="selectedIndex != null"
          height="50"
          rounded
        >
          <v-row
            class="fill-height"
            align="center"
            justify="center"
          >
            <h3 class="title">
              {{members[selectedIndex].name}}
            </h3>
            <h3 v-if="members[selectedIndex].secretSanta == username" class="title">
              &nbsp;want a {{members[selectedIndex].wish}} !
            </h3>
          </v-row>
        </v-sheet>
      </v-expand-transition>
    </div>
    <v-row align="center" justify="center" class="info-board">
      <v-col>
        <div class="col">
          <v-row justify="center" align="center">
            <img class="icon" src="../assets/budget.png">
            <h3>&nbsp; Budget: {{budget}}</h3>
          </v-row>
        </div>
        <div class="col">
          <button class="btn-group" @click="sendInvitation()">Invite friends</button>
        </div>
        <div class="col">
          <button @click="back()" class="btn-group">Back to Profile</button>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'Room',
  props: ['roomInfoProp'],
  data () {
    return {
      selectedIndex: null,
      username: '',
      roomName: '',
      budget: 0,
      announceDate: '',
      background: require('../assets/snowing.gif'),
      members: [],
      avatarSize: this.getAvatarSize(),
      countdownDay: 0,
      countdownHour: 0,
      countdownMin: 0,
      countdownSec: 0,
      countdown: 0,
      interval: null
    }
  },
  created () {
  },
  mounted () {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
    })
    if (!this.roomInfoProp) {
      this.loadFromStorage()
    } else {
      class Member {
        constructor (name, avatar, wish, secretSanta) {
          this.name = name
          this.avatar = avatar
          this.wish = wish
          this.secretSanta = secretSanta
        }
      }
      let roomInfo = this.roomInfoProp
      this.roomName = roomInfo.roomName
      this.budget = roomInfo.budget
      this.announceDate = roomInfo.deadline
      this.members = roomInfo.members.map(m => {
        return new Member(m.username, m.avatar, m.wish, m.santa)
      })
      this.background = require(`../assets/backgrounds/${roomInfo.background}`)
    }
    let date = new Date(this.announceDate)
    let now = new Date()
    console.log(`date: ${date}`)
    console.log(`now: ${now}`)
    this.countdown = (date.getTime() - now.getTime()) / 1000 | 0
    this.interval = setInterval(() => {
      console.log(`countdown: ${this.countdown}`)
      if (this.countdown <= 0) {
        clearInterval(this.interval)
        this.interval = null
      }
      this.computeInterval(this.countdown--)
    }, 1000)
  },
  methods: {
    loadFromStorage () {
      let encrypted = localStorage.getItem('data')
      if (encrypted) {
        encrypted = encrypted.replace(/\s/g, '')
        let decrypted = decodeURIComponent(escape(atob(encrypted)))
        let data = JSON.parse(decrypted)
        this.username = data.username
      }
      let encryptedRoom = localStorage.getItem('roomInfo')
      if (encryptedRoom) {
        class Member {
          constructor (name, avatar, wish, secretSanta) {
            this.name = name
            this.avatar = avatar
            this.wish = wish
            this.secretSanta = secretSanta
          }
        }
        encryptedRoom = encryptedRoom.replace(/\s/g, '')
        let decryptedRoom = decodeURIComponent(escape(atob(encryptedRoom)))
        let roomInfo = JSON.parse(decryptedRoom)
        this.roomName = roomInfo.roomName
        this.budget = roomInfo.budget
        this.announceDate = roomInfo.deadline
        this.members = roomInfo.members.map(m => {
          return new Member(m.username, m.avatar, m.wish, m.santa)
        })
        this.background = require(`../assets/backgrounds/${roomInfo.background}`)
      }
    },
    computeInterval (interval) {
      this.countdownDay = interval / 3600 / 24 | 0
      this.countdownHour = (interval % (3600 * 24)) / 3600 | 0
      this.countdownMin = ((interval % (3600 * 24)) % 3600) / 60 | 0
      this.countdownSec = (((interval % (3600 * 24)) % 3600) % 60) | 0
    },
    sendInvitation () {
      // todo
    },
    getAvatarSize () {
      if (screen.width < 235) return 50
      else if (screen.width >= 235 && screen.width <= 382) return 70
      else if (screen.width >= 382 && screen.width <= 834) return 100
      else return 140
    },
    getImgURL (name) {
      return require('../assets/avatars/' + name)
    },
    getShortName (name) {
      return name.substring(0, 4)
    },
    onResize () {
      this.avatarSize = this.getAvatarSize()
    },
    back () {
      if (this.interval != null) {
        clearInterval(this.interval)
        this.interval = null
      }
      this.$router.push({ name: 'Profile' })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.room {
  position: fixed;
  width: 100%;
  height: 100%;
  background-attachment: fixed;
  background-position: center;
  background-repeat:no-repeat;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  align-items: center;
}

.container {
  position: relative;
  text-align: center;
  color: white;
}

.room-name{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: black;
  font-weight: bold;
}

.info-board {
  background-color: burlywood;
  max-width: 500px;
  margin: 20px auto;
  border-radius: 20px;
  border: 5px solid rgb(133, 68, 7);
}

.icon {
  width: 50px;
}

.countdown {
  font-weight: bold;
  background-color: powderblue;
}

.avatar {
  margin: 10px 10px;
}

.avatar-name {
  max-width: 50px;
  margin: 0 auto;
  border-radius: 10px;
  font-weight: bold;
}

.member-container {
  background-color: salmon;
}

.btn-group {
  border-radius: 10px;
  padding: 10px 10px;
  background-color: white;
  font-weight: bold;
}

.title {
  font-weight: bold;
}

@media screen and (max-width: 222px) {
  .info-board {
    max-width: 150px;
  }

  .icon {
    width: 20px;
  }

  .col {
    font-size: 0.5rem;
  }
}

@media screen and (min-width: 222px) and (max-width: 422px) {
  .info-board {
    max-width: 200px;
  }

  .icon {
    width: 30px;
  }

  .col {
    font-size: 0.7rem;
  }
}

@media screen and (min-width: 422px) and (max-width: 650px) {
  .info-board {
    max-width: 350px;
  }
}
</style>
