<script setup>
import ScatterContainer from './components/ScatterContainer.vue';
import DebugPanel from './components/DebugPanel.vue';
</script>

<template>
  <div class="app-wrapper">
    <ScatterContainer />
    <DebugPanel />
  </div>
</template>

<style scoped>
.app-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
