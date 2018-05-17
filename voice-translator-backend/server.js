const express = require('express');
const app = express();
const port = process.argv[2] || 8080
const record = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');

const client = new speech.SpeechClient({
  keyFilename: './ApiKey_Speech.json'
});

const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

const request = {
  config: {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  },
  interimResults: false,
};

const recognizeStream = client
  .streamingRecognize(request)
  .on('error', console.error)
  .on('data', data =>
    process.stdout.write(
      data.results[0] && data.results[0].alternatives[0]
        ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
        : `\n\nReached transcription time limit, press Ctrl+C\n`
    )
  );

record
  .start({
    sampleRateHertz: sampleRateHertz,
    threshold: 0,
    verbose: false,
    recordProgram: 'rec',
    silence: '10.0',
  })
  .on('error', console.error)
  .pipe(recognizeStream);

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})