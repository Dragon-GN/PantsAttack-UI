<template>
  <div id="Room">
    <template v-if="!name">
      <h1>Choose Your Side</h1>
      <section class="versus">
        <button
          class="primary"
          :disabled="room.hasAtlas"
          @click="choose('Atlas')"
        >
          Atlas
        </button>
        <span>VS</span>
        <button
          class="primary"
          :disabled="room.hasDragon"
          @click="choose('Dragon')"
        >
          Dragon
        </button>
      </section>
    </template>
    <template v-else>
      <top-bar></top-bar>
      <GameBoard :width="canvasWidth" :height="canvasHeight"></GameBoard>
      <bot-bar></bot-bar>
    </template>
  </div>
</template>

<script>
import TopBar from "@/components/TopBar.vue";
import GameBoard from "@/components/GameBoard.vue";
import BotBar from "@/components/BotBar.vue";

export default {
  name: "Room",
  components: {
    TopBar,
    GameBoard,
    BotBar
  },
  data() {
    return {
      insult: "",
      canvasHeight: window.innerHeight - 100,
      canvasWidth: window.innerWidth
    };
  },
  mounted() {
    this.$store.dispatch("enterRoom");
    const room = this;
    window.addEventListener("resize", function() {
      room.canvasHeight = window.innerHeight - 100;
      room.canvasWidth = window.innerWidth;
    });
  },
  computed: {
    name: function() {
      return this.$store.getters.name;
    },
    room: function() {
      return this.$store.getters.room;
    }
  },
  methods: {
    choose: function(user) {
      this.$store.dispatch("chooseUser", user);
    }
  },
  watch: {
    room: function(room) {
      if (
        (this.name === "Atlas" && !room.hasAtlas) ||
        (this.name === "Dragon" && !room.hasDragon)
      ) {
        this.$store.commit("setName", null);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
#Room {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.versus {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  button {
    margin: 0 16px;
    width: 92px;
  }
}
</style>
