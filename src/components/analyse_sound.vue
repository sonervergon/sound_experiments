<template>
  <div class="">
    <section class="hero is-info has-text-centered is-fullheight">
      <div class="hero-body">
        <div class="container">
          <p class="title"></p>
          <div class="columns">
            <div class="column"></div>
            <div class="column">
              <div class="section">
                <b-field class="has-text-danger" label="File Name">
                  <b-input v-model="fileName" rounded></b-input>
                </b-field>
                <div style="margin-top: 20px" class="">
                  <a
                    v-if="!initialized"
                    @click="init"
                    style="margin-left:10px;"
                    :class="
                      `button ${
                        this.processing === `Javascript FFT`
                          ? `is-primary`
                          : `is-success`
                      }`
                    "
                    >{{
                      `${
                        this.processing === `Javascript FFT`
                          ? `Record sound`
                          : `Initialize Recorder`
                      }`
                    }}</a
                  >
                </div>
                <div style="margin-top: 20px" class="">
                  <a
                    v-if="!isRecording && this.processing !== `Javascript FFT`"
                    @click="startRecording"
                    class="button is-primary"
                    >Record Sound</a
                  >
                </div>
                <div v-if="isRecording" style="margin-top: 20px" class="">
                  <a
                    @click="stopRecording"
                    style="margin-left:10px;"
                    class="button is-danger"
                    >Upload Sound</a
                  >
                </div>
                <div style="margin-top: 20px" class="">
                  <a
                    @click="reload"
                    style="margin-left:10px;"
                    class="button is-warning"
                    >Reload</a
                  >
                </div>
                <div style="margin-top: 20px">
                  <b-radio v-model="processing" native-value="None">
                    None
                  </b-radio>
                  <b-radio v-model="processing" native-value="FFT">
                    Server FFT
                  </b-radio>
                  <b-radio v-model="processing" native-value="Javascript FFT">
                    Javascript FFT
                  </b-radio>
                </div>
                <div style="margin-top: 20px" class="field">
                  <b-switch v-model="shouldUpload">Upload</b-switch>
                </div>
                <div style="margin-top: 40px" class="">
                  <b-message
                    :closable="false"
                    type="is-success"
                    title="Recorder properties"
                    :active="true"
                  >
                    <div v-html="recorderProperties"></div>
                  </b-message>
                  <b-message
                    :closable="false"
                    type="is-danger"
                    title="Error messages"
                    :active.sync="isActive"
                  >
                    <div v-html="errorMessage"></div>
                  </b-message>
                </div>
              </div>
            </div>
            <div class="column"></div>
            <b-loading
              :is-full-page="true"
              :active.sync="isLoading"
              :can-cancel="false"
            ></b-loading>
          </div>
        </div>
      </div>
    </section>
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import saveAs from "file-saver";
import { singleSidedSpectraRMS } from "../../scripts/Maths";
import MediaRecorder from "audio-recorder-polyfill";

export default {
  name: "app",
  data: () => {
    return {
      errorMessage: "",
      isActive: true,
      fileName: "sound_",
      isLoading: false,
      isRecording: false,
      initialized: false,
      recorderProperties: "",
      processing: "None",
      shouldUpload: false
    };
  },
  methods: {
    stopRecording() {
      this.recorder.stop();
      this.isRecording = false;
    },
    startRecording() {
      this.isRecording = true;
      this.$toast.open({
        message: "Recording!"
      });
      this.recorder.start();
    },
    downloadFile() {
      saveAs();
    },
    reload() {
      location.reload();
    },
    init() {
      // Init audio context
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.recorderProperties = `
        <p>Latency: ${this.audioCtx.baseLatency}</p>
        <p>Sample Rate: ${this.audioCtx.sampleRate}</p>
        <p>Number of output channels: ${
          this.audioCtx.destination.channelCount
        }</p>
        <p>Platform: ${window.navigator.platform}</p>
      `;
      const reader = new FileReader();
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
      // Init recorder
      this.recorderProperties = `
        <p>Latency: ${this.audioCtx.baseLatency}</p>
        <p>Sample Rate: ${this.audioCtx.sampleRate}</p>
        <p>Number of output channels: ${
          this.audioCtx.destination.channelCount
        }</p>
        <p>Platform: ${window.navigator.platform}</p>
      `;
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: false,
          echoCancellation: false,
          noiseSuppression: false
        })
        .then(stream => {
          this.stream = stream;
          this.recorder = new MediaRecorder(stream);
          this.initialized = true;
          this.$toast.open({
            message: "Recorder initialized!"
          });
          if (this.processing === "Javascript FFT") {
            this.isRecording = true;
            const analyser = this.audioCtx.createAnalyser();
            const source = this.audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.connect(this.audioCtx.destination);
            analyser.fftSize = 16384;
            analyser.smoothingTimeConstant = 0.99;
            const canvas = document.getElementById("canvas");
            const canvasCtx = canvas.getContext("2d");
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            const getData = () => {
              canvasCtx.fillStyle = "rgb(200, 200, 200)";
              canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
              canvasCtx.lineWidth = 2;
              canvasCtx.strokeStyle = "rgb(0, 0, 0)";
              canvasCtx.beginPath();
              const sliceWidth = (canvas.width * 1.0) / bufferLength;
              var x = 0;
              for (var i = 0; i < bufferLength; i++) {
                var v = dataArray[i] / 128.0;
                var y = (v * canvas.height) / 2;
                if (i === 0) {
                  canvasCtx.moveTo(x, y);
                } else {
                  canvasCtx.lineTo(x, y);
                }
                x += sliceWidth;
              }
              canvasCtx.lineTo(canvas.width, canvas.height / 2);
              canvasCtx.stroke();
              analyser.getByteFrequencyData(dataArray);
              this.frequencyData = dataArray;
              if (!this.isRecording) {
                const file = this.createBlob(
                  Array.prototype.slice.call(dataArray)
                );
                this.upload(file, {
                  length: dataArray.length,
                  type: file.type,
                  content: "Frequency spectrum",
                  size: file.size,
                  sampleRate: this.audioCtx.sampleRate,
                  channelCount: this.audioCtx.destination.channelCount,
                  platform: window.navigator.platform
                });
              }

              !this.isRecording
                ? cancelAnimationFrame(getData)
                : requestAnimationFrame(getData);
            };
            if (this.isRecording) {
              getData();
            }
          }
          if (this.processing !== "Javascript FFT") {
            this.recorder.addEventListener("dataavailable", e => {
              const arr = reader.readAsArrayBuffer(e.data);
            });
          }
        })
        .catch(e => {});

      reader.onloadend = event => {
        // The contents of the BLOB are in reader.result:
        this.audioCtx.decodeAudioData(reader.result, data => {
          const raw = data.getChannelData(0);
          const rawO = Object.keys(raw).map(d => {
            return raw[d];
          });
          const file = this.createBlob(rawO);
          const metaData = {
            duration: data.duration,
            length: data.length,
            numberOfChannels: data.numberOfChannels,
            sampleRate: data.sampleRate,
            size: file.size,
            type: file.type
          };
          if (this.processing === "FFT") {
            function draw() {}
            this.$http
              .post("http://localhost:5002/test", {
                sampleRate: 44100,
                signal: rawO
              })
              .then(res => {
                let raw = res.body;
                const data = JSON.parse(raw);
                const amplitudeFile = this.createBlob(data.amplitude);
                const frequencyFile = this.createBlob(data.frequencies);
                firebase
                  .storage()
                  .ref()
                  .child(`sounds/${this.fileName}_FREQ.txt`)
                  .put(frequencyFile);
                console.table({ Mean: data.mean, StepLength: data.stepLength });
                console.log(data.amplitude);
                console.log(data.frequencies);
                this.upload(amplitudeFile, metaData);
              });
          } else if (this.processing === "None") {
            this.upload(file, metaData);
          }
        });
      };
    },
    upload(file, metaData) {
      if (this.shouldUpload) {
        this.$toast.open({
          message: "Recording stoped! Uploading data!",
          type: "is-warning"
        });
        this.isLoading = true;
        firebase
          .storage()
          .ref()
          .child(`sounds/${this.fileName}.txt`)
          .put(file)
          .then(snapshot => {
            firebase
              .firestore()
              .collection("sounds")
              .doc()
              .set({
                ...metaData,
                path: snapshot.metadata.fullPath,
                created_at: snapshot.metadata.timeCreated,
                bucket: snapshot.metadata.bucket,
                bytes: snapshot.totalBytes
              })
              .then(() => {
                this.isLoading = false;
                this.isRecording = false;
                this.$toast.open({
                  message: "Done!",
                  type: "is-success"
                });
              });
          });
      }
    },
    createBlob(rawData) {
      const fileData = JSON.stringify(rawData);
      var file = new Blob([fileData], { type: "text/plain" });
      this.file = file;
      return file;
    }
  },
  mounted() {
    window.onerror = (msg, url, linenumber) => {
      this.$toast.open({
        message: "Error!",
        type: "is-danger"
      });
      this.isActive = true;
      this.errorMessage = `
      <p class="has-text-danger">${msg}.</p>
      <p class="has-text-info">Error at line: ${linenumber}.</p>
      <br/><p class="has-text-link">${url}</p>`;
      return true;
    };
  }
};
</script>
<style>
.label {
  color: #fff !important;
}
</style>
