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
      <button class="secondary" @click="choose('Observer')">Observer</button>
    </template>
    <template v-else>
      <h1>Welcome, {{ name }}</h1>
      <button class="secondary" @click="leaveRoom">Leave</button>
      <BasicPants :agent="name"></BasicPants>
      <h2>{{ room.narration }}</h2>
      <section v-if="inPlay && isPlayer" class="round-action">
        <button v-if="roundStart" class="primary" @click="takeInitiative">
          Take Initiative
        </button>
        <div v-else-if="yourTurn" class="turn-action">
          <div class="row">
            <input type="text" v-model="insult" @keydown.enter="chide" />
            <button class="primary" @click="chide">Chide</button>
          </div>
          <div class="row">
            <button class="primary" @click="pass">Pass</button>
            <button class="primary" @click="surrender">Surrender</button>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import BasicPants from "@/components/BasicPants.vue";

export default {
  name: "Room",
  components: { BasicPants },
  data() {
    return {
      insult: ""
    };
  },
  mounted() {
    this.$store.dispatch("enterRoom");
  },
  computed: {
    name: function() {
      return this.$store.getters.name;
    },
    room: function() {
      return this.$store.getters.room;
    },
    inPlay: function() {
      return this.room.gameState === "Playing Game";
    },
    isPlayer: function() {
      return this.name === "Atlas" || this.name === "Dragon";
    },
    roundStart: function() {
      const round = this.room.currentRound;
      return !!round && round.initiative === null;
    },
    yourTurn: function() {
      const round = this.room.currentRound;
      const turn = round.turns[round.turns.length - 1];
      return !!turn && turn.agent === this.name;
    }
  },
  methods: {
    choose: function(user) {
      this.$store.dispatch("chooseUser", user);
    },
    leaveRoom: function() {
      this.$store.dispatch("leaveRoom");
      this.$router.push("/");
    },
    takeInitiative: function() {
      this.$store.dispatch("initiate");
    },
    chide: function() {
      this.$store.dispatch("chide", this.insult);
      this.insult = "";
    },
    pass: function() {
      this.$store.dispatch("pass");
    },
    surrender: function() {
      this.$store.dispatch("surrender");
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
.row {
  text-align: center;
  & > * {
    margin: 4px;
  }
}
</style>
