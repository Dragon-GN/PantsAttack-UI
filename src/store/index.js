import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import { joinRoom, leaveRoom } from "../socket/room";

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
    setName(state, name) {
      state.name = name;
    },
    setRoom(state, room) {
      state.room = { ...room };
    }
  },
  actions: {
    joinRoom({ commit, getters }) {
      const name = getters.name;
      const room = joinRoom(name);
      commit("setRoom", room);
    },
    leaveRoom({ commit }) {
      leaveRoom();
      commit("setRoom", {});
    }
  },
  plugins: [persist.plugin]
});
