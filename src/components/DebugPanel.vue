<script setup>
import { ref } from 'vue';
import { fontsDatabase, activeFontId } from '../config/fontConfig';

const isOpen = ref(false);

const togglePanel = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div class="debug-toggle-btn" @click="togglePanel" :class="{ 'is-open': isOpen }">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"></line>
      <line x1="4" y1="10" x2="4" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12" y2="3"></line>
      <line x1="20" y1="21" x2="20" y2="16"></line>
      <line x1="20" y1="12" x2="20" y2="3"></line>
      <line x1="1" y1="14" x2="7" y2="14"></line>
      <line x1="9" y1="8" x2="15" y2="8"></line>
      <line x1="17" y1="16" x2="23" y2="16"></line>
    </svg>
  </div>

  <transition name="fade-slide">
    <div class="debug-panel" v-if="isOpen">
      <div class="header">
        <h3>Typography Lab</h3>
        <button class="close-btn" @click="togglePanel">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="control-group">
        <label>Active Typeface</label>
        <div class="select-wrapper">
          <select v-model="activeFontId">
            <option v-for="(config, id) in fontsDatabase" :key="id" :value="id">
              {{ config.name }}
            </option>
          </select>
          <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>

      <div class="axes-info">
        <h4>Variation Axes (Detected)</h4>
        <div class="axes-list">
          <div v-for="(bounds, axis) in fontsDatabase[activeFontId].axes" :key="axis" class="axis-item">
            <span class="axis-name">{{ axis }}</span>
            <div class="axis-value-bar">
              <span class="axis-bounds min">{{ bounds.min }}</span>
              <div class="bar-track"></div>
              <span class="axis-bounds max">{{ bounds.max }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.debug-toggle-btn {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 52px;
  height: 52px;
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.debug-toggle-btn:hover {
  transform: scale(1.05) translateY(-2px);
  background: rgba(40, 40, 40, 0.8);
  border-color: rgba(255, 141, 161, 0.5); /* #FF8DA1 with opacity */
  color: #FF8DA1;
  box-shadow: 0 12px 28px rgba(0,0,0,0.2), 0 0 15px rgba(255, 141, 161, 0.2);
}

.debug-toggle-btn.is-open {
  transform: rotate(90deg) scale(0.9);
  opacity: 0;
  pointer-events: none;
}

.debug-panel {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 320px;
  background: rgba(18, 18, 20, 0.75);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  color: #f5f5f7;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  z-index: 9999;
  box-shadow: 0 24px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05) inset;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: #fff;
}

.close-btn {
  background: rgba(255,255,255,0.05);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a1a1a6;
  cursor: pointer;
  transition: all 0.2s ease;
}
.close-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.control-group {
  margin-bottom: 24px;
}

.control-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #86868b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.select-wrapper {
  position: relative;
}

select {
  appearance: none;
  width: 100%;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

select:hover {
  background: rgba(255,255,255,0.02);
  border-color: rgba(255, 255, 255, 0.15);
}

select:focus {
  border-color: #FF8DA1;
  background: rgba(255, 141, 161, 0.05);
}

.dropdown-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #86868b;
}

.axes-info h4 {
  margin: 0 0 16px 0;
  font-size: 12px;
  font-weight: 500;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
}
.axes-info h4::after {
  content: '';
  flex-grow: 1;
  height: 1px;
  background: rgba(255,255,255,0.08);
  margin-left: 12px;
}

.axes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.axis-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.axis-name {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: #FF8DA1;
  background: rgba(255, 141, 161, 0.1);
  padding: 4px 6px;
  border-radius: 4px;
  font-weight: 600;
  width: 44px;
  text-align: center;
}

.axis-value-bar {
  flex-grow: 1;
  margin-left: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar-track {
  flex-grow: 1;
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  position: relative;
}

.axis-bounds {
  font-size: 11px;
  color: #6e6e73;
  font-weight: 500;
  min-width: 24px;
}
.axis-bounds.min { text-align: right; }
.axis-bounds.max { text-align: left; }
</style>
