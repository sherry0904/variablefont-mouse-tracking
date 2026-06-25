import { fontsDatabase, activeFontId } from '../config/fontConfig';
import { appConfig } from '../config/appConfig';const lerp = (a, b, t) => a + (b - a) * t;

export function useMouseTracker() {
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
    const items = container.querySelectorAll('.trackable-item');
    items.forEach((el) => {
      // Temporarily remove transform to get true position
      el.style.transform = 'translate(-50%, -50%)';
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      elementsCache.push({
        element: el,
        baseX: cx,
        baseY: cy,
        seed: cx * 0.01 + cy * 0.01,
        cur: {
          wght: 400,
          wdth: 100,
          GRAD: 0,
          slnt: 0,
          XOPQ: 96,
          YOPQ: 79,
          XTRA: 468,
          opsz: 14,
          tx: 0,
          ty: 0,
          rot: 0,
          vx: 0,
          vy: 0,
        },
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
    // Keep the last touch position, then gradually fade magnetic influence.
    mouseX = touchX;
    mouseY = touchY;
  };

  const tick = (timestamp) => {
    const t = timestamp / 1000;
    const dt = Math.min(timestamp - (tick._last || timestamp), 50) / 1000;
    tick._last = timestamp;
    const LF = 1 - Math.pow(1 - 0.85, dt * 60);
    const pConfig = appConfig.physics;
    const RADIUS = pConfig.interactionRadius;
    const axisTestMode = pConfig.axisTestMode === true;
    const axisTestAxes = Array.isArray(pConfig.axisTestAxes) ? pConfig.axisTestAxes : null;

    const touchTargetIntensity = activeTouchPointerId !== null ? 1 : 0;
    const touchBlend = touchTargetIntensity ? 0.22 : 0.04;
    touchDragIntensity = lerp(touchDragIntensity, touchTargetIntensity, touchBlend);

    const fontConf = fontsDatabase[activeFontId.value];

    elementsCache.forEach((c) => {
      const dx = mouseX - c.baseX;
      const dy = mouseY - c.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const norm = Math.min(dist / RADIUS, 1);
      const power = Math.pow(1 - norm, 1.8);
      const magneticPower = power * (activeTouchPointerId !== null || touchDragIntensity > 0 ? touchDragIntensity : 1);

      // --- Idle oscillation (共用於位移與字型變化軸) ---
      const breath = Math.sin(t * pConfig.idle.breathingSpeed + c.seed); // -1 ~ 1

      // --- 物理位移與旋轉 ---
      const idleTx  = Math.cos(t * pConfig.idle.movementSpeedX + c.seed * 1.3) * pConfig.idle.movementAmplitudeX;
      const idleTy  = Math.sin(t * pConfig.idle.movementSpeedY + c.seed) * pConfig.idle.movementAmplitudeY;
      const idleRot = Math.sin(t * pConfig.idle.rotationSpeed + c.seed * 2.1) * pConfig.idle.rotationAmplitude;

      const targetTx = axisTestMode ? 0 : idleTx + dx * magneticPower * pConfig.magneticForce;
      const targetTy = axisTestMode ? 0 : idleTy + dy * magneticPower * pConfig.magneticForce;
      const tRot     = axisTestMode ? 0 : idleRot + (dx + dy) * 0.12 * magneticPower;

      const cur = c.cur;
      cur.rot = lerp(cur.rot, tRot, LF);

      cur.vx += (targetTx - cur.tx) * pConfig.spring;
      cur.vy += (targetTy - cur.ty) * pConfig.spring;
      cur.vx *= pConfig.friction;
      cur.vy *= pConfig.friction;
      cur.tx += cur.vx;
      cur.ty += cur.vy;

      const el = c.element;
      el.style.transform = `translate(calc(-50% + ${cur.tx.toFixed(1)}px), calc(-50% + ${cur.ty.toFixed(1)}px)) rotate(${cur.rot.toFixed(2)}deg)`;

      // --- 動態字型變化軸 (每 frame 更新，避免視覺上「一格一格」) ---
      if (!c.curAxes) c.curAxes = {};
      const fvsOpts = [];

      Object.entries(fontConf.axes).forEach(([name, bounds]) => {
        // 惰性初始化：第一次使用該軸時從 default 值開始
        if (c.curAxes[name] === undefined) c.curAxes[name] = bounds.default;

        const range = bounds.max - bounds.min;
        // 閒置呼吸：在 default 附近做小幅振盪，預設維持貼近細／矮的基準
        const idleVal = bounds.default + breath * range * pConfig.idle.axisBreathingScale;
        // 滑鼠靠近：往 max 推進。各軸可用 pull (0~1) 控制推進強度，
        // 讓某些軸衝滿、某些軸收斂，凸顯想強調的變化（預設 1 = 完全推到 max）
        const pull = bounds.pull ?? 1;
        const isAxisAllowed = !axisTestMode || !axisTestAxes || axisTestAxes.includes(name);
        const targetVal = isAxisAllowed
          ? idleVal + magneticPower * pull * (bounds.max - idleVal)
          : bounds.default;
        const clamped = Math.max(bounds.min, Math.min(bounds.max, targetVal));

        c.curAxes[name] = lerp(c.curAxes[name], clamped, LF);
        fvsOpts.push(`'${name}' ${c.curAxes[name].toFixed(3)}`);
      });

      el.style.fontVariationSettings = fvsOpts.join(', ');
    });

    animationFrameId = requestAnimationFrame(tick);
  };

  const initTracker = (container) => {
    // Small delay to ensure DOM is fully rendered
    setTimeout(() => {
      calculateBounds(container);
      window.addEventListener('pointermove', onMouseMove, { passive: true });
        window.addEventListener('pointerdown', onPointerDown, { passive: true });
        window.addEventListener('pointerup', onPointerUpOrCancel, { passive: true });
        window.addEventListener('pointercancel', onPointerUpOrCancel, { passive: true });
      window.addEventListener('pointerleave', onPointerLeave);
      animationFrameId = requestAnimationFrame(tick);
    }, 150);

    resizeHandler = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => calculateBounds(container), 200);
    };

    window.addEventListener('resize', resizeHandler);
  };

  const destroyTracker = () => {
    window.removeEventListener('pointermove', onMouseMove);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointerup', onPointerUpOrCancel);
    window.removeEventListener('pointercancel', onPointerUpOrCancel);
    window.removeEventListener('pointerleave', onPointerLeave);
    if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    cancelAnimationFrame(animationFrameId);
  };

  return { initTracker, destroyTracker };
}
