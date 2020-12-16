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
          ></v-text-field>
        </div>
        <div>
          <v-text-field
            v-model="budget"
            solo
            dense
            label="Gift Budget"
            type="text"
          ></v-text-field>
        </div>
        <div>
          <v-text-field
            v-model="announceDate"
            solo
            dense
            label="Announce Date"
            type="date"
          ></v-text-field>
        </div>
        <div class="background-selection">
          <strong>Room Background</strong>
          <v-img :aspect-ratio="16/9" :src="background[selectionIndex]">
          </v-img>
          <v-btn class="arrow-btn" @click="increaseIndex()" rounded elevation="2">
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
    getDeadline () {
      // TODO: get the date and time from DOM and parse into ISO string
      // mock deadline at 10 secs later
      let mock = new Date(Date.now() + 10000).toISOString()
      let datetime = mock.split('T')
      datetime[1] = datetime[1].split('.')[0]
      return datetime.join(' ')
    },
    importAll (r) {
      r.keys().forEach(key => (this.background.push(r(key))))
    },
    decreaseIndex () {
      var index = (this.avatarIndex - 1)
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
        roomName: this.roomName
      }
      let res = await ApiService.createRoom(data)
      console.log(res.data)
      if (res.data && res.data.result) {
        // TODO: route to room page
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
  font-size: 2rem;
  padding: 1rem;
  margin: 0px;
  margin-top: 2rem;
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

@media screen and (max-width: 350px) {
  .msg {
    font-size: 1.5rem;
  }

  .container {
    padding: 25px 25px;
    min-width:150px;
    width: 250px;
  }

  .arrow-btn{
    margin: 5px 0px;
  }
}

@media screen and (min-width: 650px) {
  .msg {
    font-size: 3rem;
  }

  .container {
    padding: 50px 25px;
    min-width:150px;
    max-width: 800px;
    width: 500px;
  }

  .arrow-btn{
    margin: 20px 20px;
  }
}
</style>