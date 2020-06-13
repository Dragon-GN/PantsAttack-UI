<template>
  <v-app>
    <router-view class="view" />
  </v-app>
</template>

<script>
export default {
  name: "App"
};
</script>

<style lang="scss">
.view {
  min-height: inherit;
  max-width: inherit;
}
</style>
