<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { fontsDatabase, activeFontId } from '../config/fontConfig';
import { animateConfig } from './animateConfig';
import { useAnimateTracker } from './useAnimateTracker';

const containerRef = ref(null);

const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1440;
const responsive = animateConfig.scatter.responsive || {};
const isMobile = viewportWidth <= (responsive.mobileMaxWidth || 768);
const isTablet = !isMobile && viewportWidth <= (responsive.tabletMaxWidth || 1024);
const responsiveDisplayScale = isMobile
  ? (responsive.mobileDisplayScale || 1)
  : isTablet ? (responsive.tabletDisplayScale || 1) : 1;
const responsiveDensityScale = isMobile
  ? (responsive.mobileDensityScale || 1)
  : isTablet ? (responsive.tabletDensityScale || 1) : 1;

const getChars = () => fontsDatabase[activeFontId.value].chars || animateConfig.defaultChars;

function randomSize() {
  const r = Math.random();
  const s = animateConfig.scatter.size;
  const displayScale = (animateConfig.scatter.displayScale || 1) * responsiveDisplayScale;
  if (r < s.small.chance)
    return (s.small.min + Math.random() * (s.small.max - s.small.min)) * displayScale;
  if (r < s.small.chance + s.medium.chance)
    return (s.medium.min + Math.random() * (s.medium.max - s.medium.min)) * displayScale;
  return (s.large.min + Math.random() * (s.large.max - s.large.min)) * displayScale;
}

const placed = [];
const items  = [];
let   idStr  = 0;

const DENSITY_SCALE = (animateConfig.scatter.densityScale || 1) * responsiveDensityScale;
const MIN_DIST_REM  = animateConfig.scatter.minDistRem / DENSITY_SCALE;

function tooClose(x, y, sz) {
  for (const p of placed) {
    const minR = (sz + p.sz) * MIN_DIST_REM;
    const minX = minR * 2.5;
    const minY = minR * 4.2;
    const dx = (x - p.x) / minX;
    const dy = (y - p.y) / minY;
    if (dx * dx + dy * dy < 1) return true;
  }
  return false;
}

const TARGET       = Math.max(1, Math.round(animateConfig.scatter.targetCount * DENSITY_SCALE));
const MAX_ATTEMPTS = 50000;
let attempts = 0;
const PAD_X = 4;
const PAD_Y = 6;
const currentChars = getChars();

while (items.length < TARGET && attempts < MAX_ATTEMPTS) {
  attempts++;
  const sz = randomSize();
  const x  = PAD_X + Math.random() * (100 - PAD_X * 2);
  const y  = PAD_Y + Math.random() * (100 - PAD_Y * 2);
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

watch(activeFontId, () => {
  const newChars = getChars();
  items.forEach(item => {
    item.char = newChars[Math.floor(Math.random() * newChars.length)];
  });
});

const { initTracker, destroyTracker } = useAnimateTracker();

onMounted(() => {
  if (containerRef.value) initTracker(containerRef.value);
});
onBeforeUnmount(() => destroyTracker());
</script>

<template>
  <div class="scatter-animate" ref="containerRef">
    <div
      v-for="item in items"
      :key="item.id"
      class="text-item trackable-item"
      :style="{
        left: item.x + '%',
        top: item.y + '%',
        fontSize: item.baseSize + 'rem',
        color: item.color,
        fontFamily: fontsDatabase[activeFontId].family,
      }"
    >{{ item.char }}</div>
  </div>
</template>

<style scoped>
.scatter-animate {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background-color: #FFF9F2;
  position: relative;
  touch-action: none;
}

.text-item {
  position: absolute;
  transform: translate(-50%, -50%);
  transform-origin: center center;
  user-select: none;
  white-space: nowrap;
  line-height: 1;
  will-change: transform, font-variation-settings;
}
</style>
