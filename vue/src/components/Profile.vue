<template>
  <div class="profile">
    <p class="header-msg">Login successfully! <br /> Now add items into your wishlist!</p>
    <div class="profile-pic">
      <v-avatar size="50%">
        <img :src=avatar>
      </v-avatar>
      <p class="username">{{username}}</p>
    </div>
    <p><strong>Wish List (Max {{maxItem}} items)</strong>&nbsp;</p>
    <v-row justify="center" class="wishlist">
      <v-chip-group
      column
      >
        <v-chip
          color="red"
          v-for="item in wishlist"
          :key="item"
          close
          @click:close="remove(item)"
        >
          <v-icon left color="white">
              mdi-gift
          </v-icon>
          <strong>{{ item }}</strong>&nbsp;
        </v-chip>
      </v-chip-group>
    </v-row>
    <v-row class="input">
        <v-col cols="12">
          <v-text-field
            v-model="itemToAdd"
            append-outer-icon="mdi-plus-box"
            solo
            clear-icon="mdi-close-circle"
            label="What do you want for this Christmas?"
            type="text"
            clearable
            @click:append-outer="addItem()"
            @click:clear="clearMessage()"
          ></v-text-field>
        </v-col>
      </v-row>
    <div>
      <v-btn :to="{ name: 'CreateRoom' }" class="btn-group" color="primary" rounded>Create Room</v-btn>
    </div>
    <div>
      <v-btn @click="joinRoom()" class="btn-group" color="primary" rounded>Join Room</v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data () {
    return {
      username: 'Stanley',
      avatar: require('../assets/avatars/boy.png'),
      itemToAdd: '',
      maxItem: 10,
      wishlist: ['pen', 'pineappple', 'apple']
    }
  },
  methods: {
    addItem () {
      if (this.itemToAdd === '' || this.wishlist.indexOf(this.itemToAdd) !== -1) return
      this.wishlist.push(this.itemToAdd)
      this.updateUserData()
      this.clearMessage()
    },
    clearMessage () {
      this.itemToAdd = ''
    },
    remove (item) {
      this.wishlist.splice(this.wishlist.indexOf(item), 1)
      this.wishlist = [...this.wishlist]
      this.updateUserData()
    },
    show () {
      console.log(this.wishlist)
    },
    joinRoom () {
      // todo
    },
    updateUserData () {
      // to do
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
  background-color: white;
  align-items: center;
  margin-top: 1.5rem;
  width: 100%;
}

.username {
  background-color: cornflowerblue;
  text-align: center;
  font-weight: bold;
  font-size: 2rem;
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
