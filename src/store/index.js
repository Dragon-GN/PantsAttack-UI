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
    room: {},
    path: [],
    action: null
  },
  getters: {
    name: state => state.name,
    room: state => state.room,
    lastTurn: state => state.room.lastTurn,
    path: state => state.path,
    action: state => state.action
  },
  mutations: {
    reset(state) {
      state.name = null;
      state.room = {};
      state.path = [];
      state.action = null;
    },
    setName(state, name) {
      state.name = name;
    },
    setRoom(state, room) {
      state.room = { ...room };
    },
    setPath(state, path) {
      state.path = [...path];
    },
    setAction(state, action) {
      state.action = action;
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
    },
    move({ getters }) {
      const path = getters.path;
      const from = path[0];
      const to = path[path.length - 1];
      act(ROOM_SEND_EVENT.MOVE, { from, to });
    }
  },
  plugins: [persist.plugin]
});
