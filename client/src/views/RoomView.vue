<script setup lang="ts">
import { Button } from '@/components/ui/button';
import router from '@/router';
import {
  Camera,
  Mic,
  MicOff,
  LogOut,
  Video,
  VideoOff,
  Captions,
  CaptionsOff
} from 'lucide-vue-next';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  createClient,
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
  type IAgoraRTCRemoteUser,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
  IRemoteAudioTrack
} from 'agora-rtc-sdk-ng/esm';
import axios from 'axios';
import { useSpeechRecognition } from '@vueuse/core';
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand
} from '@aws-sdk/client-transcribe-streaming';
import MicrophoneStream from 'microphone-stream';

const appId = '696d19cdaaa045ebb4fafe4f9206068e';
const route = useRoute();
const channel = route.params.channelName;

// Track the mic/video state - Turn on Mic and Camera On
const micOn = ref(false);
const cameraOn = ref(false);

// Track video feeds
const remoteCameraOn = ref(false);
const remoteMicOn = ref(false);
const cameraAvailable = ref(false);
const transcribeOn = ref(false);

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

let transcribeClient: TranscribeStreamingClient | undefined;
let micStream: MicrophoneStream;

async function* getAudioStream() {
  // @ts-ignore
  for await (const chunk of micStream) {
    if (chunk.length <= 44100) {
      yield {
        AudioEvent: {
          AudioChunk: encodePCMChunk(chunk)
        }
      };
    }
  }
}

function encodePCMChunk(chunk: Buffer) {
  const input = MicrophoneStream.toRaw(chunk);
  let offset = 0;
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return Buffer.from(buffer);
}
const transcriptionStatus = ref('Transcript:\n');

async function startTranscription(audioTrack: MediaStreamTrack) {
  // Create transcribe client
  transcribeClient = new TranscribeStreamingClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: '', // PUT CREDENTIALS HERE
      secretAccessKey: ''
    }
  });

  micStream = new MicrophoneStream();
  micStream.setStream(new MediaStream([audioTrack]));

  const command = new StartStreamTranscriptionCommand({
    LanguageCode: 'en-US',
    MediaSampleRateHertz: 44100,
    MediaEncoding: 'pcm',
    AudioStream: getAudioStream()
  });

  const data = await transcribeClient.send(command);
  console.log('transcribe command sent');
  (async () => {
    for await (const event of data.TranscriptResultStream!) {
      if (!transcribeOn.value) {
        break;
      }

      // @ts-ignore
      const results = event.TranscriptEvent.Transcript.Results;
      // @ts-ignore
      if (results.length && !results[0]?.IsPartial) {
        // @ts-ignore
        const newTranscript = results[0].Alternatives[0].Transcript;
        console.log(newTranscript);
        transcriptionStatus.value += '\n' ?? '';
        transcriptionStatus.value += newTranscript ?? '';
      }
    }

    transcribeClient = undefined;
  })().catch(console.error);
}

// Agora client info
const client = createClient({ mode: 'rtc', codec: 'vp8' });
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
    if (remoteMicrophoneTrack) {
      console.log('starting transcription');
      transcribeOn.value = true;
      await startTranscription(remoteMicrophoneTrack?.getMediaStreamTrack());
    }
  } else {
    console.log('ending transcription');
    transcribeOn.value = false;
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

<template>
  <div class="p-8">
    <div class="flex flex-wrap gap-4 items-center">
      <div class="relative w-[25vw] max-w-[720px] min-w-[480px] overflow-hidden">
        <video id="remote-video" class="aspect-[4/3]" />
        <div v-if="remoteCameraOn" class="space-x-2 absolute top-0 right-0 m-3">
          <Button size="icon" @click="captureFrame">
            <Camera class="size-4" />
          </Button>
          <Button size="icon" v-if="remoteMicOn" @click="toggleTranscribe">
            <Captions v-if="transcribeOn" class="size-4" />
            <CaptionsOff v-else class="size-4" />
          </Button>
        </div>
      </div>
    </div>
    <h1 class="text-3xl">Room: {{ channel }}</h1>
    <p>{{ transcriptionStatus }}</p>

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
</template>
