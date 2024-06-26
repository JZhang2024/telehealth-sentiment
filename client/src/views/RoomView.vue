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
  NotebookPen,
  Sidebar,
  ScanFace,
  Gauge,
  BarChartBig,
  PieChart as PieChartBig
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
  type IMicrophoneAudioTrack,
  getDevices
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
import VueSpeedometer from 'vue-speedometer';
import { useUserStore } from '@/lib/store';
import PieChart from '@/components/PieChart.vue';

// store for user identity: patient or doctor
const userStore = useUserStore();

const isAnalysisOn = ref(false);
let fps = 5;
let count = 0;
let analysisInterval: number | NodeJS.Timeout | undefined;
const frameData = ref<{ Type: string; Confidence: number; }[]>([]);
const isPieChart = ref(true);

let emptyData = [
    { "Type": "CALM", "Confidence": 0 },
    { "Type": "SAD", "Confidence": 0 },
    { "Type": "SURPRISED", "Confidence": 0 },
    { "Type": "CONFUSED", "Confidence": 0 },
    { "Type": "HAPPY", "Confidence": 0 },
    { "Type": "ANGRY", "Confidence": 0 },
    { "Type": "DISGUSTED", "Confidence": 0 },
    { "Type": "FEAR", "Confidence": 0 }
];

let newData = [
    { "Type": "CALM", "Confidence": 0 },
    { "Type": "SAD", "Confidence": 0 },
    { "Type": "SURPRISED", "Confidence": 0 },
    { "Type": "CONFUSED", "Confidence": 0 },
    { "Type": "HAPPY", "Confidence": 0 },
    { "Type": "ANGRY", "Confidence": 0 },
    { "Type": "DISGUSTED", "Confidence": 0 },
    { "Type": "FEAR", "Confidence": 0 }
];

interface EmotionData {
  Type: string;
  Confidence: string;
  // Add more properties if needed
}

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
  
  count += 1;
  try {
    const emotions: EmotionData[] = await sendFrameData(imageData);

    emotions.forEach(emotion => {
      const index = newData.findIndex(data => data.Type === emotion.Type);
      if (index !== -1) {
        newData[index].Confidence += parseFloat(emotion.Confidence) / fps;
      }
    });
    
    //console.log(count)
    if (count >= fps) {
      console.log("sending data")
      frameData.value = newData
      count = 0
      newData = JSON.parse(JSON.stringify(emptyData));
    }
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

// Track remote user status
const remoteConnected = ref(false);

// Track video feeds
const remoteCameraOn = ref(false);
const remoteMicOn = ref(false);
// const cameraAvailable = ref(false);
const loaded = ref(false);

// UI state
const sidebarOpen = ref(userStore.identity === 'Doctor');
const summary = ref('');
const bs = ref<number | null>(null);
const transcribeOn = ref(false);
const transcriptionStatus = ref<string[]>([]);

// Local audio tracks
let localMicrophoneTrack: IMicrophoneAudioTrack | null = null;
let localCameraTrack: ICameraVideoTrack | null = null;

// Remote audio track
let remoteMicrophoneTrack: IRemoteAudioTrack | undefined;

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

client.on('user-joined', async (user: IAgoraRTCRemoteUser) => {
  console.log('joined:', user);
  remoteConnected.value = true;
});

client.on('user-left', async (user: IAgoraRTCRemoteUser) => {
  console.log('left:', user);
  remoteConnected.value = false;
});

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
    const devices = await getDevices();
    const audioDevices = devices.filter((device) => device.kind === 'audioinput');
    // Check if mic is available
    if (audioDevices.length == 0) {
      return;
    }

    localMicrophoneTrack = await createMicrophoneAudioTrack();
    await client.publish(localMicrophoneTrack);
  }

  localMicrophoneTrack.setEnabled(!micOn.value);
  micOn.value = !micOn.value;
}

async function toggleCamera() {
  if (!localCameraTrack) {
    const devices = await getDevices();
    const videoDevices = devices.filter((device) => device.kind === 'videoinput');
    // Check if camera is available
    if (videoDevices.length == 0) {
      console.log('camera unavailable');
      return;
    }

    // cameraAvailable.value = true;
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
    } else {
      console.log('remote mic and local mic are not both on');
    }
  } else {
    console.log('ending transcription');
    transcribeOn.value = false;
    remoteMicStream.pauseRecording();
    localMicStream.pauseRecording();
    transcribeClient?.destroy();
  }
}

async function disconnect() {
  localCameraTrack?.setEnabled(false);
  localMicrophoneTrack?.setEnabled(false);
  localMicrophoneTrack?.stop();
  localCameraTrack?.stop();
  client.leave();
  router.push('/');
}

async function summarizeTranscript() {
  try {
    const endpoint = userStore.identity === 'Patient' ? 'prescribe' : 'feedback';
    const response = await axios.post(
      `https://1dhs1a0o4l.execute-api.us-east-1.amazonaws.com/prod/${endpoint}`,
      { transcript: transcriptionStatus.value.join('\n') }
    );
    console.log(response);
    if (response.status !== 200) {
      console.error('Error summarizing transcript');
    } else {
      summary.value = response.data;
      console.log(summary.value);
    }
  } catch (error) {
    console.error('Error calling Lambda function:', error);
  }
}

async function bullshitMeter() {
  try {
    const response = await axios.post(
      'https://1dhs1a0o4l.execute-api.us-east-1.amazonaws.com/prod/bullshit',
      { transcript: transcriptionStatus.value.join('\n') }
    );
    console.log(response);
    if (response.status !== 200) {
      console.error('Error summarizing transcript');
    } else {
      bs.value = Number(response.data);
      console.log(summary.value);
    }
  } catch (error) {
    console.error('Error calling Lambda function:', error);
  }
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function toggleChartType() {
  isPieChart.value = !isPieChart.value;
}

onMounted(async () => {
  await client.join(appId, channel as string, null);
  await toggleCamera();
  await toggleMic();
  loaded.value = true;
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
  <div class="flex flex-col h-screen bg-neutral-800">
    <div class="p-8 flex flex-grow space-x-4 overflow-hidden">
      <!-- Video feeds section -->
      <div class="flex flex-1 items-center justify-between space-x-2">
        <div v-if="remoteConnected" class="flex-1 relative overflow-hidden">
          <video
            id="remote-video"
            class="w-full h-auto max-h-[90vh] rounded-lg bg-neutral-700 aspect-[4/3]" />
        </div>

        <div class="flex-1 relative overflow-hidden">
          <video
            :hidden="!cameraOn"
            id="local-video"
            class="w-full h-auto max-h-[90vh] rounded-lg"
            :class="{ 'aspect-video': !remoteConnected, 'aspect-[4/3]': remoteConnected }" />
          <div
            :hidden="cameraOn"
            class="w-full h-auto max-h-[90vh] rounded-lg aspect-[4/3] bg-neutral-700"
            :class="{ 'aspect-video': !remoteConnected, 'aspect-[4/3]': remoteConnected }"></div>
        </div>
      </div>

      <!-- Sidebar for transcription and summary -->
      <div
        v-if="sidebarOpen"
        class="w-[25vw] space-y-2 overflow-y-auto bg-secondary p-4 rounded-lg">
        <Card>
          <CardContent class="pt-6">
            <p class="font-semibold text-lg">Room Code: {{ channel }}</p>
          </CardContent>
        </Card>

        <Card v-if="frameData.length > 0 && userStore.identity === 'Doctor'" class="w-full">
          <CardHeader>
            <CardTitle class="text-lg tracking-normal">Patient Facial Analysis</CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col space-x-2">
            <div class="w-full">
              <PieChart v-if="isPieChart" :frameData="frameData" />
              <BarChart v-else :frameData="frameData" />
            </div>

            <Button size="icon" variant="tertiary" @click="toggleChartType">
              <BarChartBig v-if="isPieChart" class="size-4" />
              <PieChartBig v-else class="size-4" />
            </Button>
          </CardContent>
        </Card>

        <!-- <Card>
          <CardHeader>
            <CardTitle class="text-lg tracking-normal">Transcription</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              v-if="transcriptionStatus.length > 0"
              v-for="(item, index) in transcriptionStatus"
              :key="index">
              {{ item }}
            </p>
            <div v-else>
              <p>Doctor: Hello!</p>
              <p>Patient: Hey!</p>
              <p>Doctor: Hello!</p>
              <p>Patient: Hey!</p>
              <p>Doctor: Hello!</p>
              <p>Patient: Hey!</p>
              <p>Doctor: Hello!</p>
              <p>Patient: Hey!</p>
              <p>Doctor: Hello!</p>
              <p>Patient: Hey!</p>
              <p>Doctor: Hello!</p>
              <p>Patient: Hey!</p>
              <p>Doctor: Hello!</p>
              <p>Patient: Hey!</p>
              <p>Doctor: Hello!</p>
              <p>Patient: Hey!</p>
            </div>
          </CardContent>
        </Card> -->

        <Card v-if="bs && userStore.identity === 'Doctor'">
          <CardHeader>
            <CardTitle class="text-lg tracking-normal">BS Meter</CardTitle>
          </CardHeader>
          <CardContent class="pt-6 pb-0">
            <VueSpeedometer
              :maxValue="10"
              :value="bs"
              :segments="10"
              :needleColor="'black'"
              :startColor="'green'"
              :endColor="'red'"
              :height="200"
              :width="300" />
          </CardContent>
        </Card>

        <Card v-if="summary && userStore.identity === 'Patient'">
          <CardHeader>
            <CardTitle class="text-lg tracking-normal">AI Doctor's Note</CardTitle>
          </CardHeader>
          <CardContent>
            <p v-for="(item, index) in summary.split('\n')" :key="index">
              {{ item }}
            </p>
          </CardContent>
        </Card>

        <Card v-if="summary && userStore.identity === 'Doctor'">
          <CardHeader>
            <CardTitle class="text-lg tracking-normal">AI Feedback for Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            <p v-for="(item, index) in summary.split('\n')" :key="index">
              {{ item }}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>

    <div class="w-full py-4 flex justify-between px-8">
      <div class="justify-start space-x-3 dark">
        <p class="font-medium text-primary">{{ userStore.identity }}</p>
      </div>

      <div class="justify-center space-x-3">
        <Button size="icon" @click="toggleMic" :variant="micOn ? 'secondary' : 'destructive'">
          <Mic v-if="micOn" class="size-4" />
          <MicOff v-else class="size-4" />
        </Button>
        <Button size="icon" @click="toggleCamera" :variant="cameraOn ? 'secondary' : 'destructive'">
          <Video v-if="cameraOn" class="size-4" />
          <VideoOff v-else class="size-4" />
        </Button>

        <Button
          size="icon"
          @click="toggleTranscribe"
          :variant="transcribeOn ? 'secondary' : 'tertiary'"
          :disabled="!remoteConnected">
          <Captions v-if="transcribeOn" class="size-4" />
          <CaptionsOff v-else class="size-4" />
        </Button>
        <Button
          v-if="userStore.identity === 'Doctor'"
          size="icon"
          @click="toggleAnalysis"
          :variant="isAnalysisOn ? 'secondary' : 'tertiary'"
          :disabled="!remoteConnected">
          <ScanFace class="size-4" />
        </Button>
        <Button
          v-if="userStore.identity === 'Doctor'"
          size="icon"
          @click="bullshitMeter"
          variant="tertiary"
          :disabled="!remoteConnected">
          <Gauge class="size-4" />
        </Button>
        <Button
          size="icon"
          @click="summarizeTranscript"
          variant="tertiary"
          :disabled="!remoteConnected">
          <NotebookPen class="size-4" />
        </Button>
      </div>

      <div class="justify-end space-x-3">
        <Button size="icon" @click="toggleSidebar" variant="tertiary">
          <Sidebar class="size-4" />
        </Button>
        <Button size="icon" variant="destructive" @click="disconnect">
          <LogOut class="size-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
