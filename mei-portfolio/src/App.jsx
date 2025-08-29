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
const DEFAULT_RESUME_URL = "https://raw.githubusercontent.com/mayozoz/mayozoz.github.io/main/Meiyiyang%20Aug%2025%202025.pdf";

const CODE_SNIPPETS = [
  {
    title: "MapReduce Worker",
    lang: "python",
    code: `class Worker:\n  def handle_map(self, task):\n    kv = []\n    for chunk in task.chunks:\n      kv += map_fn(chunk)\n    return partition(kv)`,
  },
  {
    title: "Priority Order Book",
    lang: "cpp", 
    code: `struct Order{int id; double px; long ts;};\npriority_queue<Order, vector<Order>, Cmp> book;`,
  },
  {
    title: "React Drag‑n‑Drop UI",
    lang: "jsx",
    code: `function DropZone(){\n  const [files,setFiles] = useState([])\n  return <div onDrop={e=>setFiles([...files,...e.dataTransfer.files])}/>\n}`,
  },
];

const ITEMS = [
  { id: "neural_net", name: "Neural Network", emoji: "🧠", zone: "north", blurb: "AI Engineering @ NetEase YouDao — MT quality estimation for low‑resource pairs; COMET/chrF++/BERTScore, LLM‑ranked eval." },
  { id: "react_component", name: "React Component", emoji: "⚛️", zone: "east", blurb: "Frontend Research Assistant — React app for zebrafish thrombosis analysis; drag‑and‑drop UX, customizable pipelines." },
  { id: "tencent_cloud", name: "Cloud Icon", emoji: "🏢", zone: "west", blurb: "Tencent Cloud Ops — pricing analytics, competitor benchmarks; HunYuan bot automated workflows." },
  { id: "apple_pencil", name: "Apple Pencil", emoji: "🎨", zone: "east", blurb: "Graphic design portfolio & CSA posters/banners — process and polish." },
  { id: "tattoo_gun", name: "Tattoo Gun", emoji: "🖋️", zone: "east", blurb: "Tattoo flash + linework studies — gallery wall & timelapses." },
  { id: "zebrafish", name: "Zebrafish", emoji: "🐟", zone: "north", blurb: "Zebrafish image analysis — research collab UI and image tooling." },
  { id: "database", name: "Database", emoji: "📊", zone: "west", blurb: "Databases & systems projects — Piazza classifier, MapReduce library, stock simulator." },
  { id: "game_controller", name: "Game Controller", emoji: "🎮", zone: "center", blurb: "Personal game/creative experiments — shaders, input, tiny prototypes." },
];

const ZONES = {
  center: { label: "Present Me — Central Hub", theme: { hue: 280, pattern: "stars" }, hint: "WASD/Arrows to move. Click glowing objects to inspect/collect." },
  north: { label: "The Lab — AI/ML Engineer", theme: { hue: 200, pattern: "circuits" }, hint: "Floating code and evaluation metrics hover here." },
  east: { label: "The Studio — Artist/Designer", theme: { hue: 15, pattern: "strokes" }, hint: "Tap a frame to open gallery. Magic mirrors show process videos." },
  west: { label: "The Workshop — Full‑Stack Developer", theme: { hue: 140, pattern: "grid" }, hint: "Skill trees on walls; try the run‑code console." },
  south: { label: "The Archive — About / Resume / Contact", theme: { hue: 50, pattern: "scrolls" }, hint: "Download the scroll (resume) and leave a pixel art message." },
};

// ===== Main Component
export default function PersonalRPGPortfolio({ resumeUrl = DEFAULT_RESUME_URL }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const animationRef = useRef();
  const keysRef = useRef({});
  
  const [size, setSize] = useState({ w: 960, h: 540 });
  const [loaded, setLoaded] = useState(false);
  const [zone, setZone] = useState("center");
  const [cursor, setCursor] = useState("default");
  const [popup, setPopup] = useState(null);
  const [inventory, setInventory] = useState({});
  const [particles, setParticles] = useState([]);
  const [announce, setAnnounce] = useState("");
  const [konami, setKonami] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  
  // Player state - start at world center
  const [player, setPlayer] = useState({ x: 960, y: 960, vx: 0, vy: 0, dir: "S" });

  // World constants
  const TILE = 32;
  const WORLD = { w: 1920, h: 1920 };
  const CENTER = { x: WORLD.w / 2, y: WORLD.h / 2 };

  // Item positions in world coordinates
  const itemSpawns = useMemo(() => ({
    neural_net: { x: CENTER.x, y: CENTER.y - 200 },
    zebrafish: { x: CENTER.x - 150, y: CENTER.y - 180 },
    react_component: { x: CENTER.x + 200, y: CENTER.y },
    apple_pencil: { x: CENTER.x + 180, y: CENTER.y + 120 },
    tattoo_gun: { x: CENTER.x + 120, y: CENTER.y + 180 },
    tencent_cloud: { x: CENTER.x - 200, y: CENTER.y },
    database: { x: CENTER.x - 180, y: CENTER.y + 120 },
    game_controller: { x: CENTER.x, y: CENTER.y + 100 },
  }), [CENTER.x, CENTER.y]);

  const gates = useMemo(() => [
    { id: "north", x: CENTER.x, y: CENTER.y - 120, r: 40 },
    { id: "east", x: CENTER.x + 120, y: CENTER.y, r: 40 },
    { id: "west", x: CENTER.x - 120, y: CENTER.y, r: 40 },
    { id: "south", x: CENTER.x, y: CENTER.y + 120, r: 40 },
  ], [CENTER.x, CENTER.y]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const ratio = getDeviceRatio(ctx);

    function resizeCanvas() {
      const container = wrapRef.current;
      if (!container) return;
      
      const w = Math.max(640, container.clientWidth - 32);
      const h = Math.max(400, Math.round(w * 9 / 16));
      
      setSize({ w, h });
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }

    resizeCanvas();
    
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(document.body);
    
    setTimeout(() => setLoaded(true), 100);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current[e.key.toLowerCase()] = true;
    };
    
    const handleKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!loaded) return;
    
    let lastTime = 0;
    
    const gameLoop = (currentTime) => {
      const deltaTime = Math.min(16, currentTime - lastTime);
      lastTime = currentTime;
      
      // Update player movement
      setPlayer(prevPlayer => {
        const keys = keysRef.current;
        const speed = 3; // pixels per frame
        
        let vx = 0, vy = 0;
        if (keys['w'] || keys['arrowup']) vy = -1;
        if (keys['s'] || keys['arrowdown']) vy = 1;
        if (keys['a'] || keys['arrowleft']) vx = -1;
        if (keys['d'] || keys['arrowright']) vx = 1;
        
        // Normalize diagonal movement
        if (vx && vy) {
          const length = Math.sqrt(vx * vx + vy * vy);
          vx /= length;
          vy /= length;
        }
        
        // Calculate new position
        const newX = clamp(prevPlayer.x + vx * speed, 50, WORLD.w - 50);
        const newY = clamp(prevPlayer.y + vy * speed, 50, WORLD.h - 50);
        
        // Update direction
        let dir = prevPlayer.dir;
        if (Math.abs(vx) > Math.abs(vy)) {
          dir = vx > 0 ? "E" : vx < 0 ? "W" : dir;
        } else if (vy !== 0) {
          dir = vy > 0 ? "S" : "N";
        }
        
        return { x: newX, y: newY, vx, vy, dir };
      });
      
      // Update zone
      const currentZone = computeZone(player, CENTER);
      if (currentZone !== zone) {
        setZone(currentZone);
        setAnnounce(ZONES[currentZone].label);
      }
      
      // Render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        render(ctx, size, player, zone, inventory, itemSpawns, gates, particles, konami, CENTER, WORLD);
      }
      
      // Update particles
      setParticles(prev => prev
        .map(p => ({ ...p, t: p.t - deltaTime }))
        .filter(p => p.t > 0)
      );
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [loaded, size, player, zone, inventory, particles, konami, CENTER, WORLD]);

  // Click/tap handling
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert screen coordinates to world coordinates
    const worldX = x - size.w / 2 + player.x;
    const worldY = y - size.h / 2 + player.y;
    
    // Check items
    for (const item of ITEMS) {
      const itemPos = itemSpawns[item.id];
      if (!itemPos) continue;
      
      const distance = dist({ x: worldX, y: worldY }, itemPos);
      if (distance < 30) {
        const playerDistance = dist(player, itemPos);
        if (playerDistance < 80) {
          if (!inventory[item.id]) {
            setInventory(prev => ({ ...prev, [item.id]: true }));
            
            // Add particle effect at screen position
            burstParticles(x, y, setParticles);
            setAnnounce(`${item.name} collected`);
          }
          
          setPopup({ title: `${item.emoji} ${item.name}`, body: item.blurb });
          return;
        }
      }
    }
    
    // Check gates
    for (const gate of gates) {
      const distance = dist({ x: worldX, y: worldY }, gate);
      if (distance < gate.r) {
        setPlayer(prev => ({ ...prev, x: gate.x, y: gate.y }));
        setAnnounce(ZONES[gate.id].label);
        break;
      }
    }
  };

  const allFound = ITEMS.every(item => inventory[item.id]);

  return (
    <div ref={wrapRef} className="w-full h-full min-h-screen flex flex-col items-center bg-black text-white">
      <Header zone={zone} musicOn={musicOn} setMusicOn={setMusicOn} />
      
      <div 
        className="relative select-none"
        style={{ width: size.w, height: size.h, cursor }}
        onClick={handleClick}
      >
        <canvas ref={canvasRef} className="rounded-2xl shadow-xl border border-white/10" />
        
        <ZoneBanner zone={zone} />
        <InventoryBar items={ITEMS} inventory={inventory} />
        <Hint label={ZONES[zone].hint} />
        <ControlsOverlay />
        
        {konami && <KonamiBadge />}
        <LiveRegion text={announce} />
        
        {zone === "south" && <ArchivePanel resumeUrl={resumeUrl} onOpenGuestbook={() => setPopup({ title: "Guest Book", body: "guestbook" })} />}
        {zone === "west" && <CodeConsole />}
        {zone === "east" && <GalleryWall />}
        {zone === "north" && <SkillTree />}
        
        {popup && (
          <Popup onClose={() => setPopup(null)} title={popup.title}>
            {popup.body === "guestbook" ? <Guestbook /> : <p className="leading-relaxed text-sm">{popup.body}</p>}
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

// ===== Helper Functions
function computeZone(player, center) {
  const dx = player.x - center.x;
  const dy = player.y - center.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < 150) return "center";
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "east" : "west";
  } else {
    return dy < 0 ? "north" : "south";
  }
}

function render(ctx, size, player, zone, inventory, itemSpawns, gates, particles, konami, center, world) {
  ctx.clearRect(0, 0, size.w, size.h);
  
  // Calculate camera offset (player stays centered)
  const cameraX = player.x - size.w / 2;
  const cameraY = player.y - size.h / 2;
  
  // Draw background
  drawBackground(ctx, size, zone);
  
  // Draw world objects in screen space
  ctx.save();
  ctx.translate(-cameraX, -cameraY);
  
  // Draw hub
  drawHub(ctx, center);
  
  // Draw gates
  gates.forEach(gate => {
    drawGate(ctx, gate);
  });
  
  // Draw items
  ITEMS.forEach(item => {
    const pos = itemSpawns[item.id];
    if (pos) {
      drawItem(ctx, pos.x, pos.y, item.emoji, inventory[item.id]);
    }
  });
  
  // Draw player
  drawPlayer(ctx, player.x, player.y, player.dir, konami);
  
  ctx.restore();
  
  // Draw particles (in screen space)
  particles.forEach(particle => {
    ctx.save();
    ctx.globalAlpha = particle.t / 600;
    ctx.fillStyle = `hsl(${particle.h}, 95%, 70%)`;
    const screenX = particle.x + particle.vx * (600 - particle.t) * 0.02;
    const screenY = particle.y + particle.vy * (600 - particle.t) * 0.02;
    ctx.fillRect(screenX, screenY, 3, 3);
    ctx.restore();
  });
}

function drawBackground(ctx, size, zone) {
  const theme = ZONES[zone].theme;
  ctx.fillStyle = `hsl(${theme.hue}, 40%, 8%)`;
  ctx.fillRect(0, 0, size.w, size.h);
  
  // Add pattern overlay
  ctx.save();
  ctx.globalAlpha = 0.3;
  
  switch (theme.pattern) {
    case "circuits":
      ctx.strokeStyle = `hsl(${theme.hue}, 60%, 50%)`;
      ctx.lineWidth = 1;
      for (let y = 16; y < size.h; y += 48) {
        for (let x = 16; x < size.w; x += 64) {
          ctx.strokeRect(x, y, 24, 16);
        }
      }
      break;
    case "strokes":
      for (let i = 0; i < 60; i++) {
        ctx.strokeStyle = `hsl(${theme.hue}, 70%, ${30 + (i % 40)})`;
        ctx.beginPath();
        ctx.arc((i * 37) % size.w, (i * 59) % size.h, 14 + (i % 9), 0.7, 2.2);
        ctx.stroke();
      }
      break;
    case "grid":
      ctx.strokeStyle = `hsl(${theme.hue}, 30%, 30%)`;
      ctx.lineWidth = 1;
      for (let x = 0; x < size.w; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size.h);
        ctx.stroke();
      }
      for (let y = 0; y < size.h; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size.w, y);
        ctx.stroke();
      }
      break;
    default:
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `hsl(${theme.hue}, 80%, ${40 + (i % 30)})`;
        ctx.fillRect((i * 53) % size.w, (i * 37) % size.h, 2, 2);
      }
  }
  
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

function drawGate(ctx, gate) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.arc(gate.x, gate.y, gate.r, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "white";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(gate.id[0].toUpperCase(), gate.x, gate.y);
  ctx.restore();
}

function drawItem(ctx, x, y, emoji, collected) {
  ctx.save();
  ctx.font = "24px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = collected ? 0.4 : 1;
  ctx.fillText(emoji, x, y);
  
  if (!collected) {
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlayer(ctx, x, y, dir, konami) {
  ctx.save();
  
  // Body
  ctx.fillStyle = "#f2dede";
  ctx.fillRect(x - 8, y - 12, 16, 16);
  
  // Hair
  ctx.fillStyle = "#7a1b1b";
  ctx.fillRect(x - 10, y - 16, 20, 8);
  
  // Clothes
  ctx.fillStyle = "#c59cff";
  ctx.fillRect(x - 10, y + 2, 20, 12);
  
  // Shoes
  ctx.fillStyle = "#333";
  ctx.fillRect(x - 10, y + 12, 8, 4);
  ctx.fillRect(x + 2, y + 12, 8, 4);
  
  // Direction indicator
  ctx.fillStyle = "black";
  switch (dir) {
    case "N": ctx.fillRect(x - 2, y - 10, 4, 2); break;
    case "S": ctx.fillRect(x - 2, y - 6, 4, 2); break;
    case "E": ctx.fillRect(x + 4, y - 8, 2, 4); break;
    case "W": ctx.fillRect(x - 6, y - 8, 2, 4); break;
  }
  
  if (konami) {
    ctx.strokeStyle = "#ff66ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 25 + Math.sin(Date.now() / 200) * 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  ctx.restore();
}

function burstParticles(x, y, setParticles) {
  const newParticles = Array.from({ length: 20 }, (_, i) => ({
    x,
    y,
    vx: Math.cos((i / 20) * Math.PI * 2) * (3 + Math.random() * 2),
    vy: Math.sin((i / 20) * Math.PI * 2) * (3 + Math.random() * 2),
    h: (i * 18) % 360,
    t: 600,
  }));
  
  setParticles(prev => [...prev, ...newParticles]);
}

// ===== UI Components
function Header({ zone, musicOn, setMusicOn }) {
  return (
    <header className="w-full max-w-6xl px-4 pt-6 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-lg font-bold tracking-wide">Mei Yi Yang — Interactive RPG Portfolio</div>
        <span className="text-xs px-2 py-1 rounded-full bg-white/10">{ZONES[zone].label}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => setMusicOn(v => !v)}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition"
        >
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
      {items.map(item => (
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
  return (
    <div className="absolute left-3 bottom-3 text-xs opacity-80 max-w-[40ch] bg-black/30 rounded-lg px-2 py-1">
      {label}
    </div>
  );
}

function ControlsOverlay() {
  return (
    <div className="absolute right-3 bottom-3 text-[11px] opacity-80 grid gap-1">
      <div className="bg-black/30 rounded-lg px-2 py-1">Move: WASD / Arrows</div>
      <div className="bg-black/30 rounded-lg px-2 py-1">Interact: Click / Tap</div>
    </div>
  );
}

function LiveRegion({ text }) {
  return <div className="sr-only" role="status" aria-live="polite">{text}</div>;
}

function Popup({ title, children, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
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
      <div>Built with HTML5 Canvas + React. Seasonal themes, keyboard accessible, local‑only analytics. © {new Date().getFullYear()} Mei Yi Yang.</div>
    </footer>
  );
}

// Zone-specific panels
function ArchivePanel({ resumeUrl, onOpenGuestbook }) {
  const share = async () => {
    const text = "I explored Mei's RPG portfolio and snagged the Scroll (resume)!";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mei RPG Portfolio", text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      }
      alert("Shared! (Or link copied)");
    } catch (e) {
      // Ignore errors
    }
  };

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-14 w-[min(92%,720px)] bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4">
      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <div className="md:col-span-2 space-y-2">
          <div className="font-semibold">The Archive</div>
          <p className="opacity-90">Library stacks, glowing scrolls, and a desk lamp hum. Pick up the Scroll to download my resume or leave a pixel art note in the Guest Book.</p>
          <div className="flex gap-2 flex-wrap">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-amber-500/30 hover:bg-amber-500/40 border border-amber-400/40"
            >
              Download Scroll (Resume)
            </a>
            <button onClick={onOpenGuestbook} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">
              Open Guest Book
            </button>
            <button onClick={share} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">
              Share
            </button>
          </div>
        </div>
        <AsciiMorph />
      </div>
    </div>
  );
}

function AsciiMorph() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setI(v => (v + 1) % CODE_SNIPPETS.length), 2800);
    return () => clearInterval(timer);
  }, []);
  
  const snippet = CODE_SNIPPETS[i];
  return (
    <div className="bg-black/40 rounded-xl p-3 border border-white/10">
      <div className="text-xs opacity-70">ASCII Code</div>
      <pre className="text-[11px] leading-snug bg-black/30 p-2 rounded border border-white/5 overflow-auto max-h-32 mt-2">
        {snippet.code}
      </pre>
    </div>
  );
}

function CodeConsole() {
  const [code, setCode] = useState("// Try editing and Run\nconst fib = (n)=>n<2?n:fib(n-1)+fib(n-2);\nfib(10);");
  const [output, setOutput] = useState("");
  
  const runCode = () => {
    try {
      const result = Function(`"use strict"; return (function(){ ${code} })()`)();
      setOutput(String(result));
    } catch (error) {
      setOutput(String(error));
    }
  };
  
  return (
    <div className="absolute right-4 top-16 w-[min(92vw,420px)] bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-3">
      <div className="text-sm font-semibold mb-1">Run-Code Console</div>
      <textarea
        value={code}
        onChange={e => setCode(e.target.value)}
        className="w-full h-40 bg-black/50 border border-white/10 rounded-lg p-2 font-mono text-xs resize-none"
      />
      <div className="mt-2 flex gap-2">
        <button onClick={runCode} className="px-3 py-1.5 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/40 border border-emerald-400/40">
          Run
        </button>
        <div className="text-xs opacity-80 self-center">Output: {output}</div>
      </div>
    </div>
  );
}

function GalleryWall() {
  const samples = [
    { id: "tattoo1", label: "Tattoo Flash A", emoji: "🖋️" },
    { id: "tattoo2", label: "Tattoo Flash B", emoji: "🖋️" },
    { id: "csa1", label: "CSA Poster", emoji: "🎨" },
    { id: "art1", label: "Digital Art", emoji: "🖼️" },
  ];
  const [open, setOpen] = useState(null);
  
  return (
    <div className="absolute left-4 top-16 right-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      {samples.map(s => (
        <button
          key={s.id}
          onClick={() => setOpen(s)}
          className="aspect-[3/4] rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20"
        >
          <div className="text-center text-xs">
            <div className="text-2xl">{s.emoji}</div>
            <div>{s.label}</div>
            <div className="opacity-60">(high-res on click)</div>
          </div>
        </button>
      ))}

      {open && (
        <Popup title={open.label} onClose={() => setOpen(null)}>
          <div className="w-full aspect-video bg-black/40 border border-white/10 rounded-xl grid place-items-center">
            <div className="opacity-80">High-res preview placeholder — replace with real images.</div>
          </div>
          <div className="text-xs opacity-75">Tip: Replace the GalleryWall samples with your actual image URLs.</div>
        </Popup>
      )}
    </div>
  );
}

function SkillTree() {
  const skills = [
    { k: "Languages", kids: ["C++", "Python", "JavaScript", "Java", "SQL"] },
    { k: "AI/ML", kids: ["PyTorch", "Transformers", "BERT/NLLB", "Pandas/NumPy"] },
    { k: "Systems", kids: ["Linux", "GDB", "Distributed", "Databases"] },
    { k: "Frontend", kids: ["React", "HTML/CSS", "UX", "Canvas/WebGL"] },
  ];
  
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-16 w-[min(92%,720px)] bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Skill Trees</div>
      <div className="grid md:grid-cols-2 gap-3">
        {skills.map(skill => (
          <div key={skill.k} className="rounded-xl bg-black/40 border border-white/10 p-3">
            <div className="font-medium mb-1">{skill.k}</div>
            <div className="flex flex-wrap gap-2">
              {skill.kids.map(tech => (
                <span key={tech} className="px-2 py-1 rounded-lg bg-white/10 text-xs border border-white/10">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Guestbook() {
  const SIZE = 16;
  const [grid, setGrid] = useState(() => Array.from({ length: SIZE }, () => Array(SIZE).fill(0)));
  const [posts, setPosts] = useState([]);

  const toggle = (x, y) => {
    setGrid(g => {
      const next = g.map(row => row.slice());
      next[y][x] = g[y][x] ? 0 : 1;
      return next;
    });
  };

  const addPost = () => {
    const data = grid.flat().join("");
    const next = [{ id: Date.now(), data }, ...posts].slice(0, 24);
    setPosts(next);
  };

  return (
    <div className="grid gap-3">
      <div className="text-sm">Leave a pixel art note</div>
      <div className="flex gap-4 flex-wrap items-start">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 16px)` }}>
          {grid.flatMap((row, y) =>
            row.map((value, x) => (
              <button
                key={`${x}-${y}`}
                onClick={() => toggle(x, y)}
                className={`w-4 h-4 border border-white/10 ${value ? "bg-white" : "bg-black/40"}`}
                aria-label={`toggle pixel ${x + 1},${y + 1}`}
              />
            ))
          )}
        </div>
        <div className="grid gap-2">
          <button onClick={addPost} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm">
            Post
          </button>
          <button onClick={() => setGrid(Array.from({ length: SIZE }, () => Array(SIZE).fill(0)))} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm">
            Clear
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {posts.map(post => (
          <PixelTile key={post.id} data={post.data} size={SIZE} />
        ))}
      </div>
    </div>
  );
}

function PixelTile({ data, size }) {
  return (
    <div className="rounded-lg overflow-hidden border border-white/10">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${size}, 6px)` }}>
        {data.split("").map((cell, index) => (
          <div key={index} className={`w-[6px] h-[6px] ${cell === "1" ? "bg-white" : "bg-black/40"}`} />
        ))}
      </div>
    </div>
  );
}

function KonamiBadge() {
  return (
    <div className="absolute top-3 left-3 text-xs px-2 py-1 rounded-lg bg-fuchsia-500/30 border border-fuchsia-400/40">
      Secret: Dance Floor unlocked
    </div>
  );
}