import { fontsDatabase, activeFontId } from '../config/fontConfig';
import { appConfig } from '../config/appConfig';const lerp = (a, b, t) => a + (b - a) * t;

export function useMouseTracker() {
  let elementsCache = [];
  let animationFrameId = null;
  let mouseX = -9999;
  let mouseY = -9999;
  let resizeTimeout;
  let frameCount = 0;

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
    mouseX = e.clientX;
    mouseY = e.clientY;
  };

  const tick = (timestamp) => {
    const t = timestamp / 1000;
    const dt = Math.min(timestamp - (tick._last || timestamp), 50) / 1000;
    tick._last = timestamp;
    const LF = 1 - Math.pow(1 - 0.85, dt * 60);
    const pConfig = appConfig.physics;
    const RADIUS = pConfig.interactionRadius;
    frameCount++;

    const fontConf = fontsDatabase[activeFontId.value];

    elementsCache.forEach((c) => {
      const dx = mouseX - c.baseX;
      const dy = mouseY - c.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const norm = Math.min(dist / RADIUS, 1);
      const power = Math.pow(1 - norm, 1.8);

      // --- Idle oscillation (共用於位移與字型變化軸) ---
      const breath = Math.sin(t * pConfig.idle.breathingSpeed + c.seed); // -1 ~ 1

      // --- 物理位移與旋轉 ---
      const idleTx  = Math.cos(t * pConfig.idle.movementSpeedX + c.seed * 1.3) * pConfig.idle.movementAmplitudeX;
      const idleTy  = Math.sin(t * pConfig.idle.movementSpeedY + c.seed) * pConfig.idle.movementAmplitudeY;
      const idleRot = Math.sin(t * pConfig.idle.rotationSpeed + c.seed * 2.1) * pConfig.idle.rotationAmplitude;

      const targetTx = idleTx + dx * power * pConfig.magneticForce;
      const targetTy = idleTy + dy * power * pConfig.magneticForce;
      const tRot     = idleRot + (dx + dy) * 0.12 * power;

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

      // --- 動態字型變化軸 (每 2 frame 更新一次以降低 GPU 負擔) ---
      if (frameCount % 2 === 0) {
        if (!c.curAxes) c.curAxes = {};
        const fvsOpts = [];

        Object.entries(fontConf.axes).forEach(([name, bounds]) => {
          // 惰性初始化：第一次使用該軸時從 default 值開始
          if (c.curAxes[name] === undefined) c.curAxes[name] = bounds.default;

          const range = bounds.max - bounds.min;
          // 閒置呼吸：在 default ±15% range 之間振盪
          const idleVal = bounds.default + breath * range * 0.15;
          // 滑鼠靠近：往 max 推進
          const targetVal = idleVal + power * (bounds.max - idleVal);
          const clamped = Math.max(bounds.min, Math.min(bounds.max, targetVal));

          c.curAxes[name] = lerp(c.curAxes[name], clamped, LF);
          fvsOpts.push(`'${name}' ${c.curAxes[name].toFixed(2)}`);
        });

        el.style.fontVariationSettings = fvsOpts.join(', ');
      }
    });

    animationFrameId = requestAnimationFrame(tick);
  };

  const initTracker = (container) => {
    // Small delay to ensure DOM is fully rendered
    setTimeout(() => {
      calculateBounds(container);
      window.addEventListener('mousemove', onMouseMove);
      animationFrameId = requestAnimationFrame(tick);
    }, 150);

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => calculateBounds(container), 200);
    });
  };

  const destroyTracker = () => {
    window.removeEventListener('mousemove', onMouseMove);
    cancelAnimationFrame(animationFrameId);
  };

  return { initTracker, destroyTracker };
}
