<template>
  <NavbarComponent/>
      <div id="container">
      
      <div id="input-group">
        <label for="room-code" >Room Code:</label>
        <input type="text" id="room-code" v-model="roomCode" placeholder="XXXXXX" maxlength="6"/> 
      </div>
      <button @click="enterRoom">Enter</button>
    </div>
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
  name: 'RoomCodeEntryComponent',
  components: NavbarComponent,
  data() {
      return {
          roomCode: ''
      };
  },
  methods: {
      async enterRoom() {
        console.log("Entered Room Code: ", this.roomCode);
        const client = createClient({ mode: "rtc", codec: videoCodec.value });

        await client.join(appid.value, this.roomCode, null, null);

        agoraInfo.client = client;
        
        // logic for handling room code ** TO BE ADDED WHEN WE FIGURE IT OUT **
        this.$router.push({ name: "room", query: { code: this.roomCode }});            
      }
  },
}
</script>
  
  <style scoped>
  #container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
  
  #input-group {
    display: flex;
    align-items: center;
    margin-bottom: 30px; /* Spacing between input group and button */
    font-size: 25px;
  }
  
  #input-group label {
    margin-right: 20px;
  }
  
  #input-group input {
    border: 2px solid #3BB017;
    padding: 5px;
    border-radius: 10px;
    width: 10ch;
  }
  
  button {
    border: 2px solid #3BB017;
    padding: 10px 20px;
    cursor: pointer;
    background-color: white;
    /* Additional styling as needed */
    transition-duration: 0.4s;
    border-radius: 10px;
  }

  button:hover {
    background-color: #3BB017
  }
  </style>
  