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
              <a @click="toggleSound" class="button is-success">Toggle sound</a>
            </div>
            <div class="block">
              <b-radio v-model="selectedNode" native-value="1">
                Node 1
              </b-radio>
              <b-radio v-model="selectedNode" native-value="2">
                Node 2
              </b-radio>
              <b-radio v-model="selectedNode" native-value="3">
                Node 3
              </b-radio>
              <b-radio v-model="selectedNode" native-value="4">
                Node 4
              </b-radio>
              <b-radio v-model="selectedNode" native-value="5">
                Node 5
              </b-radio>
              <b-radio v-model="selectedNode" native-value="6">
                Node 6
              </b-radio>
            </div>
          </div>
          <div class="column"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "app",
  data: () => {
    return {
      frequency: 1000,
      selectedNode: "1"
    };
  },
  methods: {
    toggleSound() {
      const { sound, selectedNode } = this;
      const osccilator = this.nodes[selectedNode].osccilator;
      console.log(osccilator);
      if (!this.nodes[selectedNode].active) {
        this.nodes[selectedNode].osccilator.type = "sine";
        this.nodes[selectedNode].osccilator.frequency.value = this.frequency;
        try {
          this.nodes[selectedNode].osccilator.start(0);
        } catch (e) {
          this.nodes[selectedNode].osccilator.stop(0);
        }
        this.nodes[selectedNode].osccilator.connect(this.context.destination);
        this.nodes[selectedNode].active = true;
        console.log("On");
      } else {
        console.log("Off");
        this.nodes[selectedNode].osccilator.stop(0);
        this.nodes[selectedNode] = {
          osccilator: this.context.createOscillator(),
          active: false
        };
      }
    }
  },
  beforeMount() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();
    this.nodes = {
      "1": {
        osccilator: this.context.createOscillator(),
        active: false
      },
      "2": {
        osccilator: this.context.createOscillator(),
        active: false
      },
      "3": {
        osccilator: this.context.createOscillator(),
        active: false
      },
      "4": {
        osccilator: this.context.createOscillator(),
        active: false
      },
      "5": {
        osccilator: this.context.createOscillator(),
        active: false
      },
      "6": {
        osccilator: this.context.createOscillator(),
        active: false
      }
    };
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
