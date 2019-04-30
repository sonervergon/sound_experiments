import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Create from "@/components/create_sound";
import Analyse from "@/components/analyse_sound";
import AnalyseIOS from "@/components/ios_analyse";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/sound",
      name: "home",
      component: Home
    },
    {
      path: "/create",
      name: "create",
      component: Create
    },
    {
      path: "/analyse",
      name: "analyse",
      component: Analyse
    },
    {
      path: "/analyse.ios",
      name: "analyse.ios",
      component: AnalyseIOS
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    }
  ]
});
