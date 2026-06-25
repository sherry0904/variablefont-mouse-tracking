<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { fontsDatabase, activeFontId, isDevMode } from '../config/fontConfig';

// 依 dev 模式過濾可見字型
const visibleFonts = computed(() =>
  Object.fromEntries(
    Object.entries(fontsDatabase).filter(([, cfg]) => isDevMode || !cfg.devOnly)
  )
);

const isOpen = ref(false);
const isFontSelectorOpen = ref(false);

const togglePanel = () => {
  isOpen.value = !isOpen.value;
  if (!isOpen.value) isFontSelectorOpen.value = false;
};

const toggleFontSelector = (e) => {
  e.stopPropagation();
  isFontSelectorOpen.value = !isFontSelectorOpen.value;
};

const selectFont = (id) => {
  activeFontId.value = id;
  isFontSelectorOpen.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (e) => {
  if (isFontSelectorOpen.value) {
    isFontSelectorOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
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
        <div class="custom-select" :class="{ 'is-active': isFontSelectorOpen }">
          <div class="select-trigger" @click="toggleFontSelector">
            <span class="current-value">{{ fontsDatabase[activeFontId].name }}</span>
            <svg class="dropdown-icon" :class="{ 'is-rotated': isFontSelectorOpen }" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          
          <transition name="dropdown-fade">
            <div class="dropdown-menu" v-if="isFontSelectorOpen" @click.stop>
              <div 
                v-for="(config, id) in visibleFonts" 
                :key="id" 
                class="dropdown-item"
                :class="{ 'is-selected': activeFontId === id }"
                @click="selectFont(id)"
              >
                <span class="item-name">{{ config.name }}</span>
                <svg v-if="activeFontId === id" class="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div class="axes-info">
        <h4>Variation Axes</h4>
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

.select-trigger {
  width: 100%;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-select {
  position: relative;
  z-index: 100;
}

.custom-select:hover .select-trigger {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.custom-select.is-active .select-trigger {
  border-color: #FF8DA1;
  background: rgba(255, 141, 161, 0.05);
  box-shadow: 0 0 0 4px rgba(255, 141, 161, 0.1);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: rgba(28, 28, 30, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.dropdown-item {
  padding: 10px 12px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #e5e5e7;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.dropdown-item.is-selected {
  background: #FF8DA1;
  color: #000;
  font-weight: 600;
}

.dropdown-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #86868b;
}

.dropdown-icon.is-rotated {
  transform: rotate(180deg);
  color: #FF8DA1;
}

.check-icon {
  opacity: 0.8;
}

/* Dropdown Transitions */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
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

@media (max-width: 1024px) {
  .debug-toggle-btn {
    bottom: 20px;
    right: 20px;
  }

  .debug-panel {
    bottom: 20px;
    right: 20px;
    width: min(360px, 92vw);
    max-height: 72dvh;
    overflow-y: auto;
  }
}

@media (max-width: 640px) {
  .debug-toggle-btn {
    width: 46px;
    height: 46px;
    bottom: 14px;
    right: 14px;
  }

  .debug-panel {
    bottom: 14px;
    right: 14px;
    width: calc(100vw - 28px);
    padding: 18px;
    border-radius: 16px;
  }

  .header {
    margin-bottom: 16px;
  }

  .control-group {
    margin-bottom: 16px;
  }
}
</style>
