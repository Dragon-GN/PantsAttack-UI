import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";
import Home from "@/views/Home.vue";
import Room from "@/views/Room.vue";

Vue.use(VueRouter);

const ROUTE_VIEWS = Object.freeze({
  HOME: "Home",
  ROOM: "Room"
});

const routes = [
  {
    path: "/",
    name: ROUTE_VIEWS.HOME,
    component: Home
  },
  {
    path: "/room",
    name: ROUTE_VIEWS.ROOM,
    component: Room
  }
];

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  if (to.name === ROUTE_VIEWS.ROOM && from.name === null) {
    store.commit("setRoom", {});
    next({ name: ROUTE_VIEWS.HOME });
  } else {
    next();
  }
});

export default router;
