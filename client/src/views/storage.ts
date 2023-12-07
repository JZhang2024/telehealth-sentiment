import type { IAgoraRTCClient, SDK_CODEC } from 'agora-rtc-sdk-ng/esm';
import { ref } from 'vue';

const appid = ref(getAppid());
const channel = ref(getChannel());
const videoCodec = ref(getVideoCodec());

const agoraInfo: {
  client?: IAgoraRTCClient;
} = {};

function getAppid() {
  return '696d19cdaaa045ebb4fafe4f9206068e';
}

// function saveAppid() {
//   localStorage.setItem("appid", appid.value);
// }

function getChannel() {
  return 'channel';
}

// function saveChannel() {
//   localStorage.setItem("channel", channel.value);
// }

function getVideoCodec(): SDK_CODEC {
  return 'vp8';
}

// function saveVideoCodec() {
//   localStorage.setItem('videoCodec', videoCodec.value);
// }

export { appid, channel, videoCodec, getAppid, getChannel, getVideoCodec };
export { agoraInfo };
