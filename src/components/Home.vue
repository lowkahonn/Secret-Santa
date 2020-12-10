<template>
  <div class="home">
      <p class="welcome-msg">Welcome to Secret Santa</p>
      <div class="santa">
        <img src="../assets/secret-santa.png">
      </div>
      <router-link :to="{ name: 'Registration' }" tag="button" class="register"> Register </router-link>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.home {
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
  padding: 1rem;
  margin: 0px;
  margin-top: 2rem;
}

.santa {
  align-items: center;
  width: 100%;
}

img {
  padding: 1rem;
  max-width: 30%;
  max-height: 30%;
}

.register {
  padding: 0.5rem 2rem;
  font-size: 1rem;
  align-items: center;
  border-radius: 1rem;
}

@media screen and (max-width: 601px) {
  .welcome-msg {
    font-size: 5vw;
  }

  img {
    max-width: 50%;
    max-height: 50%;
  }
}
</style>
