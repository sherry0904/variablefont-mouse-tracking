import { fontConfig } from '../config/fontConfig';

const lerp = (a, b, t) => a + (b - a) * t;

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
    const RADIUS = 420;
    frameCount++;

    elementsCache.forEach((c) => {
      const dx = mouseX - c.baseX;
      const dy = mouseY - c.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const norm = Math.min(dist / RADIUS, 1);
      const power = Math.pow(1 - norm, 2.5); // ease-in curve

      // --- Idle breathing ---
      const breath = Math.sin(t * 0.6 + c.seed);
      const idleWght = 300 + breath * 80;
      const idleWdth = 90 + breath * 8;
      const idleTx = Math.cos(t * 0.4 + c.seed * 1.3) * 5;
      const idleTy = Math.sin(t * 0.4 + c.seed) * 8;

      // --- Interaction targets ---
      const tWght = idleWght + power * 700;   // up to 1000
      const tWdth = idleWdth + power * 55;    // up to ~151
      const tGRAD = power * 150;              // up to max grade
      const tXOPQ = 96 + power * (175 - 96); // max thick stroke
      const tYOPQ = 79 + power * (135 - 79); // max thin stroke
      const tXTRA = 468 - power * (468 - 323); // shrink counters
      const tOpsz = 14 + power * (144 - 14);  // max optical size

      const tTx = idleTx + dx * power * 0.7;
      const tTy = idleTy + dy * power * 0.7;
      const tSlnt = -Math.min(Math.abs(dx / RADIUS * 10 * power), 10); // slant toward mouse
      const tRot = (dx + dy) * 0.08 * power; // swirl

      // --- Lerp all values ---
      const cur = c.cur;
      cur.wght = lerp(cur.wght, tWght, LF);
      cur.wdth = lerp(cur.wdth, tWdth, LF);
      cur.GRAD = lerp(cur.GRAD, tGRAD, LF);
      cur.XOPQ = lerp(cur.XOPQ, tXOPQ, LF);
      cur.YOPQ = lerp(cur.YOPQ, tYOPQ, LF);
      cur.XTRA = lerp(cur.XTRA, tXTRA, LF);
      cur.opsz = lerp(cur.opsz, tOpsz, LF);
      cur.slnt = lerp(cur.slnt, tSlnt, LF);
      cur.tx   = lerp(cur.tx,   tTx,   LF);
      cur.ty   = lerp(cur.ty,   tTy,   LF);
      cur.rot  = lerp(cur.rot,  tRot,  LF);

      // --- Apply to DOM (only when values changed enough to see) ---
      const el = c.element;
      const newTransform = `translate(calc(-50% + ${cur.tx.toFixed(1)}px), calc(-50% + ${cur.ty.toFixed(1)}px)) rotate(${cur.rot.toFixed(2)}deg)`;
      el.style.transform = newTransform;

      // Update font-variation-settings every 2nd frame to halve GPU re-rasterize cost
      const shouldUpdateFont = (frameCount % 2 === 0);
      const wghtChanged = Math.abs(cur.wght - (c._prevWght || 0)) > 4;
      if (shouldUpdateFont && wghtChanged) {
        c._prevWght = cur.wght;
        el.style.setProperty('--wght', cur.wght.toFixed(0));
        el.style.setProperty('--wdth', cur.wdth.toFixed(1));
        el.style.setProperty('--GRAD', cur.GRAD.toFixed(1));
        el.style.setProperty('--slnt', cur.slnt.toFixed(2));
        el.style.setProperty('--XOPQ', cur.XOPQ.toFixed(1));
        el.style.setProperty('--YOPQ', cur.YOPQ.toFixed(1));
        el.style.setProperty('--XTRA', cur.XTRA.toFixed(0));
        el.style.setProperty('--opsz', cur.opsz.toFixed(1));
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
