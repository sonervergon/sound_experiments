<template>
  <section class="hero is-info has-text-centered is-fullheight">
    <div class="hero-body">
      <div class="container">
        <p class="title"></p>
        <div class="columns">
          <div class="column"></div>
          <div class="column">
            <b-field label="Frequency">
              <b-input v-model="frequency"></b-input>
            </b-field>
            <div class="section">
              <a @click="toggleSound" class="button is-success">{{
                sound ? `Stop` : `Play`
              }}</a>
              <a
                @click="record"
                class="button is-primary"
                style="margin-left:10px;"
                >{{ recording ? `Stop Recording` : `Start Recording` }}</a
              >
              <a
                v-if="audioUrl !== ``"
                @click="play"
                class="button is-primary"
                style="margin-left:10px;"
                >{{ playing ? `Stop Playing` : `Start Playing` }}</a
              >
              <a
                v-if="audioUrl !== ``"
                @click="analyseSound"
                class="button is-primary"
                style="margin-left:10px;"
                >Analyse Sound</a
              >
            </div>
          </div>
          <div class="column"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";

export default {
  name: "app",
  data: () => {
    return {
      frequency: 1000,
      sound: false,
      recording: false,
      audio: [],
      analyserData: [],
      audioBlob: null,
      audioUrl: "",
      playing: false,
      audioSound: null,
      node: null,
      source: null
    };
  },
  methods: {
    toggleSound() {
      const { sound } = this;
      if (!sound) {
        this.osccilatior = this.context.createOscillator();
        this.osccilatior.type = "sine";
        this.osccilatior.frequency.value = this.frequency;
        this.osccilatior.start(0);
        this.osccilatior.connect(this.context.destination);
        this.sound = true;
      } else {
        this.osccilatior.stop(0);
        this.sound = false;
      }
    },
    record() {
      const { recording } = this;
      if (!recording) {
        this.recorder.start();
        this.recorder.addEventListener("dataavailable", event => {
          this.audio.push(event.data);
        });
        this.recorder.addEventListener("stop", () => {
          this.audioBlob = new Blob(this.audio);
          this.audioUrl = URL.createObjectURL(this.audioBlob);
          this.audioSound = new Audio(this.audioUrl);
        });
        this.recording = true;
      } else {
        this.recorder.stop();
        this.recording = false;
      }
    },
    play() {
      const { playing } = this;
      this.audioSound.play();
    },
    analyseSound() {
      console.log(this.context);
      const audioSrc = this.context.createMediaElementSource(this.audioSound);
      const analyser = this.context.createAnalyser();
      // Float32Array should be the same length as the frequencyBinCount
      audioSrc.connect(analyser);
      const myDataArray = new Float32Array(analyser.frequencyBinCount);
      // fill the Float32Array with data returned from getFloatFrequencyData()
      analyser.getFloatFrequencyData(myDataArray);
      console.log(myDataArray);
    }
  },
  mounted() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();
    const constraints = { audio: true, video: false };
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      this.recorder = new MediaRecorder(stream);
    });
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
