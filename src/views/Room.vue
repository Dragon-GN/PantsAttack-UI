<template>
  <div id="Room">
    <h1>{{ room.name }}</h1>
    <h2>Current Users:</h2>
    <ul v-if="hasUsers">
      <li v-for="user of room.users" :key="user">{{ user }}</li>
    </ul>
    <p v-else>None</p>
    <v-btn class="primary" @click="leaveRoom">Leave</v-btn>
  </div>
</template>

<script>
export default {
  name: "Room",
  computed: {
    name: function() {
      return this.$store.getters.name;
    },
    room: function() {
      return this.$store.getters.room;
    },
    hasUsers: function() {
      return this.room.users ? this.room.users.length > 0 : false;
    }
  },
  methods: {
    leaveRoom: function() {
      this.$store.dispatch("leaveRoom");
      this.$router.push("/");
    }
  },
  watch: {
    room: function(room) {
      if (room.name === undefined) {
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
</style>
