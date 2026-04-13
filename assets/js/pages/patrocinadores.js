(() => {
  const section = document.querySelector("[data-waves-section]");
  const canvas = document.querySelector("[data-waves-canvas]");
  if (!section || !canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const imgSrc = "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2670&auto=format&fit=crop";

  let loaded = null;
  let rafId = null;
  let mouseX = 0.5;
  let mouseY = 0.5;

  const onMouseMove = (event) => {
    const rect = section.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    mouseX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    mouseY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    section.style.setProperty("--mx", `${Math.round(mouseX * 100)}%`);
    section.style.setProperty("--my", `${Math.round(mouseY * 100)}%`);
  };

  const loadImage = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });

  const syncSize = () => {
    const rect = section.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const draw = () => {
    const rect = section.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    ctx.clearRect(0, 0, width, height);

    const img = loaded;
    if (!img) return;

    section.style.setProperty("--mx", `${Math.round(mouseX * 100)}%`);
    section.style.setProperty("--my", `${Math.round(mouseY * 100)}%`);

    const scale = Math.max(width / img.width, height / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (width - dw) / 2;
    const dy = (height - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);

    const imageData = ctx.getImageData(0, 0, width, height);
    const src = imageData.data;
    const out = new Uint8ClampedArray(src.length);

    const gridSize = Math.floor(mouseX * 6) + 1;
    const cell = Math.max(1, gridSize * 2);
    const threshold = mouseY;
    const voidRadius = Math.max(48, width * 0.28);
    const voidRadiusSq = voidRadius * voidRadius;
    const ditherStep = 255 / (gridSize * 4 + 6);
    const invertedThreshold = 1 - threshold;
    const cx = width * mouseX;
    const cy = height * mouseY;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const idx = (y * width + x) * 4;
        const dx2 = x - cx;
        const dy2 = y - cy;
        const distSq = dx2 * dx2 + dy2 * dy2;

        if (distSq < voidRadiusSq) {
          out[idx] = 0;
          out[idx + 1] = 0;
          out[idx + 2] = 0;
          out[idx + 3] = 255;
          continue;
        }

        const srcLuma = src[idx] * 0.299 + src[idx + 1] * 0.587 + src[idx + 2] * 0.114;
        const noise = (((x * 12.9898 + y * 78.233) * 43758.5453) % 1 + 1) % 1;
        const thresholdValue = invertedThreshold + (noise - 0.5) * ditherStep;
        const value = srcLuma / 255 < thresholdValue ? 245 : 0;
        const fade = Math.max(0, Math.min(1, (Math.sqrt(distSq) - voidRadius) / (voidRadius * 1.4)));
        const finalValue = Math.round(value * Math.max(fade, 0.08));

        out[idx] = finalValue;
        out[idx + 1] = finalValue;
        out[idx + 2] = finalValue;
        out[idx + 3] = 255;
      }
    }

    imageData.data.set(out);
    ctx.putImageData(imageData, 0, 0);
  };

  const refresh = () => {
    syncSize();
    draw();
  };

  const start = () => {
    if (rafId) return;
    const tick = () => {
      draw();
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
  };

  loadImage(imgSrc).then((image) => {
    loaded = image;
    refresh();
    start();
  });

  section.addEventListener("mousemove", onMouseMove);
  window.addEventListener("resize", refresh);

  return () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    section.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("resize", refresh);
  };
})();
