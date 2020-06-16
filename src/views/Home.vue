<template>
  <div id="Home">
    <h1>Pants Attack!</h1>
    <button class="primary" @click="enterRoom">Enter</button>
  </div>
</template>

<script>
export default {
  name: "Home",
  methods: {
    enterRoom: function() {
      this.$store.dispatch("enterRoom");
      this.$router.push("/room");
    }
  }
};
</script>

<style lang="scss" scoped>
#Home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
