<script setup lang="ts">
import { Button } from '@/components/ui/button';
import router from '@/router';
import { Camera, Mic, MicOff, LogOut, Video, VideoOff } from 'lucide-vue-next';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  createClient,
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack
} from 'agora-rtc-sdk-ng/esm';
import axios from 'axios';
import { useSpeechRecognition } from '@vueuse/core';
// import { SpeechRecognition } from '@/lib/types';

const appId = '696d19cdaaa045ebb4fafe4f9206068e';
const route = useRoute();
const channel = route.params.channelName;

// Track the mic/video state - Turn on Mic and Camera On
const micOn = ref(false);
const cameraOn = ref(false);

// Track video feeds
const isRemoteVideoPlaying = ref(false);
const isLocalVideoAvailable = ref(false);

// Local audio tracks
let localMicrophoneTrack: IMicrophoneAudioTrack | null = null;
let localCameraTrack: ICameraVideoTrack | null = null;

// Speech recongition
// let recognition: SpeechRecognition | null = null;
const speechToText = useSpeechRecognition({
  lang: 'en-US',
  interimResults: true,
  continuous: true
});

// Agora client info
const client = createClient({ mode: 'rtc', codec: 'vp8' });
client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
  await client.subscribe(user, mediaType);

  // Handle remote video
  if (mediaType === 'video' && user.videoTrack) {
    user.videoTrack.play('remote-video');
    isRemoteVideoPlaying.value = true;
  }
  // Handle remote audio
  if (mediaType === 'audio' && user.audioTrack) {
    user.audioTrack.play();
  }
});
client.on('user-unpublished', async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
  await client.unsubscribe(user, mediaType);

  if (mediaType === 'video') {
    user.videoTrack?.stop();
    isRemoteVideoPlaying.value = false;
  }
  if (mediaType === 'audio') {
    user.audioTrack?.stop();
  }
});

async function toggleMic() {
  if (!localMicrophoneTrack) {
    localMicrophoneTrack = await createMicrophoneAudioTrack();
    await client.publish(localMicrophoneTrack);
  }
  localMicrophoneTrack.setEnabled(!micOn.value);

  if (micOn.value) {
    // Stop speech recognition
    speechToText.stop();
  } else {
    // Start speech recognition
    if (speechToText.recognition) {
      speechToText.recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join('');
        console.log(transcript);
      };
      speechToText.recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
      };
    }
    speechToText.start();
  }

  micOn.value = !micOn.value;
}

async function toggleCamera() {
  if (!localCameraTrack) {
    localCameraTrack = await createCameraVideoTrack();
    await client.publish(localCameraTrack);
    localCameraTrack.play('local-video');
  }
  localCameraTrack.setEnabled(!cameraOn.value);
  cameraOn.value = !cameraOn.value;
}

async function disconnect() {
  localCameraTrack?.setEnabled(false);
  localMicrophoneTrack?.setEnabled(false);
  localMicrophoneTrack?.stop();
  localCameraTrack?.stop();
  client.leave();
  router.push('/');
}

// Function to send video frame data to the server for analysis
async function sendFrameData(imageData: string) {
  try {
    // Send image data to your API Gateway endpoint
    const response = await axios.post(
      'https://di3v6oiwwe.execute-api.us-east-2.amazonaws.com/test/DetectFaces',
      { imageData }
    );

    // Handle response from the server
    console.log('Response from server:', response.data);
  } catch (error) {
    console.error('Error sending frame data:', error);
  }
}

async function captureFrame() {
  const videoElement = document.getElementById('remote-video');

  // Check if video element exists and is an HTMLVideoElement
  if (!videoElement || !(videoElement instanceof HTMLVideoElement)) {
    console.error('Remote video element not found or is not a video element.');
    return;
  }

  // Check if video metadata is loaded
  if (videoElement.readyState < videoElement.HAVE_METADATA) {
    console.error('Video metadata not loaded yet.');
    return;
  }

  const canvas = document.createElement('canvas'); // Create canvas element
  const context = canvas.getContext('2d');

  // Check if context is available
  if (!context) {
    console.error('Canvas context not available.');
    return;
  }

  // Set canvas dimensions to match video feed
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  // Draw the video frame onto the canvas
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  // Get image data from the canvas
  const imageData = canvas.toDataURL('image/jpeg');

  // Log the imageData to inspect it
  console.log('Captured imageData:', imageData);

  // Send image data to Lambda via API Gateway
  await sendFrameData(imageData);
}

onMounted(async () => {
  await client.join(appId, channel as string, null); // TODO: Check
  await toggleCamera();
  await toggleMic();
  isLocalVideoAvailable.value = true;
});

onUnmounted(async () => {
  localCameraTrack?.setEnabled(false);
  localMicrophoneTrack?.setEnabled(false);
  localMicrophoneTrack?.stop();
  localCameraTrack?.stop();
  client.leave();
});
</script>

<template>
  <div class="p-8">
    <div class="flex flex-wrap gap-4 items-center">
      <div class="relative w-[25vw] max-w-[720px] min-w-[480px] overflow-hidden">
        <video id="remote-video" class="aspect-[4/3]" />
        <Button
          v-if="isRemoteVideoPlaying"
          size="icon"
          class="absolute top-0 right-0 m-3"
          @click="captureFrame">
          <Camera class="size-4" />
        </Button>
      </div>
    </div>
    <div class="w-[50vw] max-w-[480px] min-w-[360px] fixed right-6 bottom-6 m-0">
      <video id="local-video" class="aspect-video" />

      <div v-if="isLocalVideoAvailable" class="absolute bottom-0 right-0 m-3 z-[99]">
        <div class="space-x-2">
          <Button size="icon" @click="toggleMic">
            <Mic v-if="micOn" class="size-4" />
            <MicOff v-else class="size-4" />
          </Button>

          <Button size="icon" @click="toggleCamera">
            <Video v-if="cameraOn" class="size-4" />
            <VideoOff v-else class="size-4" />
          </Button>

          <Button size="icon" variant="destructive" @click="disconnect">
            <LogOut class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
