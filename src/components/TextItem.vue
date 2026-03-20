<script setup>
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

  /* use Roboto Flex Variable (local fontsource) */
  font-family: 'Roboto Flex Variable', 'Roboto Flex', sans-serif;

  /* CSS variables driven by physics engine */
  --wght: 400;
  --wdth: 100;
  --GRAD: 0;
  --slnt: 0;
  --XOPQ: 96;
  --YOPQ: 79;
  --XTRA: 468;
  --opsz: 14;

  font-variation-settings:
    'wght' var(--wght),
    'wdth' var(--wdth),
    'GRAD' var(--GRAD),
    'slnt' var(--slnt),
    'XOPQ' var(--XOPQ),
    'YOPQ' var(--YOPQ),
    'XTRA' var(--XTRA),
    'opsz' var(--opsz);
}
</style>
