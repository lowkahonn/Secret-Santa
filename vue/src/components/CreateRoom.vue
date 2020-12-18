<template>
  <div class="create-room">
      <p class="msg">Customize your room!</p>
      <div class="container">
        <div>
          <v-text-field
            v-model="roomName"
            solo
            dense
            label="Room Name"
            type="text"
            class="input-field"
          ></v-text-field>
        </div>
        <div>
          <v-text-field
            v-model="budget"
            solo
            dense
            label="Gift Budget"
            type="number"
            class="input-field"
          ></v-text-field>
        </div>
        <div>
          <v-text-field
            v-model="announceDate"
            solo
            dense
            label="Announce Date"
            type="datetime-local"
            class="input-field"
          ></v-text-field>
        </div>
        <div class="background-selection">
          <strong>Room Background</strong>
          <v-img :aspect-ratio="16/9" :src="background[selectionIndex]">
          </v-img>
          <v-btn class="arrow-btn" @click="decreaseIndex()" rounded elevation="2">
            <v-icon size="30">mdi-menu-left</v-icon>
          </v-btn>
          <v-btn class="arrow-btn" @click="increaseIndex()" rounded elevation="2">
            <v-icon size="30">mdi-menu-right</v-icon>
          </v-btn>
        </div>
        <v-btn color="primary" rounded @click="createRoom()">
          Create
        </v-btn>
      </div>
  </div>
</template>

<script>
import ApiService from '@/api/api.service'
export default {
  name: 'CreateRoom',
  props: ['usernameProp', 'emailProp'],
  data () {
    return {
      username: this.usernameProp,
      email: this.emailProp,
      selectionIndex: 0,
      background: [],
      roomName: '',
      budget: '',
      announceDate: ''
    }
  },
  mounted () {
    this.importAll(require.context('../assets/backgrounds/', false, /\.jpe?g$/))
  },
  methods: {
    saveData (roomInfo) {
      let parsed = JSON.stringify(roomInfo)
      let encrypted = btoa(unescape(encodeURIComponent(parsed)))
      localStorage.setItem('roomInfo', encrypted)
    },
    loadFromStorage () {
      let encrypted = localStorage.getItem('data')
      if (encrypted) {
        encrypted = encrypted.replace(/\s/g, '')
        let decrypted = decodeURIComponent(escape(atob(encrypted)))
        let data = JSON.parse(decrypted)
        this.username = data.username
        this.email = data.email
      }
    },
    getDeadline () {
      let date = new Date(this.announceDate).toISOString()
      let datetime = date.split('T')
      datetime[1] = datetime[1].split('.')[0]
      return datetime.join(' ')
    },
    importAll (r) {
      r.keys().forEach(key => (this.background.push(r(key))))
      this.background.sort()
    },
    decreaseIndex () {
      var index = (this.selectionIndex - 1)
      this.selectionIndex = index < 0 ? this.background.length - 1 : index
    },
    increaseIndex () {
      this.selectionIndex = (this.selectionIndex + 1) % this.background.length
    },
    async createRoom () {
      let data = {
        organizer: this.username,
        email: this.email,
        deadline: this.getDeadline(),
        budget: this.budget,
        roomName: this.roomName,
        background: `background-${this.selectionIndex}.jpeg`
      }
      let res = await ApiService.createRoom(data)
      if (res.data && res.data.result && res.data.roomInfo) {
        this.saveData(res.data.roomInfo)
        this.$router.push({
          name: 'Room',
          params: {
            roomInfoProp: res.data.roomInfo
          }
        })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.create-room {
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

.msg {
  background-color: rgba(255, 255, 255, 0.8);
  align-items: center;
  font-size: 1.5rem;
  padding: 1rem;
  margin: 0px;
  margin-top: 1.5rem;
}

.container {
  align-items: center;
  padding: 50px 50px;
  max-width: 350px;
  min-width: 280px;
}

.arrow-btn {
  margin: 10px 10px;
}

.input-field {
  font-size: 0.7rem;
}

@media screen and (max-width: 275px), (max-height: 550px) {
  .msg {
    font-size: 0.8rem;
  }

  .container {
    padding: 5px 5px;
    min-width:150px;
    width: 180px;
  }

  .arrow-btn{
    margin: 5px 0px;
  }

  .input-field {
    font-size: 0.6rem;
  }
}

@media screen and (min-width: 275px) and (max-width: 350px) and (min-height: 550px) and (max-height: 600px) {
  .msg {
    font-size: 1rem;
  }

  .container {
    padding: 5px 5px;
    min-width:150px;
    width: 250px;
  }

  .arrow-btn{
    margin: 5px 0px;
  }

  .input-field {
    font-size: 0.7rem;
  }
}

@media screen and (min-width: 350px) and (max-width: 650px) and (min-height: 600px){
  .msg {
    font-size: 1.5rem;
  }

  .container {
    padding: 10px 10px;
    min-width:150px;
    width: 400px;
  }

  .arrow-btn{
    margin: 15px 15px;
  }

  .input-field {
    font-size: 0.7rem;
  }
}

@media screen and (min-width: 650px) and (min-height: 774px){
  .msg {
    font-size: 2rem;
  }

  .container {
    padding: 50px 10px;
    min-width:150px;
    max-width: 800px;
    width: 500px;
  }

  .arrow-btn{
    margin: 10px 10px;
  }

  .input-field {
    font-size: 1rem;
  }
}
</style>
