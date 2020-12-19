<template>
  <div class="room" :style="{ 'background-image': 'url(' + background + ')'}">
    <div class="container">
      <img src="../assets/wood-sign.png" class="room-plate">
      <div class="room-name">{{roomName}}</div>
    </div>
    <p class="countdown">Time Remaining<br>{{ countdownDay }} days {{ countdownHour }} hours {{ countdownMin }} mins {{ countdownSec }} secs</p>
    <v-row justify="center">
      <v-slide-group
        class="pa-4"
        center-active
        show-arrows
        prev-icon="mdi-arrow-left-drop-circle"
        next-icon="mdi-arrow-right-drop-circle"
      >
        <v-slide-item
          v-for="(key, index) in Object.keys(members)"
          :key="index"
          active-class="border"
        >
          <div>
            <v-avatar
              :color="key === selectedKey ? 'primary' : 'grey lighten-1'"
              class="avatar"
              :size="avatarSize"
              @click="toggleAvatar(key)"
            >
              <img
                :src="getImgURL(members[key].avatar)"
                :alt="getShortName(members[key].name)"
              >
            </v-avatar>
            <v-sheet
             :color="members[key].secretSanta === username ? 'red lighten-1' : 'lunarblush lighten-1'"
             class="avatar-name"
             elevation="1"
             :max-width="avatarSize * 0.75"
             @click="toggleAvatar(key)"
            >
              {{members[key].name}}
            </v-sheet>
          </div>
        </v-slide-item>
      </v-slide-group>
    </v-row>
    <div class="info">
      <v-expand-transition>
        <v-sheet
          v-if="isActive"
          height="50"
          rounded
        >
          <v-row
            v-if="members[selectedKey].wish && members[selectedKey].wish !== ''"
            class="fill-height"
            align="center"
            justify="center"
          >
            <h3 class="title">
              {{members[selectedKey].name}}'s wish: {{members[selectedKey].wish}}
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
          <button @click="toggleEditWish()" class="btn-group">Edit Wish</button><br>
          <button @click="copyUrl()" class="btn-group">Share Link</button>
          <h3 v-if="isCopied" class="msg-copy">&nbsp;Link copied!</h3><br>
          <button @click="back()" class="btn-group">Back to Profile</button>
        </div>
      </v-col>
    </v-row>
    <div v-if="editWish" class="overlay">
      <div class="table">
        <v-text-field
            v-model="wish"
            prepend-icon="mdi-gift"
            append-outer-icon="mdi-checkbox-marked"
            solo
            clear-icon="mdi-close-circle"
            clearable
            label="Enter your wish"
            type="text"
            @click:append-outer="updateWish()"
            @click:clear="clearWish()"
        >
        </v-text-field>
        <p v-if="showUpdateError" class="error-msg">Please try again</p>
        <v-btn @click="toggleEditWish()" class="btn-group">Back</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import ApiService from '@/api/api.service'
export default {
  name: 'Room',
  props: ['roomInfoProp'],
  data () {
    return {
      selectedKey: null,
      username: '',
      avatar: '',
      roomName: '',
      email: '',
      wish: '',
      roomId: 0,
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
      interval: null,
      hash: '',
      isActive: false,
      editWish: false,
      isCopied: false,
      showUpdateError: false
    }
  },
  async mounted () {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
    })
    let data = localStorage.getItem('data')
    let hash = location.hash.slice(1)
    if (hash === '') {
      if (!this.roomInfoProp) {
        this.loadFromStorage()
      } else {
        this.loadFromStorage()
        let roomInfo = this.roomInfoProp
        this.parseLoadedData(roomInfo)
        await this.joinRoom(this.roomId)
      }
    } else {
      let valid = await ApiService.checkRoomValid(hash)
      if (!valid || !valid.data || !valid.data.result) {
        this.$router.push({ name: 'Home' })
      } else {
        if (data) {
          this.loadFromStorage()
          await this.joinRoom(hash)
        } else {
          this.$router.push({
            name: 'Home',
            params: {
              pendingHashProp: hash
            }
          })
        }
      }
    }
    this.startCountdown()
  },
  methods: {
    async joinRoom (roomId) {
      let q = await ApiService.join({
        roomId,
        username: this.username,
        email: this.email
      })
      if (q.data && q.data.result) {
        this.parseLoadedData(q.data.roomInfo)
        this.saveData(q.data.roomInfo)
      }
    },
    saveData (roomInfo) {
      let parsed = JSON.stringify(roomInfo)
      let encrypted = btoa(unescape(encodeURIComponent(parsed)))
      localStorage.setItem('roomInfo', encrypted)
    },
    startCountdown () {
      let date = new Date(this.announceDate)
      let now = new Date()
      this.countdown = (date.getTime() - now.getTime()) / 1000 | 0
      if (this.countdown > 0) {
        this.interval = setInterval(() => {
          if (this.countdown <= 0) {
            clearInterval(this.interval)
            this.interval = null
          }
          this.computeInterval(this.countdown--)
        }, 1000)
      }
    },
    parseLoadedData (roomInfo) {
      class Member {
        constructor (name, avatar, wish, secretSanta) {
          this.name = name
          this.avatar = avatar
          this.wish = wish
          this.secretSanta = secretSanta
        }
      }
      this.roomName = roomInfo.roomName
      this.roomId = roomInfo.roomId
      this.budget = roomInfo.budget
      this.announceDate = roomInfo.deadline
      this.members = Object.assign(
        {},
        ...roomInfo.members.map((m) => ({
          [m.username]: new Member(m.username, m.avatar, m.wish, m.santa)
        }))
      )
      this.wish = this.members[this.username] ? this.members[this.username].wish : ''
      if (!this.wish || this.wish === '') {
        this.editWish = true
      }
      this.background = require(`../assets/backgrounds/${roomInfo.background}`)
    },
    loadFromStorage () {
      let encrypted = localStorage.getItem('data')
      if (encrypted) {
        let decrypted = atob(encrypted)
        let data = JSON.parse(decrypted)
        this.username = data.username
        this.avatar = require(`../assets/avatars/${data.avatar}`)
        this.email = data.email
      }
      let encryptedRoom = localStorage.getItem('roomInfo')
      if (encryptedRoom) {
        encryptedRoom = encryptedRoom.replace(/\s/g, '')
        let decryptedRoom = decodeURIComponent(escape(atob(encryptedRoom)))
        let roomInfo = JSON.parse(decryptedRoom)
        this.parseLoadedData(roomInfo)
      }
    },
    computeInterval (interval) {
      this.countdownDay = interval / 3600 / 24 | 0
      this.countdownHour = (interval % (3600 * 24)) / 3600 | 0
      this.countdownMin = ((interval % (3600 * 24)) % 3600) / 60 | 0
      this.countdownSec = (((interval % (3600 * 24)) % 3600) % 60) | 0
    },
    copyUrl () {
      if (!window.getSelection) {
        alert('Please copy the URL from the location bar.')
        return
      }
      const dummy = document.createElement('p')
      dummy.textContent = window.location.href + '#' + this.roomId
      document.body.appendChild(dummy)

      const range = document.createRange()
      range.setStartBefore(dummy)
      range.setEndAfter(dummy)

      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)

      document.execCommand('copy')
      document.body.removeChild(dummy)
      this.isCopied = true
      setTimeout(() => { this.isCopied = false }, 1000)
    },
    async updateWish () {
      if (this.members[this.username]) {
        this.members[this.username].wish = this.wish
      }

      let data = {
        username: this.username,
        roomId: this.roomId,
        wish: this.wish
      }

      let res = await ApiService.updateWish(data)

      if (res) {
        this.showUpdateError = false
        this.editWish = false
      } else {
        this.showUpdateError = true
        setTimeout(() => { this.showUpdateError = false }, 1000)
      }
    },
    clearWish () {
      this.wish = ''
    },
    getAvatarSize () {
      if (screen.width < 235 || screen.height < 435) return 50
      else if ((screen.width >= 235 && screen.width <= 382) || screen.height < 575) return 70
      else if ((screen.width >= 382 && screen.width <= 834) || screen.height < 735) return 100
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
    toggleEditWish () {
      this.editWish = !this.editWish
    },
    toggleAvatar (key) {
      this.isActive = !this.isActive
      this.selectedKey = key
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

.room-name {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: black;
  font-weight: bold;
  font-weight: 15px;
}

.room-plate {
  width: 200px;
  filter: brightness(150%);
}

.info-board {
  background-color: burlywood;
  max-width: 500px;
  margin: 5px auto;
  border-radius: 20px;
  border: 5px solid rgb(133, 68, 7);
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

.icon {
  width: 50px;
}

.msg-copy {
  font-weight: bold;
  font-size: 0.6rem;
}

.error-msg {
  color: rgba(206, 29, 29, 0.87);
}

.countdown {
  font-weight: bold;
  background-color: powderblue;
  border-radius: 10px;
  border-bottom: 3px solid rgb(81, 116, 231);
  max-width: 350px;
  margin: 0 auto;
}

.avatar {
  margin: 10px 10px;
}

.avatar-name {
  overflow: hidden;
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
  margin: 5px 5px;
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

  .countdown {
    max-width: 175px;
    font-size: 10px;
  }

  .room-plate {
    width: 100px;
  }

  .col {
    padding: 2px 2px;
    font-size: 0.5rem;
  }
}

@media screen and (min-width: 222px) and (max-width: 422px) {
  .info-board {
    max-width: 200px;
  }

  .countdown {
    max-width: 200px;
    font-size: 12.5px;
  }

  .icon {
    width: 30px;
  }

  .room-plate {
    width: 100px;
  }

  .col {
    padding: 4px 4px;
    font-size: 0.6rem;
  }
}

@media screen and (min-width: 422px) and (max-width: 650px) {
  .info-board {
    max-width: 350px;
  }

   .room-plate {
    width: 150px;
  }
}

@media screen and (max-height: 622px) {
 .room-plate {
    width: 100px;
  }

  .col {
    padding: 4px 4px;
    font-size: 0.5rem;
  }

  .icon {
    width: 30px;
  }
}

@media screen and (min-height: 622px) and (max-height: 828px) and (min-width: 422px) {
 .room-plate {
    width: 150px;
  }

  .col {
    padding: 6px 6px;
    font-size: 0.7rem;
  }
}
</style>
