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
                </div>
            <transcript-box-component></transcript-box-component>
            </div>
      <sidebar-component></sidebar-component>
      <room-code-component :code=this.roomCode></room-code-component>
    </div>
</template>

<script lang="ts">
import SidebarComponent from '../components/SidebarComponent.vue';
import TranscriptBoxComponent from '../components/TranscriptBoxComponent.vue';
import RoomCodeComponent from '../components/RoomCodeComponent.vue';

export default {
    components: {
        // VideoComponent,
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
    }
}
</script>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { ref } from "vue";
import { agoraInfo } from "./storage";
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

async function onPublished(
  user: IAgoraRTCRemoteUser,
  mediaType: "video" | "audio"
) {
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

async function onUnPublished(
  user: IAgoraRTCRemoteUser,
  mediaType: "video" | "audio"
) {
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
</style>
  