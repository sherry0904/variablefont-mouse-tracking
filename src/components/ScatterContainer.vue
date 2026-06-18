<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue';
import TextItem from './TextItem.vue';
import { useMouseTracker } from '../composables/useMouseTracker';
import { appConfig } from '../config/appConfig';
import { fontsDatabase, activeFontId } from '../config/fontConfig';

const containerRef = ref(null);

// 優先使用字型自訂的字元子集，否則回退到通用預設集
const getChars = () => fontsDatabase[activeFontId.value].chars || appConfig.defaultChars;

// --- Weighted size: mix many medium with a few large ---
function randomSize() {
  const r = Math.random();
  const s = appConfig.scatter.size;
  
  if (r < s.small.chance) 
    return s.small.min + Math.random() * (s.small.max - s.small.min);
  if (r < s.small.chance + s.medium.chance) 
    return s.medium.min + Math.random() * (s.medium.max - s.medium.min);
  
  return s.large.min + Math.random() * (s.large.max - s.large.min);
}

// Pseudo-Poisson disk: generate candidate positions and reject those that are
// too close to an already placed item (in viewport %).
// Each letter's "radius" is approximated from its fontSize (1rem ≈ 2.5% of width).
const placed = [];
const items  = [];
let   idStr  = 0;

const MIN_DIST_REM = appConfig.scatter.minDistRem;

function tooClose(x, y, sz) {
  for (const p of placed) {
    const minR = (sz + p.sz) * MIN_DIST_REM;
    // Convert rem → % assuming 1rem ≈ 2.5vw for X, 4.2vh for Y
    const minX = minR * 2.5;
    const minY = minR * 4.2;
    const dx = (x - p.x) / minX;
    const dy = (y - p.y) / minY;
    if (dx * dx + dy * dy < 1) return true;
  }
  return false;
}

const TARGET = appConfig.scatter.targetCount;
const MAX_ATTEMPTS = 50000;
let attempts = 0;

// Padding from edges (in %)
const PAD_X = 4;
const PAD_Y = 6;

const currentChars = getChars();

while (items.length < TARGET && attempts < MAX_ATTEMPTS) {
  attempts++;
  const sz = randomSize();
  const x = PAD_X + Math.random() * (100 - PAD_X * 2);
  const y = PAD_Y + Math.random() * (100 - PAD_Y * 2);

  if (!tooClose(x, y, sz)) {
    placed.push({ x, y, sz });
    items.push({
      id: idStr++,
      char: currentChars[Math.floor(Math.random() * currentChars.length)],
      x, y,
      baseSize: sz,
      color: '#FF8DA1',
    });
  }
}

// 監聽字型標籤改變時，重新分配對應支援的字母給所有的 TextItem
watch(activeFontId, () => {
  const newChars = getChars();
  items.forEach(item => {
    item.char = newChars[Math.floor(Math.random() * newChars.length)];
  });
});

const { initTracker, destroyTracker } = useMouseTracker();

onMounted(() => {
  if (containerRef.value) initTracker(containerRef.value);
});
onBeforeUnmount(() => destroyTracker());
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
  background-color: #FFF9F2;
  position: relative;
}
</style>
