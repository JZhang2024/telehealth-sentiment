<template>
  <NavbarComponent/>
  <main class="home">
    <div class="home_buttons">
      <button @click="host" class="home_button">Host</button>
      <button @click="join" class="home_button">Join</button>
    </div>
    <!-- <RouterLink :to="{ name: 'video' }" class="video">Video Test</RouterLink> -->
  </main>
</template>

<script lang="ts">
import NavbarComponent from '../components/NavbarComponent.vue';
import {
  agoraInfo,
  appid,
  channel,
  videoCodec
} from "./storage";
import { createClient } from "agora-rtc-sdk-ng/esm";

export default {
  components: {
    NavbarComponent
  },
  methods: {
    async host() {
      let roomCode = makeid(6);
      const client = createClient({ mode: "rtc", codec: videoCodec.value });

      await client.join(appid.value, roomCode, null, null);

      agoraInfo.client = client;
      this.$router.push({ name: 'room', query: { code: roomCode }});
    },
    join() {
      this.$router.push({ name: 'join' });
    },
  },

  
};

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}
</script>

<style>
.home {
  padding: 1rem;
}

.home h2 {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.home p {
  margin-bottom: 1rem;
}

.home_button {
  background-color: #ffffff; /* Green */
  border: 5px solid #3BB017;
  border-radius: 10px;

  color: #000000;

  padding: 15px 32px;
  font-size: 100px;
  height: 350px;
  width: 275px;

  text-align: center;
  text-decoration: none;
  display: inline-block;
  
  transition-duration: 0.4s;
}


.home_button:hover {
  background-color: #3BB017; /* Green */
  color: white;
}

.home_buttons {
  display: flex;
  align-items: center; /* Center items horizontally */
  justify-content: center; /* Center items vertically */
  margin-top: 150px; /* Adjust as needed */
  gap: 100px
}
</style>
