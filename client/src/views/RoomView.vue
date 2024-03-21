<template>
  <div id="main-container">
    <div id="meeting">
      <div class="content-video">
        <video
          v-show="!isVideoSubed || isCameraOn"
          id="local-video"
          :class="{
            'video-fullscreen': !isVideoSubed,
          }"
        ></video>
        <video
          v-show="isVideoSubed"
          id="remote-video"
          :class="{
            'video-fullscreen': isVideoSubed && !isCameraOn,
          }"
        ></video>
      </div>
      <div class="content-operation">
        <button @click="toggleCamera">
          Turn {{ isCameraOn ? "Off" : "On" }} Camera
        </button>
        <br>
        <button @click="toggleMicrophone">
          Turn {{ isMicrophoneOn ? "Off" : "On" }} Microphone
        </button>
        <br>
        <button @click="captureFrame">Capture Frame</button> <!-- Added button for capturing frame -->
      </div>
      <transcript-box-component></transcript-box-component>
    </div>
    <sidebar-component></sidebar-component>
    <room-code-component v-if="roomCode" :code="roomCode"></room-code-component>
  </div>
</template>

<script lang="ts">
import SidebarComponent from '../components/SidebarComponent.vue';
import TranscriptBoxComponent from '../components/TranscriptBoxComponent.vue';
import RoomCodeComponent from '../components/RoomCodeComponent.vue';

export default {
  components: {
    SidebarComponent,
    TranscriptBoxComponent,
    RoomCodeComponent
  },
  data() {
    return {
      roomCode: null,
    };
  },
  created() {
    this.roomCode = this.$route.query.code;
  },
  methods: {
    // Your existing methods
  }
}
</script>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { ref } from "vue";
import { agoraInfo } from "./storage";
import axios from 'axios';
import {
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng/esm";

const $emit = defineEmits(["left"]);

const client: IAgoraRTCClient = agoraInfo.client!;

if (!client) {
  $emit("left");
  throw new Error("client is not initialized");
}

const isCameraOn = ref(false);
const isMicrophoneOn = ref(false);
const isVideoSubed = ref(false);
const isAudioSubed = ref(false);
let videoTrack: ICameraVideoTrack | null = null;
let audioTrack: IMicrophoneAudioTrack | null = null;

client.on("user-published", onPublished);
client.on("user-unpublished", onUnPublished);

async function onPublished(user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") {
  await client.subscribe(user, mediaType);
  if (mediaType === "video") {
    const remoteVideoTrack = user.videoTrack;
    if (remoteVideoTrack) {
      remoteVideoTrack.play("remote-video");
      isVideoSubed.value = true;
    }
  }
  if (mediaType === "audio") {
    const remoteAudioTrack = user.audioTrack;
    if (remoteAudioTrack) {
      remoteAudioTrack.play();
      isAudioSubed.value = true;
    }
  }
}

async function onUnPublished(user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") {
  await client.unsubscribe(user, mediaType);
  if (mediaType === "video") {
    isVideoSubed.value = false;
  }
  if (mediaType === "audio") {
    isAudioSubed.value = false;
  }
}

async function toggleCamera() {
  if (!videoTrack) {
    videoTrack = await createCameraVideoTrack();
    await client.publish(videoTrack);
    videoTrack.play("local-video");
  }
  if (!isCameraOn.value) {
    videoTrack.setMuted(false);
  } else {
    videoTrack.setMuted(true);
  }
  isCameraOn.value = !isCameraOn.value;
}

async function toggleMicrophone() {
  if (!audioTrack) {
    audioTrack = await createMicrophoneAudioTrack();
    await client.publish(audioTrack);
  }
  if (!isMicrophoneOn.value) {
    await audioTrack.setMuted(false);
  } else {
    await audioTrack.setMuted(true);
  }
  isMicrophoneOn.value = !isMicrophoneOn.value;
}

// Function to send video frame data to the server for analysis
async function sendFrameData(imageData) {
  try {
    // Send image data to your API Gateway endpoint
    const response = await axios.post("https://di3v6oiwwe.execute-api.us-east-2.amazonaws.com/test/DetectFaces", { imageData });

    // Handle response from the server
    console.log("Response from server:", response.data);
  } catch (error) {
    console.error("Error sending frame data:", error);
  }
}

function captureFrame() {
  const videoElement = document.getElementById("remote-video");

  // Check if video element exists and is an HTMLVideoElement
  if (!videoElement || !(videoElement instanceof HTMLVideoElement)) {
    console.error("Remote video element not found or is not a video element.");
    return;
  }

  // Check if video metadata is loaded
  if (videoElement.readyState < videoElement.HAVE_METADATA) {
    console.error("Video metadata not loaded yet.");
    return;
  }

  const canvas = document.createElement("canvas"); // Create canvas element
  const context = canvas.getContext("2d");

  // Check if context is available
  if (!context) {
    console.error("Canvas context not available.");
    return;
  }

  // Set canvas dimensions to match video feed
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  // Draw the video frame onto the canvas
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  // Get image data from the canvas
  const imageData = canvas.toDataURL("image/jpeg");

  // Log the imageData to inspect it
  console.log("Captured imageData:", imageData);

  // Send image data to Lambda via API Gateway
  sendFrameData(imageData);
}

function leave() {
  client.leave();
  videoTrack && videoTrack.stop();
  audioTrack && audioTrack.stop();
  agoraInfo.client = undefined;
  $emit("left");
}

onUnmounted(() => {
  console.log("left")
  leave();
})
</script>

<style lang="less">
#main-container {
display: flex;
height: 100vh;
border: 1px solid black;
}



#video-transcript-container {
display: flex;
flex-direction: column;
width: 75%;
}

.video-container {
  width: 100%;
  height: 75vh;
  border: 2px solid blue; 
}
.video-container video {
  width: 100%;
  height: 100%;
}

#meeting {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;

  .content-video {
    display: flex;
    flex-grow: 1;
    max-height: 80%;
    align-items: center;

    .video-fullscreen {
      max-width: 100%;
      max-height: 100%;
    }
    #local-video,
    #remote-video {
      aspect-ratio: 16/9;

      margin: 4px;
    //   display: flex;
      flex-grow: 1;

      border-radius: 4px;
      background-color: #666666;
    }
  }
//   .content-operation {
//     position: absolute;
//     bottom: 0;
//     width: 100%;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     padding: 20px 0;

//     background-color: #efefef;
//   }
}

button {
  margin-bottom: 10px;
}
</style>

  
