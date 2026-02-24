import React, { useEffect, useMemo, useRef, useState } from "react";

// ===== Helpers
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Pixel ratio for crisp pixel art look
const getDeviceRatio = (ctx) => {
  const dpr = window.devicePixelRatio || 1;
  const bsr =
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio ||
    1;
  return dpr / bsr;
};

// ===== Core Content Data
const DEFAULT_RESUME_URL =
  "https://raw.githubusercontent.com/mayozoz/mayozoz.github.io/main/mei-yi-yang_resume.pdf";

const CODE_SNIPPETS = [
  {
    title: "MapReduce Worker",
    lang: "python",
    code:
      `class Worker:\n  def handle_map(self, task):\n    kv = []\n    for chunk in task.chunks:\n      kv += map_fn(chunk)\n    return partition(kv)`,
  },
  {
    title: "Priority Order Book",
    lang: "cpp",
    code:
      `struct Order{int id; double px; long ts;};\npriority_queue<Order, vector<Order>, Cmp> book;`,
  },
  {
    title: "React Drag-n-Drop UI",
    lang: "jsx",
    code:
      `function DropZone(){\n  const [files,setFiles] = useState([])\n  return <div onDrop={e=>setFiles([...files,...e.dataTransfer.files])}/>\n}`,
  },
];

const ITEMS = [
  { id: "neural_net", name: "Neural Network", emoji: "🧠", zone: "north", blurb: "AI Engineering @ NetEase YouDao — MT quality estimation for low-resource pairs; COMET/chrF++/BERTScore, LLM-ranked eval." },
  { id: "react_component", name: "React Component", emoji: "⚛️", zone: "east", blurb: "Frontend Research Assistant — React app for zebrafish thrombosis analysis; drag-and-drop UX, customizable pipelines." },
  { id: "tencent_cloud", name: "Cloud Icon", emoji: "🏢", zone: "west", blurb: "Tencent Cloud Ops — pricing analytics, competitor benchmarks; HunYuan bot automated workflows." },
  { id: "apple_pencil", name: "Apple Pencil", emoji: "🎨", zone: "east", blurb: "Graphic design portfolio & CSA posters/banners — process and polish." },
  { id: "tattoo_gun", name: "Tattoo Gun", emoji: "🖋️", zone: "east", blurb: "Tattoo flash + linework studies — gallery wall & timelapses." },
  { id: "zebrafish", name: "Zebrafish", emoji: "🐟", zone: "north", blurb: "Zebrafish image analysis — research collab UI and image tooling." },
  { id: "database", name: "Database", emoji: "📊", zone: "west", blurb: "Databases & systems projects — Piazza classifier, MapReduce library, stock simulator." },
  { id: "game_controller", name: "Game Controller", emoji: "🎮", zone: "center", blurb: "Personal game/creative experiments — shaders, input, tiny prototypes." },
];

const ZONES = {
  center: { label: "Present Me — Central Hub", theme: { hue: 280, pattern: "stars" }, hint: "WASD/Arrows to move. Space to jump. Click glowing objects to inspect/collect." },
  north:  { label: "The Lab — AI/ML Engineer", theme: { hue: 200, pattern: "circuits" }, hint: "Floating code and evaluation metrics hover here." },
  east:   { label: "The Studio — Artist/Designer", theme: { hue: 15,  pattern: "strokes"  }, hint: "Tap a frame to open gallery. Magic mirrors show process videos." },
  west:   { label: "The Workshop — Full-Stack Developer", theme: { hue: 140, pattern: "grid"    }, hint: "Skill trees on walls; try the run-code console." },
  south:  { label: "The Archive — About / Resume / Contact", theme: { hue: 50,  pattern: "scrolls" }, hint: "Download the scroll (resume) and leave a pixel art message." },
};

// ===== Main Component
export default function PersonalRPGPortfolio({ resumeUrl = DEFAULT_RESUME_URL }) {
  const spriteRef = useRef(null);
  const [spriteReady, setSpriteReady] = useState(false);

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const animationRef = useRef();
  const keysRef = useRef({});
  const playerRef = useRef(null);

  const [size, setSize] = useState({ w: 960, h: 540 });
  const [loaded, setLoaded] = useState(false);
  const [zone, setZone] = useState("center");
  const [popup, setPopup] = useState(null);
  const [inventory, setInventory] = useState({});
  const [particles, setParticles] = useState([]);
  const [announce, setAnnounce] = useState("");
  const [konami] = useState(false);
  const [musicOn, setMusicOn] = useState(false);

  // Player state - start near world center
  const [player, setPlayer] = useState({
    x: 1500, y: 1500, vx: 0, vy: 0, dir: "S",
    jumping: false, jumpY: 0, groundY: 1500, isMoving: false
  });
  useEffect(() => { playerRef.current = player; }, []); // seed once

  // Resolves assets correctly whether the site is / or /portfolio/
  const asset = (p) =>
    `${(import.meta.env.BASE_URL || "/").replace(/\/$/, "")}/${p.replace(/^\//, "")}`;

  // Sprite (Aseprite PNG+JSON) — your files are in public/sprites
  useEffect(() => {
    let mounted = true;
    loadAsepriteSprite(asset("sprites/avatar.png"), asset("sprites/avatar.json"))
      .then(s => {
        if (!mounted) return;
        spriteRef.current = makeAnimator(s);
        setSpriteReady(true);
      })
      .catch(console.error);
    return () => { mounted = false; };
  }, []);

  // World constants
  const WORLD = { w: 3000, h: 3000 };
  const CENTER = { x: WORLD.w / 2, y: WORLD.h / 2 };

  // Item positions
  const itemSpawns = useMemo(() => ({
    neural_net:      { x: CENTER.x - 240, y: CENTER.y - 500 },
    zebrafish:       { x: CENTER.x + 100, y: CENTER.y - 850 },
    react_component: { x: CENTER.x + 550, y: CENTER.y - 230 },
    apple_pencil:    { x: CENTER.x + 920, y: CENTER.y + 50 },
    tattoo_gun:      { x: CENTER.x + 480, y: CENTER.y + 250 },
    tencent_cloud:   { x: CENTER.x - 450, y: CENTER.y - 80 },
    database:        { x: CENTER.x - 720, y: CENTER.y + 70 },
    game_controller: { x: CENTER.x + 30,  y: CENTER.y + 400 },
  }), [CENTER.x, CENTER.y]);

  const gates = useMemo(() => ([
    { id: "north", x: CENTER.x, y: CENTER.y - 120, r: 40 },
    { id: "east",  x: CENTER.x + 120, y: CENTER.y, r: 40 },
    { id: "west",  x: CENTER.x - 120, y: CENTER.y, r: 40 },
    { id: "south", x: CENTER.x, y: CENTER.y + 120, r: 40 },
  ]), [CENTER.x, CENTER.y]);

  const worldToScreen = (player, size, pos) => ({
    x: pos.x - (player.x - size.w / 2),
    y: pos.y - (player.y - size.h / 2),
  });

  // Player movement step
  const handlePlayerMovement = (prevPlayer, keys) => {
    const speed = 4, jumpHeight = 30, jumpSpeed = 0.8;

    let vx = 0, vy = 0;
    if (keys["w"] || keys["arrowup"]) vy = -1;
    if (keys["s"] || keys["arrowdown"]) vy =  1;
    if (keys["a"] || keys["arrowleft"]) vx = -1;
    if (keys["d"] || keys["arrowright"]) vx =  1;

    if (vx && vy) { const l = Math.hypot(vx, vy); vx /= l; vy /= l; }

    let jumping = prevPlayer.jumping;
    let jumpY   = prevPlayer.jumpY;

    if (keys[" "] && !jumping) { jumping = true; jumpY = 0; }
    if (jumping) { jumpY += jumpSpeed; if (jumpY >= jumpHeight) { jumping = false; jumpY = 0; } }

    const newX = clamp(prevPlayer.x + vx * speed, 100, WORLD.w - 100);
    const newY = clamp(prevPlayer.y + vy * speed, 100, WORLD.h - 100);

    let dir = prevPlayer.dir;
    if (Math.abs(vx) > Math.abs(vy)) dir = vx > 0 ? "E" : vx < 0 ? "W" : dir;
    else if (vy !== 0)              dir = vy > 0 ? "S" : "N";

    const isMoving = vx !== 0 || vy !== 0;

    return { x:newX, y:newY, vx, vy, dir, jumping, jumpY, groundY:newY, isMoving };
  };

  // Canvas init + resize
  useEffect(() => {
    const canvas = canvasRef.current, wrapper = wrapRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d");
    const ratio = getDeviceRatio(ctx);

    const resizeCanvas = () => {
      const rect = wrapper.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      setSize({ w, h });
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(wrapper);
    const t = setTimeout(() => setLoaded(true), 100);

    return () => { ro.disconnect(); clearTimeout(t); };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const down = (e) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
      keysRef.current[e.key.toLowerCase()] = true;
    };
    const up =   (e) => { keysRef.current[e.key.toLowerCase()] = false; };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  // Game loop
  useEffect(() => {
    if (!loaded) return;

    let last = performance.now();
    let raf;

    const loop = (now) => {
      const dt = Math.min(32, now - last);
      last = now;

      // 1) advance simulation
      setPlayer(prev => {
        const next = handlePlayerMovement(prev, keysRef.current);
        playerRef.current = next;
        return next;
      });

      // 2) animation state (use the *latest* player from the ref)
      const p = playerRef.current;
      if (spriteReady && spriteRef.current) {
        spriteRef.current.setAnim(p.isMoving ? "walk" : "blink");
        spriteRef.current.update(dt);
      }

      // 3) zone + render
      const currentZone = computeZone(p, CENTER);
      if (currentZone !== zone) {
        setZone(currentZone);
        setAnnounce(ZONES[currentZone].label);
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        render(
          ctx, size, p, currentZone, inventory, itemSpawns, gates,
          particles, konami, CENTER, WORLD
        );
        if (spriteReady && spriteRef.current) {
          spriteRef.current.draw(ctx, size.w / 2, size.h / 2, 1.5, { bob: !p.jumping });
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // only re-create when canvas size changes or loop is (re)enabled
  }, [loaded, size.w, size.h, spriteReady]);

  // Clean up stuck keys
  useEffect(() => {
    const clear = () => { keysRef.current = {}; };
    window.addEventListener("blur", clear);
    return () => window.removeEventListener("blur", clear);
  }, []);

  // Click/tap handling
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // screen -> world
    const worldX = x - size.w / 2 + player.x;
    const worldY = y - size.h / 2 + player.y;

    // Items
    for (const item of ITEMS) {
      const itemPos = itemSpawns[item.id];
      if (!itemPos) continue;
      const distance = dist({ x: worldX, y: worldY }, itemPos);
      if (distance < 30) {
        const playerDistance = dist(player, itemPos);
        if (playerDistance < 60) {
          if (!inventory[item.id]) {
            setInventory((prev) => ({ ...prev, [item.id]: true }));
            burstParticles(x, y, setParticles);
            setAnnounce(`${item.name} collected`);
          }
          setPopup({ title: `${item.emoji} ${item.name}`, body: item.blurb });
          return;
        }
      }
    }

    // Gates
    for (const gate of gates) {
      const distance = dist({ x: worldX, y: worldY }, gate);
      if (distance < gate.r) {
        setPlayer(prev => {
          const next = handlePlayerMovement(prev, keysRef.current);
          playerRef.current = next;
          return next;
        });
        setAnnounce(ZONES[gate.id].label);
        break;
      }
    }
  };

  const allFound = ITEMS.every((item) => inventory[item.id]);

  return (
    <div ref={wrapRef} className="w-full h-screen flex flex-col bg-black text-white">
      <Header zone={zone} musicOn={musicOn} setMusicOn={setMusicOn} />

      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          onClick={handleClick}
        />

        <ZoneBanner zone={zone} />
        <InventoryBar items={ITEMS} inventory={inventory} />
        <Hint label={ZONES[zone].hint} />
        <ControlsOverlay />

        <LiveRegion text={announce} />

        {zone === "south" && (
          <ArchivePanel
            resumeUrl={resumeUrl}
            onOpenGuestbook={() => setPopup({ title: "Guest Book", body: "guestbook" })}
          />
        )}
        {zone === "west" && <CodeConsole />}
        {zone === "east" && <GalleryWall />}
        {zone === "north" && <SkillTree />}

        {popup && (
          <Popup onClose={() => setPopup(null)} title={popup.title}>
            {popup.body === "guestbook" ? (
              <Guestbook />
            ) : (
              <p className="leading-relaxed text-sm">{popup.body}</p>
            )}
          </Popup>
        )}

        <div className="absolute top-2 right-2 text-xs bg-white/10 backdrop-blur rounded-xl px-3 py-2">
          {allFound ? (
            <span>Achievement: Discovered all technical projects</span>
          ) : (
            <span>Progress: {Object.keys(inventory).length}/{ITEMS.length} items</span>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ===== Safe zone computation (prevents 'reading x of undefined')
function computeZone(player, center) {
  if (!player || !center || player.x == null || player.y == null) return "center";
  const dx = player.x - center.x, dy = player.y - center.y;
  const d = Math.hypot(dx, dy);
  if (d < 200) return "center";
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "east" : "west") : (dy < 0 ? "north" : "south");
}

// ===== Render
function render(ctx, size, player, zone, inventory, itemSpawns, gates, particles, konami, center, world) {
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, size.w, size.h);

  const cameraX = player.x - size.w / 2;
  const cameraY = player.y - size.h / 2;

  drawBackground(ctx, size, zone, cameraX, cameraY);

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  // drawZonePaths(ctx, center);
  drawHub(ctx, center);

  ITEMS.forEach((item) => {
    const pos = itemSpawns[item.id];
    if (pos) drawItem(ctx, pos.x, pos.y, item.emoji, !!inventory[item.id]);
  });

  ctx.restore();

  // particles
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.t / 600;
    ctx.fillStyle = `hsl(${p.h}, 95%, 70%)`;
    const sx = p.x + p.vx * (600 - p.t) * 0.02;
    const sy = p.y + p.vy * (600 - p.t) * 0.02;
    ctx.fillRect(sx, sy, 3, 3);
    ctx.restore();
  });
}

function drawZonePaths(ctx, center) {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 25;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(center.x, center.y - 120);
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(center.x + 120, center.y);
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(center.x - 120, center.y);
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(center.x, center.y + 100);
  ctx.stroke();

  ctx.restore();
}

function drawBackground(ctx, size, zone, cameraX = 0, cameraY = 0) {
  const theme = ZONES[zone].theme;

  const gradient = ctx.createRadialGradient(
    size.w / 2, size.h / 2, 100,
    size.w / 2, size.h / 2, Math.max(size.w, size.h)
  );
  gradient.addColorStop(0, `hsl(${theme.hue}, 40%, 12%)`);
  gradient.addColorStop(1, `hsl(${theme.hue}, 60%, 4%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size.w, size.h);

  drawParallaxLayer(ctx, size, theme, cameraX * 0.1, cameraY * 0.1, "far");
  drawParallaxLayer(ctx, size, theme, cameraX * 0.3, cameraY * 0.3, "mid");
  drawParallaxLayer(ctx, size, theme, cameraX * 0.6, cameraY * 0.6, "near");
}

function drawParallaxLayer(ctx, size, theme, offsetX, offsetY, layer) {
  ctx.save();

  const alpha = layer === "far" ? 0.15 : layer === "mid" ? 0.25 : 0.35;
  ctx.globalAlpha = alpha;

  const baseSpacing = layer === "far" ? 120 : layer === "mid" ? 80 : 50;
  const spacing = baseSpacing * Math.min(size.w, size.h) / 600;
  const elementSize = spacing * 0.2;

  const startX = Math.floor(-offsetX / spacing) - 3;
  const startY = Math.floor(-offsetY / spacing) - 3;
  const endX = startX + Math.ceil(size.w / spacing) + 6;
  const endY = startY + Math.ceil(size.h / spacing) + 6;

  for (let gx = startX; gx < endX; gx++) {
    for (let gy = startY; gy < endY; gy++) {
      const x = gx * spacing - (offsetX % spacing);
      const y = gy * spacing - (offsetY % spacing);

      if (x < -spacing || x > size.w + spacing || y < -spacing || y > size.h + spacing) continue;

      drawThemeElement(ctx, x, y, theme, layer, elementSize, gx, gy);
    }
  }

  ctx.restore();
}

function drawThemeElement(ctx, x, y, theme, layer, size, gx, gy) {
  const seed = (gx * 73 + gy * 37) % 100;

  ctx.fillStyle = `hsl(${theme.hue}, 70%, ${25 + (seed % 30)}%)`;

  switch (theme.pattern) {
    case "circuits":
      if (seed % 3 === 0) {
        ctx.fillRect(x, y, size * 0.8, size * 0.4);
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.8, y + size * 0.2);
        ctx.lineTo(x + size * 1.2, y + size * 0.2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x + size * 0.3, y + size * 0.3, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case "strokes":
      if (seed % 4 === 0) {
        ctx.beginPath();
        ctx.arc(x, y, size * (0.3 + (seed % 20) / 40), 0.5, 2.8);
        ctx.lineWidth = size * 0.2;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.stroke();
      } else {
        for (let i = 0; i < 3; i++) {
          const dx = (seed + i * 17) % 20 - 10;
          const dy = (seed + i * 23) % 20 - 10;
          ctx.beginPath();
          ctx.arc(x + dx, y + dy, size * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;

    case "grid":
      if (seed % 5 === 0) {
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, size, size * 0.6);
        ctx.beginPath();
        ctx.moveTo(x + size * 0.5, y);
        ctx.lineTo(x + size * 0.5, y - size * 0.3);
        ctx.stroke();
      }
      break;

    default:
      if (seed % 6 === 0) {
        drawStar(ctx, x, y, size * 0.3, 5);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
  }
}

function drawStar(ctx, x, y, radius, points) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();

  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points;
    const r = i % 2 === 0 ? radius : radius * 0.4;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHub(ctx, center) {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(center.x, center.y, 100, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawItem(ctx, x, y, emoji, collected) {
  ctx.save();

  if (!collected) {
    const time = Date.now() / 1000;
    const pulseScale = 1 + Math.sin(time * 2) * 0.15;
    ctx.scale(pulseScale, pulseScale);
    x /= pulseScale;
    y /= pulseScale;
  }

  ctx.font = "24px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = collected ? 0.4 : 1;
  ctx.fillText(emoji, x, y);

  if (!collected) {
    const time = Date.now() / 1000;
    const glowAlpha = 0.3 + Math.sin(time * 3) * 0.3;
    const glowRadius = 20 + Math.sin(time * 2.5) * 3;

    ctx.globalAlpha = glowAlpha;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

// ===== Aseprite loader
function loadAsepriteSprite(pngUrl, jsonUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      const [img, meta] = await Promise.all([
        new Promise((res, rej) => {
          const im = new Image();
          im.onload = () => res(im);
          im.onerror = rej;
          im.src = pngUrl;
        }),
        jsonUrl ? fetch(jsonUrl).then(r => r.json()) : Promise.resolve(null)
      ]);

      let frames = [];
      let animations = {};

      if (meta) {
        const entries = Object.entries(meta.frames);
        entries.sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));

        frames = entries.map(([name, f]) => ({
          name,
          x: f.frame.x, y: f.frame.y, w: f.frame.w, h: f.frame.h,
          duration: f.duration || 100
        }));

        // Prefer official tags if present
        if (meta.meta && meta.meta.frameTags && meta.meta.frameTags.length) {
          for (const tag of meta.meta.frameTags) {
            animations[tag.name.toLowerCase()] = {
              from: tag.from, to: tag.to, direction: (tag.direction || "forward").toLowerCase()
            };
          }
        } else {
          // Fallback: infer from frame names (e.g., "...blink 0.aseprite", "...walking 3.aseprite")
          const groups = {};
          entries.forEach(([name], idx) => {
            const n = name.toLowerCase();
            let key = "blink";
            if (n.includes("walk")) key = "walk";
            else if (n.includes("run")) key = "walk";
            else if (n.includes("blink")) key = "blink";
            if (!groups[key]) groups[key] = { from: idx, to: idx };
            groups[key].to = idx;
          });
          animations = groups;
          // Ensure we have at least an blink frame
          if (!animations.blink) animations.blink = { from: 0, to: 0, direction: "forward" };
        }
      } else {
        // Single-frame fallback
        frames = [{ x: 0, y: 0, w: img.width, h: img.height, duration: 1000 }];
        animations = { blink: { from: 0, to: 0, direction: "forward" } };
      }

      resolve({ img, frames, animations });
    } catch (e) {
      reject(e);
    }
  });
}

// ===== Animator
function makeAnimator(sprite) {
  const { frames, animations } = sprite;
  let current = animations.blink ? "blink" : Object.keys(animations)[0] || "blink";
  let frameIndex = animations[current]?.from ?? 0;
  let timer = 0;

  const setAnim = (name) => {
    const key = String(name || "").toLowerCase();
    if (key === current || !animations[key]) return;
    current = key;
    frameIndex = animations[current].from;
    timer = 0;
  };

  const update = (dtMs) => {
    const anim = animations[current] ?? { from: 0, to: frames.length - 1, direction: "forward" };
    timer += dtMs;
    const f = frames[frameIndex] || frames[0];
    if (!f) return;
    if (timer >= (f.duration || 100)) {
      timer = 0;
      if (anim.direction === "reverse") {
        frameIndex = frameIndex <= anim.from ? anim.to : frameIndex - 1;
      } else {
        frameIndex = frameIndex >= anim.to ? anim.from : frameIndex + 1;
      }
    }
  };

  const draw = (ctx, x, y, scale = 3, options = {}) => {
    const f = frames[frameIndex] || frames[0];
    if (!f) return;
    const bob = options.bob ? Math.sin(Date.now() / 500) * 0.5 : 0;
    const drawX = Math.round(x - (f.w * scale) / 2);
    const drawY = Math.round(y - (f.h * scale) + bob);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite.img, f.x, f.y, f.w, f.h, drawX, drawY, f.w * scale, f.h * scale);
  };

  return { setAnim, update, draw };
}

function burstParticles(x, y, setParticles) {
  const newParticles = Array.from({ length: 20 }, (_, i) => ({
    x, y,
    vx: Math.cos((i / 20) * Math.PI * 2) * (3 + Math.random() * 2),
    vy: Math.sin((i / 20) * Math.PI * 2) * (3 + Math.random() * 2),
    h: (i * 18) % 360,
    t: 600,
  }));
  setParticles((prev) => [...prev, ...newParticles]);
}

// ===== UI Components (unchanged from your version, trimmed for space)
function Header({ zone, musicOn, setMusicOn }) {
  return (
    <header className="w-full max-w-6xl px-4 pt-6 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-lg font-bold tracking-wide">Mei Yi Yang — Interactive RPG Portfolio</div>
        <span className="text-xs px-2 py-1 rounded-full bg-white/10">{ZONES[zone].label}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => setMusicOn((v) => !v)} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition">
          {musicOn ? "Music On" : "Music Off"}
        </button>
        <a href="https://www.linkedin.com/in/meiyy" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">LinkedIn</a>
        <a href="https://github.com/mayozoz" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">GitHub</a>
        <a href="mailto:mei.yang0508@gmail.com" className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">Email</a>
      </div>
    </header>
  );
}

function ZoneBanner({ zone }) {
  return (
    <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 text-center">
      <div className="text-xs uppercase tracking-widest opacity-80">You are in</div>
      <div className="text-lg font-semibold">{ZONES[zone].label}</div>
    </div>
  );
}

function InventoryBar({ items, inventory }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-2xl">
      {items.map((item) => (
        <div key={item.id} className="w-9 h-9 grid place-items-center rounded-xl bg-black/40 border border-white/10">
          <span className={inventory[item.id] ? "opacity-100" : "opacity-30"} title={item.name}>
            {item.emoji}
          </span>
        </div>
      ))}
    </div>
  );
}

function Hint({ label }) {
  return <div className="absolute left-3 bottom-3 text-xs opacity-80 max-w-[40ch] bg-black/30 rounded-lg px-2 py-1">{label}</div>;
}

function ControlsOverlay() {
  return (
    <div className="absolute right-3 bottom-3 text-[11px] opacity-80 grid gap-1">
      <div className="bg-black/30 rounded-lg px-2 py-1">Move: WASD / Arrows</div>
      <div className="bg-black/30 rounded-lg px-2 py-1">Jump: Space</div>
      <div className="bg-black/30 rounded-lg px-2 py-1">Interact: Click / Tap</div>
    </div>
  );
}

function LiveRegion({ text }) {
  return <div className="sr-only" role="status" aria-live="polite">{text}</div>;
}

function Popup({ title, children, onClose }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="absolute inset-0 grid place-items-center bg-black/60">
      <div className="w-[min(560px,92vw)] max-h-[80vh] overflow-auto rounded-2xl bg-zinc-900/95 border border-white/10 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-sm px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20">Close</button>
        </div>
        <div className="text-sm space-y-3">{children}</div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full max-w-6xl px-4 py-6 text-xs opacity-75">
      <div>Built with HTML5 Canvas + React. Seasonal themes, keyboard accessible, local-only analytics. © {new Date().getFullYear()} Mei Yi Yang.</div>
    </footer>
  );
}

// (ArchivePanel, AsciiMorph, CodeConsole, GalleryWall, SkillTree, Guestbook, PixelTile)
// — keep your existing versions verbatim —
function ArchivePanel({ resumeUrl, onOpenGuestbook }) {
  const share = async () => {
    const text = "I explored Mei's RPG portfolio and snagged the Scroll (resume)!";
    try {
      if (navigator.share) await navigator.share({ title: "Mei RPG Portfolio", text, url: window.location.href });
      else await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      alert("Shared! (Or link copied)");
    } catch {}
  };
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-14 w-[min(92%,720px)] bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4">
      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <div className="md:col-span-2 space-y-2">
          <div className="font-semibold">The Archive</div>
          <p className="opacity-90">Library stacks, glowing scrolls, and a desk lamp hum. Pick up the Scroll to download my resume or leave a pixel art note in the Guest Book.</p>
          <div className="flex gap-2 flex-wrap">
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-amber-500/30 hover:bg-amber-500/40 border border-amber-400/40">Download Scroll (Resume)</a>
            <button onClick={onOpenGuestbook} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">Open Guest Book</button>
            <button onClick={share} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">Share</button>
          </div>
        </div>
        <AsciiMorph />
      </div>
    </div>
  );
}
function AsciiMorph(){const [i,setI]=useState(0);useEffect(()=>{const t=setInterval(()=>setI(v=>(v+1)%CODE_SNIPPETS.length),2800);return()=>clearInterval(t)},[]);const s=CODE_SNIPPETS[i];return(<div className="bg-black/40 rounded-xl p-3 border border-white/10"><div className="text-xs opacity-70">ASCII Code</div><pre className="text-[11px] leading-snug bg-black/30 p-2 rounded border border-white/5 overflow-auto max-h-32 mt-2">{s.code}</pre></div>);}
function CodeConsole(){const [code,setCode]=useState("// Try editing and Run\nconst fib = (n)=>n<2?n:fib(n-1)+fib(n-2);\nfib(10);");const [out,setOut]=useState("");const run=()=>{try{const r=Function(`"use strict"; return (function(){ ${code} })()` )();setOut(String(r))}catch(e){setOut(String(e))}};return(<div className="absolute right-4 top-16 w-[min(92vw,420px)] bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-3"><div className="text-sm font-semibold mb-1">Run-Code Console</div><textarea value={code} onChange={e=>setCode(e.target.value)} className="w-full h-40 bg-black/50 border border-white/10 rounded-lg p-2 font-mono text-xs resize-none" /><div className="mt-2 flex gap-2"><button onClick={run} className="px-3 py-1.5 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/40 border border-emerald-400/40">Run</button><div className="text-xs opacity-80 self-center">Output: {out}</div></div></div>);}
function GalleryWall(){const samples=[{id:"tattoo1",label:"Tattoo Flash A",emoji:"🖋️"},{id:"tattoo2",label:"Tattoo Flash B",emoji:"🖋️"},{id:"csa1",label:"CSA Poster",emoji:"🎨"},{id:"art1",label:"Digital Art",emoji:"🖼️"}];const [open,setOpen]=useState(null);return(<div className="absolute left-4 top-16 right-4 grid grid-cols-2 md:grid-cols-4 gap-3">{samples.map(s=>(<button key={s.id} onClick={()=>setOpen(s)} className="aspect-[3/4] rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20"><div className="text-center text-xs"><div className="text-2xl">{s.emoji}</div><div>{s.label}</div><div className="opacity-60">(high-res on click)</div></div></button>))}{open&&(<Popup title={open.label} onClose={()=>setOpen(null)}><div className="w-full aspect-video bg-black/40 border border-white/10 rounded-xl grid place-items-center"><div className="opacity-80">High-res preview placeholder — replace with real images.</div></div><div className="text-xs opacity-75">Tip: Replace the GalleryWall samples with your actual image URLs.</div></Popup>)}</div>);}
function SkillTree(){const skills=[{k:"Languages",kids:["C++","Python","JavaScript","Java","SQL"]},{k:"AI/ML",kids:["PyTorch","Transformers","BERT/NLLB","Pandas/NumPy"]},{k:"Systems",kids:["Linux","GDB","Distributed","Databases"]},{k:"Frontend",kids:["React","HTML/CSS","UX","Canvas/WebGL"]},];return(<div className="absolute left-1/2 -translate-x-1/2 top-16 w=[min(92%,720px)] bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4"><div className="text-sm font-semibold mb-2">Skill Trees</div><div className="grid md:grid-cols-2 gap-3">{skills.map(s=>(<div key={s.k} className="rounded-xl bg-black/40 border border-white/10 p-3"><div className="font-medium mb-1">{s.k}</div><div className="flex flex-wrap gap-2">{s.kids.map(t=>(<span key={t} className="px-2 py-1 rounded-lg bg-white/10 text-xs border border-white/10">{t}</span>))}</div></div>))}</div></div>);}
function Guestbook(){const SIZE=16;const [grid,setGrid]=useState(()=>Array.from({length:SIZE},()=>Array(SIZE).fill(0)));const [posts,setPosts]=useState([]);const toggle=(x,y)=>setGrid(g=>{const n=g.map(r=>r.slice());n[y][x]=g[y][x]?0:1;return n;});const addPost=()=>{const data=grid.flat().join("");setPosts(p=>[{id:Date.now(),data},...p].slice(0,24));};return(<div className="grid gap-3"><div className="text-sm">Leave a pixel art note</div><div className="flex gap-4 flex-wrap items-start"><div className="grid" style={{gridTemplateColumns:`repeat(${SIZE}, 16px)`}}>{grid.flatMap((row,y)=>row.map((v,x)=>(<button key={`${x}-${y}`} onClick={()=>toggle(x,y)} className={`w-4 h-4 border border-white/10 ${v?"bg-white":"bg-black/40"}`} aria-label={`toggle pixel ${x+1},${y+1}`} />)))}</div><div className="grid gap-2"><button onClick={addPost} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Post</button><button onClick={()=>setGrid(Array.from({length:SIZE},()=>Array(SIZE).fill(0)))} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Clear</button></div></div><div className="grid grid-cols-4 gap-2">{posts.map(p=>(<PixelTile key={p.id} data={p.data} size={SIZE} />))}</div></div>);}
function PixelTile({data,size}){return(<div className="rounded-lg overflow-hidden border border-white/10"><div className="grid" style={{gridTemplateColumns:`repeat(${size}, 6px)`}}>{data.split("").map((c,i)=>(<div key={i} className={`w-[6px] h-[6px] ${c==="1"?"bg-white":"bg-black/40"}`} />))}</div></div>);}

// ===== Favicon helper (optional)
function trySetFaviconFromSprite(sprite){
  try{
    const link = document.querySelector("link[rel='icon']") || Object.assign(document.createElement("link"), { rel: "icon" });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const f = sprite.frames[0];
    const SIZE = 64; // crisp on HiDPI
    canvas.width = SIZE; canvas.height = SIZE;
    ctx.imageSmoothingEnabled = false;
    // draw the first frame centered
    const scale = Math.min(SIZE / f.w, SIZE / f.h);
    const dw = Math.round(f.w * scale), dh = Math.round(f.h * scale);
    const dx = Math.round((SIZE - dw)/2), dy = Math.round((SIZE - dh)/2);
    ctx.drawImage(sprite.img, f.x, f.y, f.w, f.h, dx, dy, dw, dh);
    link.href = canvas.toDataURL("image/png");
    document.head.appendChild(link);
  }catch{}
}