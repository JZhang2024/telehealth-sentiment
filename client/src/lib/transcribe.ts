import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand
} from '@aws-sdk/client-transcribe-streaming';
import MicrophoneStream from 'microphone-stream';
import { Ref } from 'vue';

export const SAMPLE_RATE = 41000;

export function createTranscribeClient(): TranscribeStreamingClient {
  return new TranscribeStreamingClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID!,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!
    }
  });
}

export function createMicStreams(
  remoteTrack: MediaStreamTrack,
  localTrack: MediaStreamTrack
): [MicrophoneStream, MicrophoneStream] {
  const remoteMicStream = new MicrophoneStream();
  const localMicStream = new MicrophoneStream();
  remoteMicStream.setStream(new MediaStream([remoteTrack]));
  localMicStream.setStream(new MediaStream([localTrack]));

  return [remoteMicStream, localMicStream];
}

export async function startTranscribe(
  client: TranscribeStreamingClient,
  remoteMicStream: MicrophoneStream,
  localMicStream: MicrophoneStream,
  transcribeOn: Ref<boolean>,
  transcriptionStatus: Ref<string[]>
) {
  const command = new StartStreamTranscriptionCommand({
    LanguageCode: 'en-US',
    MediaSampleRateHertz: SAMPLE_RATE,
    MediaEncoding: 'pcm',
    AudioStream: getAudioStreamDual(remoteMicStream, localMicStream),
    EnableChannelIdentification: true,
    NumberOfChannels: 2
  });

  const data = await client.send(command);
  console.log('transcribe command sent');
  (async () => {
    for await (const event of data.TranscriptResultStream!) {
      if (!transcribeOn.value) {
        break;
      }

      const results = event.TranscriptEvent?.Transcript?.Results;
      if (!results) {
        continue;
      }

      for (const res of results) {
        if (!res.IsPartial) {
          console.log(res);

          const speaker = res.ChannelId === 'ch_1' ? 'Doctor' : 'Patient';
          const transcript = res.Alternatives?.map((alt) => alt.Transcript).join(' ');
          console.log(`${speaker}: ${transcript}`);

          transcriptionStatus.value.push(`${speaker}: ${transcript}`);
        }
      }
    }

    // Stop transcribe
    // client.destroy();
    // client = undefined;
    console.log('exiting transcribe loop');
  })().catch(console.error);
}

export async function* getAudioStreamDual(
  remoteMicStream: MicrophoneStream,
  localMicStream: MicrophoneStream
) {
  const [remoteIterator, localIterator] = [
    // @ts-ignore
    remoteMicStream[Symbol.asyncIterator](),
    // @ts-ignore
    localMicStream[Symbol.asyncIterator]()
  ];
  while (true) {
    const [remoteRes, localRes] = await Promise.all([remoteIterator.next(), localIterator.next()]);
    if (remoteRes.done || localRes.done) break;

    const remoteChunk = remoteRes.value;
    const localChunk = localRes.value;

    // Assuming both chunks have the same length
    if (remoteChunk.length <= SAMPLE_RATE && localChunk.length <= SAMPLE_RATE) {
      yield {
        AudioEvent: {
          AudioChunk: encodePCMChunkDual(remoteChunk, localChunk)
        }
      };
    }
  }
}

export function encodePCMChunkDual(remoteChunk: Buffer, localChunk: Buffer) {
  const remoteInput = MicrophoneStream.toRaw(remoteChunk);
  const localInput = MicrophoneStream.toRaw(localChunk);
  const buffer = new ArrayBuffer(remoteInput.length * 4); // 2 channels * 2 bytes per sample
  const view = new DataView(buffer);

  for (let i = 0, offset = 0; i < remoteInput.length; i++, offset += 4) {
    let s1 = Math.max(-1, Math.min(1, remoteInput[i]));
    let s2 = Math.max(-1, Math.min(1, localInput[i]));
    view.setInt16(offset, s1 < 0 ? s1 * 0x8000 : s1 * 0x7fff, true);
    view.setInt16(offset + 2, s2 < 0 ? s2 * 0x8000 : s2 * 0x7fff, true);
  }

  return Buffer.from(buffer);
}

async function* getAudioStream() {
  // @ts-ignore
  for await (const chunk of micStream) {
    if (chunk.length <= SAMPLE_RATE) {
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
