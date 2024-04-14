<script setup lang="ts">
import { Button } from '@/components/ui/button';
import router from '@/router';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  LogOut,
  Video,
  VideoOff,
  Captions,
  CaptionsOff,
  NotebookPen
} from 'lucide-vue-next';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  createClient,
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
  IRemoteAudioTrack,
  type IAgoraRTCRemoteUser,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack
} from 'agora-rtc-sdk-ng/esm';
import axios from 'axios';
import MicrophoneStream from 'microphone-stream';
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand
} from '@aws-sdk/client-transcribe-streaming';
import { useSpeechRecognition } from '@vueuse/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BarChart from '@/components/BarChart.vue';
import { createDeepgram } from '@/lib/deepgram';
import { createTranscribeClient, startTranscribe, createMicStreams } from '@/lib/transcribe';

const isAnalysisOn = ref(false);
let fps = 1;
let analysisInterval: number | NodeJS.Timeout | undefined;
let frameData = ref([]);

async function toggleAnalysis() {
  if (!isAnalysisOn.value) {
    // Start analysis
    // emotionalResponses = []; // Clear previous emotional responses
    analysisInterval = setInterval(captureFrame, 1000 / fps);
  } else {
    // Stop analysis
    clearInterval(analysisInterval);
    // Save emotional responses to a JSON file
    // saveEmotionalResponsesToJson();
  }
  isAnalysisOn.value = !isAnalysisOn.value;
}

async function sendFrameData(imageData: string) {
  try {
    // Send image data to your API Gateway endpoint
    const response = await axios.post(
      'https://di3v6oiwwe.execute-api.us-east-2.amazonaws.com/test/DetectFaces',
      { imageData }
    );
    console.log('Response from server:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending frame data:', (error as any).response.data);
    return error;
  }
}

async function captureFrame() {
  //const videoElement = document.getElementById("remote-video"); uncomment this line to capture frame from remote video feed
  const videoElement = document.getElementById('remote-video'); // Capture frame from local video feed (testing purposes only)
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
  // Send image data to Lambda via API Gateway
  try {
    const emotions = await sendFrameData(imageData);
    frameData.value = emotions;
  } catch (error) {
    console.error('Error sending frame data:', error);
    // Handle error if necessary
  }
}

const appId = import.meta.env.VITE_AGORA_APP_ID;
const route = useRoute();
const channel = route.params.channelName;

// Track the mic/video state - Turn on Mic and Camera On
const micOn = ref(false);
const cameraOn = ref(false);

// Track video feeds
const remoteCameraOn = ref(false);
const remoteMicOn = ref(false);
const cameraAvailable = ref(false);

// Track transcription
const transcribeOn = ref(false);
const transcriptionStatus = ref<string[]>([]);

// Local audio tracks
let localMicrophoneTrack: IMicrophoneAudioTrack | null = null;
let localCameraTrack: ICameraVideoTrack | null = null;

// Remote audio track
let remoteMicrophoneTrack: IRemoteAudioTrack | undefined;

// Speech recongition
// const speechToText = useSpeechRecognition({
//   lang: 'en-US',
//   interimResults: true,
//   continuous: true
// });

// Transcribe
let transcribeClient: TranscribeStreamingClient | undefined;
let remoteMicStream: MicrophoneStream;
let localMicStream: MicrophoneStream;

// Deepgram
let microphone: MediaRecorder | null;

// Agora client info
const client = createClient({ mode: 'rtc', codec: 'vp8' });

async function startTranscription(remoteTrack: MediaStreamTrack, localTrack: MediaStreamTrack) {
  transcribeClient = createTranscribeClient();
  [remoteMicStream, localMicStream] = createMicStreams(remoteTrack, localTrack);
  await startTranscribe(
    transcribeClient,
    remoteMicStream,
    localMicStream,
    transcribeOn,
    transcriptionStatus
  );
}

async function startDeepgram(audioTrack: MediaStreamTrack) {
  microphone = createDeepgram(audioTrack);
  await microphone.start(500);
}

client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
  await client.subscribe(user, mediaType);

  // Handle remote video
  if (mediaType === 'video' && user.videoTrack) {
    user.videoTrack.play('remote-video');
    remoteCameraOn.value = true;
  }
  // Handle remote audio
  if (mediaType === 'audio' && user.audioTrack) {
    user.audioTrack.play();
    remoteMicOn.value = true;
    remoteMicrophoneTrack = user.audioTrack;

    // console.log('starting transcription');
    // await startTranscription(user.audioTrack.getMediaStreamTrack());
  }
});

client.on('user-unpublished', async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
  await client.unsubscribe(user, mediaType);

  if (mediaType === 'video') {
    user.videoTrack?.stop();
    remoteCameraOn.value = false;
  }
  if (mediaType === 'audio') {
    user.audioTrack?.stop();
    remoteMicOn.value = false;
    remoteMicrophoneTrack = undefined;
  }
});

async function toggleMic() {
  if (!localMicrophoneTrack) {
    localMicrophoneTrack = await createMicrophoneAudioTrack();
    await client.publish(localMicrophoneTrack);
  }
  localMicrophoneTrack.setEnabled(!micOn.value);

  // if (micOn.value) {
  //   // Stop speech recognition
  //   speechToText.stop();
  // } else {
  //   // Start speech recognition
  //   if (speechToText.recognition) {
  //     speechToText.recognition.onresult = (event) => {
  //       const transcript = Array.from(event.results)
  //         .map((result) => result[0])
  //         .map((result) => result.transcript)
  //         .join('');
  //       console.log(transcript);
  //     };
  //     speechToText.recognition.onerror = (event) => {
  //       console.error('Speech recognition error', event.error);
  //     };
  //   }
  //   speechToText.start();
  // }

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

async function toggleTranscribe() {
  if (!transcribeOn.value) {
    if (remoteMicrophoneTrack && localMicrophoneTrack) {
      console.log('starting transcription');
      transcribeOn.value = true;
      await startTranscription(
        remoteMicrophoneTrack?.getMediaStreamTrack(),
        localMicrophoneTrack?.getMediaStreamTrack()
      );
      // await startDeepgram(remoteMicrophoneTrack?.getMediaStreamTrack());
    }
  } else {
    console.log('ending transcription');
    transcribeOn.value = false;
    remoteMicStream.stop();
    localMicStream.stop();
    transcribeClient?.destroy();

    // transcribeClient?.destroy();
    // microphone?.stop();

    //call lambda function to summarize the transcript
    // const transcript = transcriptionStatus.value;

    // const response = await axios.post('/api/summarize',{ transcript: transcript });
    // console.log(response.data);
  }
}

async function disconnect() {
  localCameraTrack?.setEnabled(false);
  localMicrophoneTrack?.setEnabled(false);
  localMicrophoneTrack?.stop();
  localCameraTrack?.stop();
  client.leave();
  router.push('/');

  // // trigger lambda function for summarization
  // const response = await axios.post(
  //   'https://di3v6oiwwe.execute-api.us-east-2.amazonaws.com/test/SummarizeTranscript',
  //   { bucket: 'transcription-bucket', key: 'transcript.txt'});
}

const summary = ref('');
async function summarizeTranscript() {
  const response = await axios.post('/api/summarize', { transcript: transcriptionStatus.value });

  if (response.data.error) {
    console.error('Error summarizing transcript:', response.data.error);
  } else {
    summary.value = response.data.summary;
  }
}

onMounted(async () => {
  await client.join(appId, channel as string, null);
  await toggleCamera();
  await toggleMic();
  cameraAvailable.value = true;
});

onUnmounted(async () => {
  localCameraTrack?.setEnabled(false);
  localMicrophoneTrack?.setEnabled(false);
  localMicrophoneTrack?.stop();
  localCameraTrack?.stop();
  client.leave();
});
</script>

<!-- <template>
  <div class="p-8">
    <div class="w-1/4 h-[100vh] absolute right-0">
      <BarChart :frameData="frameData" />
    </div>
    <div class="flex flex-wrap gap-4 items-center">
      <div class="relative w-[25vw] max-w-[720px] min-w-[480px] overflow-hidden">
        <video id="remote-video" class="aspect-[4/3]" />
        <div v-if="remoteCameraOn" class="space-x-2 absolute top-0 right-0 m-3">
          <Button size="icon" @click="toggleAnalysis">
            <Camera v-if="isAnalysisOn" class="size-4" />
            <CameraOff v-else class="size-4" />
          </Button>
          <Button size="icon" v-if="remoteMicOn" @click="toggleTranscribe">
            <Captions v-if="transcribeOn" class="size-4" />
            <CaptionsOff v-else class="size-4" />
          </Button>
          <Button size="icon" @click="summarizeTranscript">
            <NotebookPen class="size-4" />
          </Button>
        </div>
      </div>
    </div>

    <div class="mt-4 space-y-2">
      <h1 class="font-semibold">Room: {{ channel }}</h1>
      <Card v-if="transcriptionStatus.length > 0" class="w-[512px]">
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <p v-for="(item, index) in transcriptionStatus" :key="index">{{ item }}</p>
        </CardContent>
      </Card>

      <Card v-if="summary" class="w-[512px]">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p v-for="(item, index) in summary.split('\n')" :key="index">{{ item }}</p>
        </CardContent>
      </Card>
    </div>

    <div class="w-[50vw] max-w-[480px] min-w-[360px] fixed right-6 bottom-6 m-0">
      <video id="local-video" class="aspect-video" />

      <div v-if="cameraAvailable" class="absolute bottom-0 right-0 m-3 z-[99]">
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
</template> -->

<!-- GPT -->
<template>
  <div class="p-8 flex space-x-2">
    <!-- Video feeds section -->
    <div class="flex flex-1 items-center justify-between space-x-2">
      <div class="flex-1 relative overflow-hidden">
        <!-- Remote video -->
        <video id="remote-video" class="w-full h-auto" />

        <div v-if="remoteCameraOn" class="space-x-2 absolute top-0 right-0 m-3">
          <Button size="icon" @click="toggleAnalysis">
            <Camera v-if="isAnalysisOn" class="size-4" />
            <CameraOff v-else class="size-4" />
          </Button>
          <Button size="icon" v-if="remoteMicOn" @click="toggleTranscribe">
            <Captions v-if="transcribeOn" class="size-4" />
            <CaptionsOff v-else class="size-4" />
          </Button>
          <Button size="icon" @click="summarizeTranscript">
            <NotebookPen class="size-4" />
          </Button>
        </div>
      </div>

      <div class="flex-1 relative overflow-hidden">
        <!-- Local video -->
        <video id="local-video" class="w-full h-auto" />
        <div v-if="cameraAvailable" class="absolute top-0 right-0 m-3">
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

    <!-- Sidebar for transcription and summary -->
    <div class="w-[25vw] min-w-[300px] h-auto overflow-scroll">
      <div class="space-y-2 overflow-y-auto">
        <Card>
          <CardContent class="pt-6">
            <p class="font-semibold text-lg">Room: {{ channel }}</p>
          </CardContent>
        </Card>

        <BarChart :frameData="frameData" />

        <Card v-if="transcriptionStatus.length > 0">
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <p v-for="(item, index) in transcriptionStatus" :key="index">{{ item }}</p>
          </CardContent>
        </Card>

        <Card v-if="summary">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p v-for="(item, index) in summary.split('\n')" :key="index">{{ item }}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
