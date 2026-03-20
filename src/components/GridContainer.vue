<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import TextItem from './TextItem.vue';
import { useMouseTracker } from '../composables/useMouseTracker';

const props = defineProps({
  mode: {
    type: String,
    default: 'hide' // 'hide', 'breathe', 'magnet'
  }
});

const containerRef = ref(null);
const gridItems = Array.from({ length: 150 }, (_, i) => "躲貓貓");

const { initTracker, destroyTracker, updateMode } = useMouseTracker();

onMounted(() => {
  if (containerRef.value) {
    // Pass the container which contains all text items to the tracker.
    initTracker(containerRef.value, props.mode);
  }
});

onBeforeUnmount(() => {
  destroyTracker();
});
</script>

<template>
  <div class="grid-container" ref="containerRef">
    <TextItem 
      v-for="(item, index) in gridItems" 
      :key="index" 
      :text="item"
      class="trackable-item"
    />
  </div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 2rem;
  padding: 2rem;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: #111;
  position: relative;
}
</style>
