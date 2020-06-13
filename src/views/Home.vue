<template>
  <div id="Home">
    <template v-if="hasName">
      <p>Hello, {{ name }}!</p>
      <v-btn class="primary" @click="joinRoom">Join Room</v-btn>
    </template>
    <v-text-field
      v-else
      label="Username"
      v-model="name"
      @keydown.enter="submitName"
      append-icon="mdi-send"
      @click:append="submitName"
    ></v-text-field>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      name: null
    };
  },
  mounted: function() {
    this.name = this.$store.getters.name;
  },
  computed: {
    hasName: function() {
      const name = this.$store.getters.name;
      return name !== null;
    }
  },
  methods: {
    submitName: function() {
      this.$store.commit("setName", this.name);
    },
    joinRoom: function() {
      this.$store.dispatch("joinRoom");
      this.$router.push("/room");
    }
  }
};
</script>

<style lang="scss">
#Home .v-input {
  flex: none;
}
</style>

<style lang="scss" scoped>
#Home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
