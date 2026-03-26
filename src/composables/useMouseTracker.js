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

    elementsCache.forEach((c) => {
      const dx = mouseX - c.baseX;
      const dy = mouseY - c.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const norm = Math.min(dist / RADIUS, 1);
      const power = Math.pow(1 - norm, 1.8); // ease-in curve, made softer so effect is wider

      // --- Idle breathing ---
      const breath = Math.sin(t * pConfig.idle.breathingSpeed + c.seed);
      const idleWght = 300 + breath * pConfig.idle.breathingWeight;
      const idleWdth = 90 + breath * pConfig.idle.breathingWidth;
      const idleTx = Math.cos(t * pConfig.idle.movementSpeedX + c.seed * 1.3) * pConfig.idle.movementAmplitudeX;
      const idleTy = Math.sin(t * pConfig.idle.movementSpeedY + c.seed) * pConfig.idle.movementAmplitudeY;
      const idleRot = Math.sin(t * pConfig.idle.rotationSpeed + c.seed * 2.1) * pConfig.idle.rotationAmplitude;
      const idleSlnt = Math.cos(t * pConfig.idle.rotationSpeed * 1.2 + c.seed) * pConfig.idle.slantAmplitude;

      // --- Interaction targets ---
      const tWght = idleWght + power * 700;   // up to 1000
      const tWdth = idleWdth + power * 55;    // up to ~151
      const tGRAD = power * 150;              // up to max grade
      const tXOPQ = 96 + power * (175 - 96); // max thick stroke
      const tYOPQ = 79 + power * (135 - 79); // max thin stroke
      const tXTRA = 468 - power * (468 - 323); // shrink counters
      const tOpsz = 14 + power * (144 - 14);  // max optical size

      const targetTx = idleTx + dx * power * pConfig.magneticForce;
      const targetTy = idleTy + dy * power * pConfig.magneticForce;
      
      const tSlnt = idleSlnt - Math.min(Math.abs(dx / RADIUS * 15 * power), 10); // slant toward mouse
      const tRot = idleRot + (dx + dy) * 0.12 * power; // swirl

      // --- Lerp values and Physics for translation ---
      const cur = c.cur;
      cur.wght = lerp(cur.wght, tWght, LF);
      cur.wdth = lerp(cur.wdth, tWdth, LF);
      cur.GRAD = lerp(cur.GRAD, tGRAD, LF);
      cur.XOPQ = lerp(cur.XOPQ, tXOPQ, LF);
      cur.YOPQ = lerp(cur.YOPQ, tYOPQ, LF);
      cur.XTRA = lerp(cur.XTRA, tXTRA, LF);
      cur.opsz = lerp(cur.opsz, tOpsz, LF);
      cur.slnt = lerp(cur.slnt, tSlnt, LF);
      cur.rot  = lerp(cur.rot,  tRot,  LF);

      // Spring physics for position to give a heavier "magnetic" feel
      const spring = pConfig.spring;
      const friction = pConfig.friction;
      cur.vx += (targetTx - cur.tx) * spring;
      cur.vy += (targetTy - cur.ty) * spring;
      cur.vx *= friction;
      cur.vy *= friction;
      cur.tx += cur.vx;
      cur.ty += cur.vy;

      // --- Apply to DOM (only when values changed enough to see) ---
      const el = c.element;
      const newTransform = `translate(calc(-50% + ${cur.tx.toFixed(1)}px), calc(-50% + ${cur.ty.toFixed(1)}px)) rotate(${cur.rot.toFixed(2)}deg)`;
      el.style.transform = newTransform;

      // Update font-variation-settings every 2nd frame to halve GPU re-rasterize cost
      const shouldUpdateFont = (frameCount % 2 === 0);
      const wghtChanged = Math.abs(cur.wght - (c._prevWght || 0)) > 4;
      
      if (shouldUpdateFont && wghtChanged) {
        c._prevWght = cur.wght;
        const fontConf = fontsDatabase[activeFontId.value];
        const fvsOpts = [];

        // Safely apply only the axes supported by the current font, clamping to min/max
        if (fontConf.axes.wght) {
          const w = Math.max(fontConf.axes.wght.min, Math.min(fontConf.axes.wght.max, cur.wght));
          fvsOpts.push(`'wght' ${w.toFixed(0)}`);
        }
        if (fontConf.axes.wdth) {
          const w = Math.max(fontConf.axes.wdth.min, Math.min(fontConf.axes.wdth.max, cur.wdth));
          fvsOpts.push(`'wdth' ${w.toFixed(1)}`);
        }
        if (fontConf.axes.GRAD) {
          const w = Math.max(fontConf.axes.GRAD.min, Math.min(fontConf.axes.GRAD.max, cur.GRAD));
          fvsOpts.push(`'GRAD' ${w.toFixed(1)}`);
        }
        if (fontConf.axes.slnt) {
          const w = Math.max(fontConf.axes.slnt.min, Math.min(fontConf.axes.slnt.max, cur.slnt));
          fvsOpts.push(`'slnt' ${w.toFixed(2)}`);
        }
        if (fontConf.axes.XOPQ) {
          const w = Math.max(fontConf.axes.XOPQ.min, Math.min(fontConf.axes.XOPQ.max, cur.XOPQ));
          fvsOpts.push(`'XOPQ' ${w.toFixed(1)}`);
        }
        if (fontConf.axes.YOPQ) {
          const w = Math.max(fontConf.axes.YOPQ.min, Math.min(fontConf.axes.YOPQ.max, cur.YOPQ));
          fvsOpts.push(`'YOPQ' ${w.toFixed(1)}`);
        }
        if (fontConf.axes.XTRA) {
          const w = Math.max(fontConf.axes.XTRA.min, Math.min(fontConf.axes.XTRA.max, cur.XTRA));
          fvsOpts.push(`'XTRA' ${w.toFixed(0)}`);
        }
        if (fontConf.axes.opsz) {
          const w = Math.max(fontConf.axes.opsz.min, Math.min(fontConf.axes.opsz.max, cur.opsz));
          fvsOpts.push(`'opsz' ${w.toFixed(1)}`);
        }

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
