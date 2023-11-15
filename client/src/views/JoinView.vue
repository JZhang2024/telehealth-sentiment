<template>
    <div id="container">
      <div id="input-group">
        <label for="room-code" >Room Code:</label>
        <input type="text" id="room-code" v-model="roomCode" placeholder="XXXXXX" maxlength="6"/> 
      </div>
      <button @click="enterRoom">Enter</button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'RoomCodeEntryComponent',
    data() {
      return {
        roomCode: ''
      };
    },
    methods: {
      enterRoom() {
        console.log("Entered Room Code: ", this.roomCode);
        // logic for handling room code ** TO BE ADDED WHEN WE FIGURE IT OUT **
      }
    }
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
  