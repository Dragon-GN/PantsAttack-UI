<template>
  <section id="top-bar">
    <h2 class="name">{{ name }}</h2>
    <p class="narration">{{ room.narration }}</p>
    <button class="action accent" @click="leaveRoom">Leave</button>
  </section>
</template>

<script>
export default {
  name: "TopBar",
  computed: {
    name: function() {
      return this.$store.getters.name;
    },
    room: function() {
      return this.$store.getters.room;
    }
  },
  methods: {
    leaveRoom: function() {
      this.$store.dispatch("leaveRoom");
    }
  }
};
</script>

<style lang="scss" scoped>
#top-bar {
  height: 50px;
  width: 100%;
  background-color: black;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  .name {
    flex: 0;
    margin: 0 12px;
  }
  .narration {
    flex: 1;
    text-align: center;
  }
  .action {
    flex: 0;
  }
}
</style>
