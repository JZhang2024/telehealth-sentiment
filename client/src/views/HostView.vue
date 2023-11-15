<template>
    <div id="main-container">
      <div id="video-transcript-container">
        <video-component></video-component>
        <transcript-box-component></transcript-box-component>
      </div>
      <sidebar-component></sidebar-component>
      <room-code-component></room-code-component>
    </div>
  </template>
  
  <script>
  import VideoComponent from '../components/VideoComponent.vue';
  import SidebarComponent from '../components/SidebarComponent.vue';
  import TranscriptBoxComponent from '../components/TranscriptBoxComponent.vue';
  import RoomCodeComponent from '../components/RoomCodeComponent.vue';
  
  export default {
    components: {
      VideoComponent,
      SidebarComponent,
      TranscriptBoxComponent,
      RoomCodeComponent
    }
  }
  </script>
  
  <style>
  #main-container {
    display: flex;
    height: 100vh;
    border: 1px solid black; /* Border for clarity */
  }
  
  #video-transcript-container {
    display: flex;
    flex-direction: column;
    width: 75%;
  }
  </style>
  