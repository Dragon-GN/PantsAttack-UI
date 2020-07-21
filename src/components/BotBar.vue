<template>
  <section id="bot-bar">
    <template v-if="inPlay && isPlayer" class="round-action">
      <button v-if="roundStart" class="primary" @click="takeInitiative">
        Take Initiative
      </button>
      <template v-else-if="yourTurn" class="turn-action">
        <!-- <input class="duo" type="text" v-model="insult" @keydown.enter="chide"/>
        <button class="duo primary" @click="chide">Chide</button> -->
        <button class="primary dark" @click="attack" :disabled="isEnemyClose">
          Attack
        </button>
        <button class="primary dark" @click="move" :disabled="isPathEmpty">
          Move
        </button>
        <button class="secondary" @click="pass">Pass</button>
        <!-- <button class="accent" @click="surrender">Surrender</button> -->
      </template>
    </template>
  </section>
</template>

<script>
export default {
  name: "BotBar",
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
    },
    isPathEmpty: function() {
      const path = this.$store.getters.path;
      return path.length === 0;
    },
    isEnemyClose: function() {
      const atlasPos = this.room.board["Atlas"];
      const dragonPos = this.room.board["Dragon"];
      const distance = Math.sqrt(
        (atlasPos.x - dragonPos.x) ** 2 + (atlasPos.z - dragonPos.z)
      );
      return distance > 0.5 && distance < 2;
    }
  },
  methods: {
    takeInitiative: function() {
      this.$store.dispatch("initiate");
    },
    chide: function() {
      this.$store.dispatch("chide", this.insult);
      this.insult = "";
    },
    attack: function() {
      this.$store.dispatch("attack");
    },
    move: function() {
      this.$store.dispatch("move");
    },
    pass: function() {
      this.$store.dispatch("pass");
    },
    surrender: function() {
      this.$store.dispatch("surrender");
    }
  }
};
</script>

<style lang="scss" scoped>
#bot-bar {
  height: 50px;
  width: 100%;
  background-color: black;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
input.duo {
  border: 1px solid $primary;
  border-right: 0;
  border-radius: 4px 0 0 4px;
  outline: none;
  margin-right: 0;
  &:focus {
    border-width: 2px;
  }
}
button.duo {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-left: 0;
}
</style>
