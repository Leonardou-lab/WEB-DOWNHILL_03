(() => {
  const section = document.querySelector("[data-waves-section]");
  const canvas = document.querySelector("[data-waves-canvas]");

  if (!section || !canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  class Grad {
    constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }

    dot2(x, y) {
      return this.x * x + this.y * y;
    }
  }

  class Noise {
    constructor(seed = 0) {
      this.grad3 = [
        new Grad(1, 1, 0),
        new Grad(-1, 1, 0),
        new Grad(1, -1, 0),
        new Grad(-1, -1, 0),
        new Grad(1, 0, 1),
        new Grad(-1, 0, 1),
        new Grad(1, 0, -1),
        new Grad(-1, 0, -1),
        new Grad(0, 1, 1),
        new Grad(0, -1, 1),
        new Grad(0, 1, -1),
        new Grad(0, -1, -1)
      ];
      this.p = [
        151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99,
        37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57,
        177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
        77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143,
        54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159,
        86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85,
        212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163,
        70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185,
        112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249,
        14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
        138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
      ];
      this.perm = new Array(512);
      this.gradP = new Array(512);
      this.seed(seed);
    }

    seed(seed) {
      let newSeed = seed;

      if (newSeed > 0 && newSeed < 1) newSeed *= 65536;
      newSeed = Math.floor(newSeed);
      if (newSeed < 256) newSeed |= newSeed << 8;

      for (let i = 0; i < 256; i += 1) {
        const value = i & 1 ? this.p[i] ^ (newSeed & 255) : this.p[i] ^ ((newSeed >> 8) & 255);
        this.perm[i] = this.perm[i + 256] = value;
        this.gradP[i] = this.gradP[i + 256] = this.grad3[value % 12];
      }
    }

    fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
      return (1 - t) * a + t * b;
    }

    perlin2(x, y) {
      let X = Math.floor(x);
      let Y = Math.floor(y);
      let localX = x - X;
      let localY = y - Y;

      X &= 255;
      Y &= 255;

      const n00 = this.gradP[X + this.perm[Y]].dot2(localX, localY);
      const n01 = this.gradP[X + this.perm[Y + 1]].dot2(localX, localY - 1);
      const n10 = this.gradP[X + 1 + this.perm[Y]].dot2(localX - 1, localY);
      const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(localX - 1, localY - 1);
      const u = this.fade(localX);

      return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(localY));
    }
  }

  const config = {
    lineColor: "rgba(255, 255, 255, 0.34)",
    waveSpeedX: 0.0125,
    waveSpeedY: 0.01,
    waveAmpX: 34,
    waveAmpY: 18,
    friction: 0.9,
    tension: 0.01,
    maxCursorMove: 120,
    xGap: 12,
    yGap: 34
  };

  const noise = new Noise(Math.random());
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = {
    x: 0,
    y: 0,
    lx: 0,
    ly: 0,
    sx: 0,
    sy: 0,
    vs: 0,
    a: 0,
    set: false
  };

  let bounds = { width: 0, height: 0, left: 0, top: 0 };
  let lines = [];
  let frameId = null;

  const getRatio = () => Math.min(window.devicePixelRatio || 1, 2);

  const syncBounds = () => {
    bounds = section.getBoundingClientRect();
  };

  const setCanvasSize = () => {
    syncBounds();

    const ratio = getRatio();
    const width = Math.max(1, Math.floor(bounds.width));
    const height = Math.max(1, Math.floor(bounds.height));

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const setLines = () => {
    lines = [];

    const outerWidth = bounds.width + 200;
    const outerHeight = bounds.height + 30;
    const totalLines = Math.ceil(outerWidth / config.xGap);
    const totalPoints = Math.ceil(outerHeight / config.yGap);
    const xStart = (bounds.width - config.xGap * totalLines) / 2;
    const yStart = (bounds.height - config.yGap * totalPoints) / 2;

    for (let i = 0; i <= totalLines; i += 1) {
      const points = [];

      for (let j = 0; j <= totalPoints; j += 1) {
        points.push({
          x: xStart + config.xGap * i,
          y: yStart + config.yGap * j,
          wave: { x: 0, y: 0 },
          cursor: { x: 0, y: 0, vx: 0, vy: 0 }
        });
      }

      lines.push(points);
    }
  };

  const setPointer = (x, y) => {
    pointer.x = x;
    pointer.y = y;

    if (!pointer.set) {
      pointer.sx = x;
      pointer.sy = y;
      pointer.lx = x;
      pointer.ly = y;
      pointer.set = true;
    }
  };

  const resetPointer = () => {
    if (!bounds.width || !bounds.height) return;

    setPointer(bounds.width * 0.7, bounds.height * 0.34);
  };

  const movePoints = (time) => {
    lines.forEach((points) => {
      points.forEach((point) => {
        const move = noise.perlin2(
          (point.x + time * config.waveSpeedX) * 0.002,
          (point.y + time * config.waveSpeedY) * 0.0015
        ) * 12;

        point.wave.x = Math.cos(move) * config.waveAmpX;
        point.wave.y = Math.sin(move) * config.waveAmpY;

        const dx = point.x - pointer.sx;
        const dy = point.y - pointer.sy;
        const dist = Math.hypot(dx, dy);
        const influence = Math.max(175, pointer.vs);

        if (dist < influence) {
          const strength = 1 - dist / influence;
          const force = Math.cos(dist * 0.001) * strength;
          point.cursor.vx += Math.cos(pointer.a) * force * influence * pointer.vs * 0.00065;
          point.cursor.vy += Math.sin(pointer.a) * force * influence * pointer.vs * 0.00065;
        }

        point.cursor.vx += (0 - point.cursor.x) * config.tension;
        point.cursor.vy += (0 - point.cursor.y) * config.tension;
        point.cursor.vx *= config.friction;
        point.cursor.vy *= config.friction;
        point.cursor.x += point.cursor.vx * 2;
        point.cursor.y += point.cursor.vy * 2;
        point.cursor.x = Math.min(config.maxCursorMove, Math.max(-config.maxCursorMove, point.cursor.x));
        point.cursor.y = Math.min(config.maxCursorMove, Math.max(-config.maxCursorMove, point.cursor.y));
      });
    });
  };

  const moved = (point, withCursor = true) => ({
    x: point.x + point.wave.x + (withCursor ? point.cursor.x : 0),
    y: point.y + point.wave.y + (withCursor ? point.cursor.y : 0)
  });

  const drawLines = () => {
    ctx.clearRect(0, 0, bounds.width, bounds.height);
    ctx.beginPath();
    ctx.strokeStyle = config.lineColor;
    ctx.lineWidth = 1;

    lines.forEach((points) => {
      let pointA = moved(points[0], false);
      ctx.moveTo(pointA.x, pointA.y);

      points.forEach((point, index) => {
        const isLast = index === points.length - 1;
        pointA = moved(point, !isLast);
        const pointB = moved(points[index + 1] || points[points.length - 1], !isLast);
        ctx.lineTo(pointA.x, pointA.y);

        if (isLast) {
          ctx.moveTo(pointB.x, pointB.y);
        }
      });
    });

    ctx.stroke();
  };

  const render = (time = 0) => {
    pointer.sx += (pointer.x - pointer.sx) * 0.1;
    pointer.sy += (pointer.y - pointer.sy) * 0.1;

    const dx = pointer.x - pointer.lx;
    const dy = pointer.y - pointer.ly;
    const distance = Math.hypot(dx, dy);

    pointer.vs += (distance - pointer.vs) * 0.1;
    pointer.vs = Math.min(100, pointer.vs);
    pointer.lx = pointer.x;
    pointer.ly = pointer.y;
    pointer.a = Math.atan2(dy, dx);

    movePoints(time);
    drawLines();
  };

  const tick = (time) => {
    render(time);
    frameId = window.requestAnimationFrame(tick);
  };

  const start = () => {
    if (motionQuery.matches) {
      frameId = null;
      render(0);
      return;
    }

    if (!frameId) {
      frameId = window.requestAnimationFrame(tick);
    }
  };

  const stop = () => {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  const refresh = () => {
    stop();
    setCanvasSize();
    setLines();
    resetPointer();
    start();
  };

  const onPointerMove = (event) => {
    syncBounds();
    setPointer(event.clientX - bounds.left, event.clientY - bounds.top);
  };

  const onMotionChange = () => {
    refresh();
  };

  section.addEventListener("pointermove", onPointerMove, { passive: true });
  section.addEventListener("pointerleave", resetPointer);
  window.addEventListener("resize", refresh);

  if (typeof motionQuery.addEventListener === "function") {
    motionQuery.addEventListener("change", onMotionChange);
  } else {
    motionQuery.addListener(onMotionChange);
  }

  refresh();
})();
