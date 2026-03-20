<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import TextItem from './TextItem.vue';
import { useMouseTracker } from '../composables/useMouseTracker';

const containerRef = ref(null);

const chars = [
  'D','Y','N','A','C','O','M','W',
  'a','r','e','P','k','b','o',
  'F','l','x','R','t','c','n',
  'w','m','p','f','y'
];

// --- Weighted size: mix many medium with a few large ---
function randomSize() {
  const r = Math.random();
  if (r < 0.25) return 2.4 + Math.random() * 1.2;   // small:  2.4–3.6 rem
  if (r < 0.75) return 3.8 + Math.random() * 2.2;   // medium: 3.8–6.0 rem
  return 6.0 + Math.random() * 3.0;                  // large:  6.0–9.0 rem
}

// Pseudo-Poisson disk: generate candidate positions and reject those that are
// too close to an already placed item (in viewport %).
// Each letter's "radius" is approximated from its fontSize (1rem ≈ 2.5% of width).
const placed = [];
const items  = [];
let   idStr  = 0;

const MIN_DIST_REM = 0.55; // tighter gap — letters can breathe but pack better

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

const TARGET = 90; // desired number of letters — denser for visual richness
const MAX_ATTEMPTS = 20000;
let attempts = 0;

// Padding from edges (in %)
const PAD_X = 4;
const PAD_Y = 6;

while (items.length < TARGET && attempts < MAX_ATTEMPTS) {
  attempts++;
  const sz = randomSize();
  const x = PAD_X + Math.random() * (100 - PAD_X * 2);
  const y = PAD_Y + Math.random() * (100 - PAD_Y * 2);

  if (!tooClose(x, y, sz)) {
    placed.push({ x, y, sz });
    items.push({
      id: idStr++,
      char: chars[Math.floor(Math.random() * chars.length)],
      x, y,
      baseSize: sz,
      color: '#FF8DA1',
    });
  }
}

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
