import { fontsDatabase, activeFontId } from '../config/fontConfig';
import { animateConfig } from './animateConfig';

const lerp = (a, b, t) => a + (b - a) * t;

// 從 [min, max] 之間取隨機值，bias 偏向 min(0)或 max(1)
function randomInRange(min, max, bias = 0.5) {
  // 用 beta 分布感的 smoothstep 讓值偏向兩端或中間
  const r = Math.random();
  const skewed = Math.pow(r, 1 / (bias === 0.5 ? 1 : bias < 0.5 ? 2 : 0.5));
  return min + skewed * (max - min);
}

// 為每個字母的每個軸計算錯落基準值
// scatter ∈ [0,1]，0 = 全部用 default，1 = 在完整 [min,max] 上均勻隨機
// 重點：直接在整個範圍均勻取樣，不以 default 為中心，
// 否則 default 在邊界的軸（如 wdth min=1, HIGH max=9）會因 clamp 而偏向邊界。
function scatterBaseAxes(axes, scatter) {
  const result = {};
  Object.entries(axes).forEach(([name, bounds]) => {
    const randomVal = bounds.min + Math.random() * (bounds.max - bounds.min);
    // scatter=0 → default；scatter=1 → 完全隨機
    result[name] = bounds.default + (randomVal - bounds.default) * scatter;
  });
  return result;
}

// 每個字母的 active（被滑鼠靠近時的目標）軸值要與 base 不同
// 策略：每個軸往相反方向移動，讓靠近時的變化對比感最大
function computeActiveAxes(axes, baseAxes) {
  const result = {};
  Object.entries(axes).forEach(([name, bounds]) => {
    const base = baseAxes[name];
    const mid = (bounds.min + bounds.max) / 2;
    // 如果 base 偏低，active 就往高；base 偏高就往低
    // 加一點隨機讓每個字不完全對稱
    const flip = base < mid ? 0.7 + Math.random() * 0.3 : -(0.7 + Math.random() * 0.3);
    const range = bounds.max - bounds.min;
    const target = base + flip * range * (0.5 + Math.random() * 0.5);
    result[name] = Math.max(bounds.min, Math.min(bounds.max, target));
  });
  return result;
}

export function useAnimateTracker() {
  let elementsCache = [];
  let animationFrameId = null;
  let mouseX = -9999;
  let mouseY = -9999;
  let touchX = -9999;
  let touchY = -9999;
  let resizeTimeout;
  let resizeHandler = null;
  let activeTouchPointerId = null;
  let touchDragIntensity = 0;

  const calculateBounds = (container) => {
    elementsCache = [];
    const fontConf = fontsDatabase[activeFontId.value];
    const scatter = animateConfig.baseScatter;
    const items = container.querySelectorAll('.trackable-item');

    items.forEach((el) => {
      el.style.transform = 'translate(-50%, -50%)';
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // 每個字母的錯落基準軸（靜止時顯示）
      const baseAxes = scatterBaseAxes(fontConf.axes, scatter);
      // 被滑鼠靠近時的目標軸（往相反方向對比）
      const activeAxes = computeActiveAxes(fontConf.axes, baseAxes);

      // 立刻套用基準軸讓靜止畫面就有錯落感
      const fvsInit = Object.entries(baseAxes)
        .map(([n, v]) => `'${n}' ${v.toFixed(3)}`)
        .join(', ');
      el.style.fontVariationSettings = fvsInit;

      elementsCache.push({
        element: el,
        baseX: cx,
        baseY: cy,
        seed: cx * 0.01 + cy * 0.01,
        baseAxes,
        activeAxes,
        curAxes: { ...baseAxes },
        cur: { tx: 0, ty: 0, rot: 0, vx: 0, vy: 0 },
        // dirty flag：只要軸還在移動就繼續算
        dirty: false,
      });
    });
  };

  const onMouseMove = (e) => {
    if (e.pointerType === 'touch') {
      if (activeTouchPointerId !== e.pointerId) return;
      touchX = e.clientX;
      touchY = e.clientY;
      mouseX = touchX;
      mouseY = touchY;
      return;
    }
    mouseX = e.clientX;
    mouseY = e.clientY;
  };

  const onPointerLeave = () => {
    if (activeTouchPointerId !== null) return;
    mouseX = -9999;
    mouseY = -9999;
  };

  const onPointerDown = (e) => {
    if (e.pointerType !== 'touch') {
      mouseX = e.clientX;
      mouseY = e.clientY;
      return;
    }
    if (activeTouchPointerId !== null) return;
    activeTouchPointerId = e.pointerId;
    touchX = e.clientX;
    touchY = e.clientY;
    mouseX = touchX;
    mouseY = touchY;
  };

  const onPointerUpOrCancel = (e) => {
    if (e.pointerType !== 'touch') return;
    if (activeTouchPointerId !== e.pointerId) return;
    activeTouchPointerId = null;
    mouseX = touchX;
    mouseY = touchY;
  };

  const SETTLED_THRESHOLD = 0.08; // 小於此值視為已靜止

  const tick = (timestamp) => {
    const t = timestamp / 1000;
    const dt = Math.min(timestamp - (tick._last || timestamp), 50) / 1000;
    tick._last = timestamp;

    const LF = 1 - Math.pow(1 - 0.85, dt * 60);
    const pConfig = animateConfig.physics;
    // viewport 相對半徑：手機 390px × 0.38 ≈ 148px，桌機 1440px × 0.38 ≈ 547px
    const RADIUS = window.innerWidth * pConfig.interactionRadiusVw;

    const touchTargetIntensity = activeTouchPointerId !== null ? 1 : 0;
    const touchBlend = touchTargetIntensity ? 0.22 : 0.04;
    touchDragIntensity = lerp(touchDragIntensity, touchTargetIntensity, touchBlend);

    elementsCache.forEach((c) => {
      const dx = mouseX - c.baseX;
      const dy = mouseY - c.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const norm = Math.min(dist / RADIUS, 1);
      // 指數 0.6：衰退更平緩，讓半徑邊緣的字也有明顯反應
      const power = Math.pow(1 - norm, 0.6);
      const magneticPower = power * (activeTouchPointerId !== null || touchDragIntensity > 0 ? touchDragIntensity : 1);

      // --- 閒置漂浮（小幅，不搶軸變化的鏡頭）---
      const idleTx  = Math.cos(t * pConfig.idle.movementSpeedX + c.seed * 1.3) * pConfig.idle.movementAmplitudeX;
      const idleTy  = Math.sin(t * pConfig.idle.movementSpeedY + c.seed)       * pConfig.idle.movementAmplitudeY;
      const idleRot = Math.sin(t * pConfig.idle.rotationSpeed   + c.seed * 2.1) * pConfig.idle.rotationAmplitude;

      const targetTx = idleTx + dx * magneticPower * pConfig.magneticForce;
      const targetTy = idleTy + dy * magneticPower * pConfig.magneticForce;
      const tRot     = idleRot + (dx + dy) * 0.04 * magneticPower; // 微旋轉，力道縮小

      const cur = c.cur;
      cur.rot = lerp(cur.rot, tRot, LF);
      cur.vx += (targetTx - cur.tx) * pConfig.spring;
      cur.vy += (targetTy - cur.ty) * pConfig.spring;
      cur.vx *= pConfig.friction;
      cur.vy *= pConfig.friction;
      cur.tx += cur.vx;
      cur.ty += cur.vy;

      c.element.style.transform = `translate(calc(-50% + ${cur.tx.toFixed(1)}px), calc(-50% + ${cur.ty.toFixed(1)}px)) rotate(${cur.rot.toFixed(2)}deg)`;

      // --- 字型軸：base ↔ active 插值，不再全衝 max ---
      const fvsOpts = [];
      let axisSettled = true;

      Object.keys(c.baseAxes).forEach((name) => {
        const base   = c.baseAxes[name];
        const active = c.activeAxes[name];
        // power ∈ [0,1]，0 = 在 base，1 = 在 active
        const targetVal = lerp(base, active, magneticPower * pConfig.axisMagneticStrength);
        const prev = c.curAxes[name];
        c.curAxes[name] = lerp(prev, targetVal, LF);

        if (Math.abs(c.curAxes[name] - targetVal) > SETTLED_THRESHOLD) axisSettled = false;
        fvsOpts.push(`'${name}' ${c.curAxes[name].toFixed(3)}`);
      });

      c.dirty = !axisSettled;
      c.element.style.fontVariationSettings = fvsOpts.join(', ');
    });

    animationFrameId = requestAnimationFrame(tick);
  };

  const initTracker = (container) => {
    setTimeout(() => {
      calculateBounds(container);
      window.addEventListener('pointermove',   onMouseMove,       { passive: true });
      window.addEventListener('pointerdown',   onPointerDown,     { passive: true });
      window.addEventListener('pointerup',     onPointerUpOrCancel, { passive: true });
      window.addEventListener('pointercancel', onPointerUpOrCancel, { passive: true });
      window.addEventListener('pointerleave',  onPointerLeave);
      animationFrameId = requestAnimationFrame(tick);
    }, 150);

    resizeHandler = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => calculateBounds(container), 200);
    };
    window.addEventListener('resize', resizeHandler);
  };

  const destroyTracker = () => {
    window.removeEventListener('pointermove',   onMouseMove);
    window.removeEventListener('pointerdown',   onPointerDown);
    window.removeEventListener('pointerup',     onPointerUpOrCancel);
    window.removeEventListener('pointercancel', onPointerUpOrCancel);
    window.removeEventListener('pointerleave',  onPointerLeave);
    if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    cancelAnimationFrame(animationFrameId);
  };

  // resize 後重新計算錯落基準（字母大小/位置可能變了）
  const recalculate = (container) => calculateBounds(container);

  return { initTracker, destroyTracker, recalculate };
}
