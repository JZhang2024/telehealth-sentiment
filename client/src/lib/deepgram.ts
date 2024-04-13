import * as deepgram from '@deepgram/sdk';

export function createDeepgram(audioTrack: MediaStreamTrack): MediaRecorder {
  const dgClient = deepgram.createClient(import.meta.env.VITE_DEEPGRAM_API_KEY);
  const connection = dgClient.listen.live({
    model: 'nova-2',
    // interim_results: true,
    smart_format: true
  });

  const microphone = new MediaRecorder(new MediaStream([audioTrack]));

  microphone.onstart = () => {
    console.log('client: microphone opened');
    // document.body.classList.add('recording');
  };

  microphone.onstop = () => {
    console.log('client: microphone closed');
    // document.body.classList.remove('recording');
  };

  microphone.ondataavailable = (e) => {
    const data = e.data;
    // console.log('client: sent data to websocket');
    connection.send(data);
  };

  connection.on(deepgram.LiveTranscriptionEvents.Open, () => {
    console.log('connection established');
    // transcribeOn.value = true;
  });

  connection.on(deepgram.LiveTranscriptionEvents.Close, () => {
    console.log('connection closed');
    // transcribeOn.value = false;
  });

  connection.on(deepgram.LiveTranscriptionEvents.Transcript, (data) => {
    // console.log('raw:', data);
    const words = data.channel.alternatives[0].words;
    const caption = words.map((word: any) => word.punctuated_word ?? word.word).join(' ');
    if (caption !== '') {
      console.log('transciption:', caption);
    }
  });

  return microphone;
}
