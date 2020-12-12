<template>
  <div class="home">
      <p class="welcome-msg">Welcome to Secret Santa</p>
      <div class="santa">
        <img src="../assets/secret-santa.png">
      </div>
      <v-btn
        :to="{ name: 'Registration' }"
        class="register"
        color="primary"
        elevation="2"
        rounded
        outlined
      > Register </v-btn>
  </div>
</template>

<script>
export default {
  name: 'Home'
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

.v-btn:not(.v-btn--round).v-size--default {
  padding: 1.5rem;
}

.register {
  margin: 1rem 0rem;
  font-size: 1.5rem;
}

@media screen and (max-width: 601px) {
  .welcome-msg {
    font-size: 5vw;
  }

  img {
    max-width: 50%;
    max-height: 50%;
  }

  .register {
    font-size: 3vw;
  }

  .v-btn:not(.v-btn--round).v-size--default {
    padding: 0 3vw;
  }
}

@media screen and (min-width: 601px) and (max-width: 801px) {
  .register {
    font-size: 1.5vw;
  }

  .v-btn:not(.v-btn--round).v-size--default {
    padding: 0 1.5vw;
  }
}

@media screen and (min-width: 801px) and (max-width: 1080px) {
  .register {
    font-size: 2vw;
  }

  .v-btn:not(.v-btn--round).v-size--default {
    padding: 0 2vw;
  }
}

</style>
