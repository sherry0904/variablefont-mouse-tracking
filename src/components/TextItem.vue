<script setup>
import { fontsDatabase, activeFontId } from '../config/fontConfig';

defineProps({
  char: { type: String, required: true },
  x:    { type: Number, required: true },
  y:    { type: Number, required: true },
  baseSize: { type: Number, default: 3 },
  color:    { type: String, default: '#333' },
});
</script>

<template>
  <div
    class="text-item trackable-item"
    :style="{
      left: x + '%',
      top: y + '%',
      fontSize: baseSize + 'rem',
      color: color,
      fontFamily: fontsDatabase[activeFontId].family
    }"
  >{{ char }}</div>
</template>

<style scoped>
.text-item {
  position: absolute;
  transform: translate(-50%, -50%);
  transform-origin: center center;
  user-select: none;
  white-space: nowrap;
  line-height: 1;
  /* GPU layer hint for smooth 60fps animation */
  will-change: transform, font-variation-settings;
}
</style>
