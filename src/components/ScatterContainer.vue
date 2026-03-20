<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import TextItem from './TextItem.vue';
import { useMouseTracker } from '../composables/useMouseTracker';

const containerRef = ref(null);

const chars = [
  'D', 'Y', 'N', 'A', 'C', 'O', 'M', 'W', 'a', 'r', 'e',
  'P', 'e', 'k', 'b', 'o',
  'F', 'l', 'e', 'x',
  'R', 'b', 't'
];

const items = [];
// Controlled density to allow "melting" space without initial clutter
const cols = 8;  
const rows = 6;  
let idStr = 0;

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    // 85% chance to put letter, prevents crowding but keeps it very full
    if (Math.random() < 0.85) {
      const cellWidth = 100 / cols;
      const cellHeight = 100 / rows;
      
      const baseX = c * cellWidth + (cellWidth / 2);
      const baseY = r * cellHeight + (cellHeight / 2);
      
      // Keep jitter small so they primarily stay in their lane when idle
      const jitterX = (Math.random() - 0.5) * cellWidth * 0.4; 
      const jitterY = (Math.random() - 0.5) * cellHeight * 0.4;
      
      const x = baseX + jitterX;
      const y = baseY + jitterY;
      
      const char = chars[Math.floor(Math.random() * chars.length)];
      // Balanced massive text sizes (2.5rem to 7.0rem)
      const baseSize = 3.0 + Math.random() * 5.0; 
      
      // Using a single "Cute" color as suggested for consistency in melting
      const color = '#FF8DA1'; // Soft pinkish-coral
      
      items.push({ id: idStr++, char, x, y, baseSize, color });
    }
  }
}

const { initTracker, destroyTracker } = useMouseTracker();

onMounted(() => {
  if (containerRef.value) {
    initTracker(containerRef.value);
  }
});

onBeforeUnmount(() => {
  destroyTracker();
});
</script>

<template>
  <div class="scatter-container" ref="containerRef">
    <TextItem 
      v-for="item in items" 
      :key="item.id" 
      :char="item.char"
      :x="item.x"
      :y="item.y"
      :baseSize="item.baseSize"
      :color="item.color"
    />
  </div>
</template>

<style scoped>
.scatter-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  /* Creamy soft background */
  background-color: #FFF9F2;
  position: relative;
}
</style>
