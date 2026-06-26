<script setup>
import ScatterContainer from './components/ScatterContainer.vue';
import DebugPanel from './components/DebugPanel.vue';
import { isDevMode } from './config/fontConfig';
</script>

<template>
  <div class="app-wrapper">
    <ScatterContainer />
    <DebugPanel v-if="isDevMode" />
  </div>
</template>

<style scoped>
.app-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}
</style>
