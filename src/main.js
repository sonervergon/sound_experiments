import Vue from "vue";
import App from "./App.vue";
import Buefy from "buefy";
import router from "./router";
import store from "./store";
import "buefy/dist/buefy.css";
import firebase from "firebase/app";
import VR from "vue-resource";

Vue.config.productionTip = false;
Vue.use(Buefy);
Vue.use(VR);

const config = {
  apiKey: "AIzaSyAzOG9VY7WYbmzCe0TsCeBOrgfz2Hxe7RU",
  authDomain: "sound-experiments.firebaseapp.com",
  databaseURL: "https://sound-experiments.firebaseio.com",
  projectId: "sound-experiments",
  storageBucket: "sound-experiments.appspot.com",
  messagingSenderId: "745884563546"
};
firebase.initializeApp(config);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
