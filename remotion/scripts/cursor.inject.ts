// Injected into the page before any script runs.
// Renders a soft, UV-tinted synthetic cursor that follows real mouse coords
// with an ease-out trail, and also hides the OS cursor so recordings look clean.
export const CURSOR_INIT_SCRIPT = String(function inject() {
  const css = `
    * { cursor: none !important; }
    .__pulse-cursor-dot {
      position: fixed; top: 0; left: 0;
      width: 18px; height: 18px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #ffffff 0%, #f5deff 35%, #a855f7 70%, rgba(168,85,247,0) 100%);
      box-shadow: 0 0 24px 6px rgba(168,85,247,0.55), 0 0 60px 10px rgba(123,255,255,0.25);
      pointer-events: none;
      z-index: 2147483647;
      transform: translate(-50%, -50%);
      transition: transform 80ms ease-out;
      mix-blend-mode: screen;
    }
    .__pulse-cursor-trail {
      position: fixed; top: 0; left: 0;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(123,255,255,0.9), rgba(123,255,255,0) 70%);
      pointer-events: none;
      z-index: 2147483646;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
      opacity: 0;
    }
    .__pulse-click {
      position: fixed; top: 0; left: 0;
      width: 8px; height: 8px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 2147483645;
      border: 2px solid #7bffff;
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.9;
      animation: __pulse-click-anim 600ms ease-out forwards;
    }
    @keyframes __pulse-click-anim {
      to { transform: translate(-50%, -50%) scale(8); opacity: 0; }
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.documentElement.appendChild(style);

  const dot = document.createElement('div');
  dot.className = '__pulse-cursor-dot';
  document.documentElement.appendChild(dot);

  // Click ripple
  document.addEventListener('mousedown', (e) => {
    const r = document.createElement('div');
    r.className = '__pulse-click';
    r.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(1)`;
    r.style.left = e.clientX + 'px';
    r.style.top = e.clientY + 'px';
    document.documentElement.appendChild(r);
    setTimeout(() => r.remove(), 700);
  }, true);

  // Mousemove trail
  let lastTrail = 0;
  document.addEventListener('mousemove', (e) => {
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    const now = performance.now();
    if (now - lastTrail > 30) {
      lastTrail = now;
      const t = document.createElement('div');
      t.className = '__pulse-cursor-trail';
      t.style.left = e.clientX + 'px';
      t.style.top = e.clientY + 'px';
      t.style.opacity = '0.8';
      document.documentElement.appendChild(t);
      requestAnimationFrame(() => {
        t.style.transition = 'opacity 400ms ease-out, transform 400ms ease-out';
        t.style.opacity = '0';
        t.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(0.3)`;
      });
      setTimeout(() => t.remove(), 500);
    }
  }, true);
}) + '\n;inject();';
