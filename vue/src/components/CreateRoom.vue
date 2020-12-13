<template>
  <div class="create-room" :style="{ 'background-image': 'url(' + background[selectionIndex] + ')' }">
      <p class="msg">Customize your room!</p>
      <div class="container">
        <div>
          <v-text-field
            v-model="roomName"
            solo
            label="Room Name"
            type="text"
          ></v-text-field>
        </div>
        <div>
          <v-text-field
            v-model="budget"
            solo
            label="Gift Budget"
            type="text"
          ></v-text-field>
        </div>
        <div>
          <v-text-field
            v-model="announceDate"
            solo
            label="Announce Date"
            type="date"
          ></v-text-field>
        </div>
        <div class="background-selection">
          <p class="background-selection" :style="{'background-color': 'darkslateblue'}">Background</p>
          <v-btn width="50" @click="increaseIndex()" rounded elevation="2">
            <v-icon size="50">mdi-menu-left</v-icon>
          </v-btn>
          <v-btn width="50" @click="increaseIndex()" rounded elevation="2">
            <v-icon size="50">mdi-menu-right</v-icon>
            </v-btn>
        </div>
        <br/>
        <v-btn :to="{ name: 'Home' }" color="primary" rounded @click="createRoom()">
          Create
        </v-btn>
      </div>
  </div>
</template>

<script>
export default {
  name: 'CreateRoom',
  data () {
    return {
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
    createRoom () {
      // to do
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
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
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
}

.background-selection {
  padding: 6px 6px;
  color: white;
  font-weight: bold;
  background-color: lavender;
  border-radius: 5px;
}

@media screen and (max-width: 350px) {
  .msg {
    font-size: 1.5rem;
  }
}
</style>
