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
      <BasicPants></BasicPants>
      <button class="primary" @click="leaveRoom">Leave</button>
    </template>
  </div>
</template>

<script>
import BasicPants from "@/components/BasicPants.vue";

export default {
  name: "Room",
  components: { BasicPants },
  computed: {
    room: function() {
      return this.$store.getters.room;
    },
    name: function() {
      return this.$store.getters.name;
    }
  },
  methods: {
    choose: function(user) {
      this.$store.dispatch("chooseUser", user);
    },
    leaveRoom: function() {
      this.$store.dispatch("leaveRoom");
    }
  },
  watch: {
    room: function(room) {
      if (Object.keys(room).length === 0) {
        this.$router.push("/");
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
