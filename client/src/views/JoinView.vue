<template>
    <div id="container">
      <div id="input-group">
        <label for="room-code">Room Code:</label>
        <input type="text" id="room-code" v-model="roomCode" />
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
  
  <style>
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
  }
  
  #input-group label {
    margin-right: 20px;
  }
  
  #input-group input {
    border: 2px solid green;
    padding: 5px;
  }
  
  button {
    border: 2px solid green;
    padding: 10px 20px;
    cursor: pointer;
    /* Additional styling as needed */
  }
  </style>
  