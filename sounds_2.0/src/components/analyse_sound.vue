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
                    class="button is-success"
                    >Initialize Recorder</a
                  >
                </div>
                <div style="margin-top: 20px" class="">
                  <a
                    v-if="!isRecording"
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
  </div>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import saveAs from "file-saver";
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
      recorderProperties: ""
    };
  },
  methods: {
    stopRecording() {
      this.recorder.stop();
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
      reader.onloadend = event => {
        // The contents of the BLOB are in reader.result:
        this.audioCtx.decodeAudioData(reader.result, data => {
          const raw = data.getChannelData(0);
          const rawO = Object.keys(raw).map(d => {
            return raw[d];
          });
          const fileData = JSON.stringify(rawO);
          var file = new Blob([fileData], { type: "text/plain" });
          this.$toast.open({
            message: "Recording stoped! Uploading data!",
            type: "is-warning"
          });
          this.file = file;
          const metaData = {
            duration: data.duration,
            length: data.length,
            numberOfChannels: data.numberOfChannels,
            sampleRate: data.sampleRate,
            size: file.size,
            type: file.type
          };
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
        });
      };
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
          this.recorder.addEventListener("dataavailable", e => {
            const arr = reader.readAsArrayBuffer(e.data);
          });
        })
        .catch(e => {});
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
