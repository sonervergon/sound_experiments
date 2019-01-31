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
                <b-field label="File Name">
                  <b-input v-model="fileName" rounded></b-input>
                </b-field>
                <a
                  @click="init"
                  style="margin-left:10px;"
                  class="button is-primary"
                  >Init</a
                >
                <a @click="startRecording" class="button is-primary"
                  >Record Sound</a
                >
                <a
                  @click="analyseSound"
                  style="margin-left:10px;"
                  class="button is-primary"
                  >Analyse Sound</a
                >
              </div>
            </div>
            <div class="column"></div>
            <b-loading
              :is-full-page="true"
              :active.sync="isLoading"
              :can-cancel="false"
            ></b-loading>
            <b-message title="Error messages" :active.sync="isActive">
              <div v-html="errorMessage"></div>
            </b-message>
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
export default {
  name: "app",
  data: () => {
    return {
      errorMessage: "",
      isActive: true,
      fileName: "sound_",
      isLoading: false
    };
  },
  methods: {
    analyseSound() {
      this.recorder.stop();
    },
    startRecording() {
      this.recorder.start();
    },
    downloadFile() {
      saveAs();
    },
    init() {
      // Init audio context
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
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
            message: "Uploading data!",
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
                  this.$toast.open({
                    message: "Done!",
                    type: "is-success"
                  });
                });
            });
        });
      };

      const navigator = navigator || window.navigator;
      // Init recorder
      console.log(navigator.mediaDevices.getSupportedConstraints());
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
          this.recorder.ondataavailable = function(e) {
            const arr = reader.readAsArrayBuffer(e.data);
          };
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
