import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import { enterRoom, chooseUser, leaveRoom } from "@/socket/room.js";

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
    }
  },
  plugins: [persist.plugin]
});
