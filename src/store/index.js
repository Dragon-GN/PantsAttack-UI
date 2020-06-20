import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import { enterRoom, chooseUser, leaveRoom, act } from "@/socket/room.js";
import { ROOM_SEND_EVENT } from "@/models/room";

Vue.use(Vuex);

const persist = new VuexPersistence({ storage: sessionStorage });

export default new Vuex.Store({
  state: {
    name: null,
    room: {}
  },
  getters: {
    name: state => state.name,
    room: state => state.room
  },
  mutations: {
    reset(state) {
      state.name = null;
      state.room = {};
    },
    setName(state, name) {
      state.name = name;
    },
    setRoom(state, room) {
      state.room = { ...room };
    }
  },
  actions: {
    enterRoom() {
      enterRoom();
    },
    chooseUser(_, user) {
      chooseUser(user);
    },
    leaveRoom({ commit }) {
      leaveRoom();
      commit("reset");
    },
    initiate() {
      act(ROOM_SEND_EVENT.INITIATE);
    },
    surrender() {
      act(ROOM_SEND_EVENT.SURRENDER);
    },
    pass() {
      act(ROOM_SEND_EVENT.PASS);
    },
    chide(_, insult) {
      act(ROOM_SEND_EVENT.CHIDE, insult);
    }
  },
  plugins: [persist.plugin]
});
