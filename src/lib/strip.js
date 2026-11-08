// Everything about the strip itself: size, backdrops, filters, fonts and the renderer.

/* Export size in px. Photos are 4:3. */
export const W = 600;
export const H = 1500;
export const PW = 520;
export const PH = 390;
export const PX = 40;
export const PYS = [40, 460, 880];

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const loadImg = (src) =>
  new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

export const today = () => {
  const d = new Date();
  return [d.getDate(), d.getMonth() + 1, d.getFullYear()]
    .map((n) => String(n).padStart(2, "0"))
    .join(" · ");
};

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

/* ---------- backdrops ----------
   Each one paints the full W×H strip. `ink` is the caption colour. */
export const BACKDROPS = [
  { id: "cream", name: "Cream", ink: "#3a2416", draw: (c) => { c.fillStyle = "#f6efe2"; c.fillRect(0, 0, W, H); } },
  { id: "ink", name: "Black", ink: "#f6efe2", draw: (c) => { c.fillStyle = "#141212"; c.fillRect(0, 0, W, H); } },
  {
    id: "film", name: "Film", ink: "#f6efe2",
    draw: (c) => {
      c.fillStyle = "#0f0e0d"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#f3e6c8";
      for (let y = 14; y < H; y += 36) {
        rrect(c, 11, y, 18, 14, 3); c.fill();
        rrect(c, W - 29, y, 18, 14, 3); c.fill();
      }
    },
  },
  { id: "blush", name: "Blush", ink: "#7a2140", draw: (c) => { c.fillStyle = "#f8c8d4"; c.fillRect(0, 0, W, H); } },
  {
    id: "dots", name: "Polka", ink: "#7a2140",
    draw: (c) => {
      c.fillStyle = "#ff8fb1"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#fff4f7";
      for (let y = 0, r = 0; y < H + 40; y += 40, r++)
        for (let x = (r % 2) * 20; x < W + 40; x += 40) {
          c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.fill();
        }
    },
  },
  {
    id: "checker", name: "Checker", ink: "#1d1d1d",
    draw: (c) => {
      c.fillStyle = "#fff8e7"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#1d1d1d";
      const s = 50;
      for (let y = 0; y < H; y += s)
        for (let x = 0; x < W; x += s) if (((x + y) / s) % 2 === 0) c.fillRect(x, y, s, s);
    },
  },
  {
    id: "stripes", name: "Candy", ink: "#a3122a",
    draw: (c) => {
      c.fillStyle = "#fff6f0"; c.fillRect(0, 0, W, H);
      c.save(); c.translate(W / 2, H / 2); c.rotate(-Math.PI / 4);
      c.fillStyle = "#ff5a6e";
      for (let x = -H; x < H; x += 60) c.fillRect(x, -H, 26, H * 2);
      c.restore();
    },
  },
  { id: "mint", name: "Mint", ink: "#164a3b", draw: (c) => { c.fillStyle = "#bfe8d6"; c.fillRect(0, 0, W, H); } },
  {
    id: "sky", name: "Sky", ink: "#16325c",
    draw: (c) => {
      c.fillStyle = "#cfe4ff"; c.fillRect(0, 0, W, H);
      c.strokeStyle = "rgba(22,50,92,.18)"; c.lineWidth = 2;
      for (let x = 0; x <= W; x += 30) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
      for (let y = 0; y <= H; y += 30) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    },
  },
  {
    id: "sunset", name: "Sunset", ink: "#ffffff",
    draw: (c) => {
      const g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#ffb88c"); g.addColorStop(0.5, "#ff6a88"); g.addColorStop(1, "#7b2ff7");
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    },
  },
  {
    id: "ocean", name: "Ocean", ink: "#ffffff",
    draw: (c) => {
      const g = c.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#2b5876"); g.addColorStop(1, "#4e4376");
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    },
  },
  { id: "butter", name: "Butter", ink: "#5a3b00", draw: (c) => { c.fillStyle = "#ffe08a"; c.fillRect(0, 0, W, H); } },
];

export const FILTERS = [
  { id: "none", name: "Natural", css: "none" },
  { id: "bw", name: "B&W", css: "grayscale(1) contrast(1.15)" },
  { id: "sepia", name: "Sepia", css: "sepia(.75) contrast(1.05)" },
  { id: "vivid", name: "Vivid", css: "saturate(1.45) contrast(1.06)" },
  { id: "fade", name: "Faded", css: "contrast(.85) brightness(1.08) saturate(.8)" },
];

export const FONTS = {
  retro: { name: "Retro", family: "Shrikhand, Georgia, serif", weight: "" },
  hand: { name: "Handwritten", family: "Caveat, 'Comic Sans MS', cursive", weight: "" },
  bold: { name: "Bold", family: "'Bricolage Grotesque', system-ui, sans-serif", weight: "800 " },
  type: { name: "Typewriter", family: "'DM Mono', 'Courier New', monospace", weight: "" },
};
export const fontFor = (key, size) => `${FONTS[key].weight}${size}px ${FONTS[key].family}`;

export const STICKERS = ["⭐","💖","✨","🌸","🔥","😎","🎀","🌈","🍓","🦋","👑","💋","🌙","☁️","🍒","🎉","💫","🫶","😜","🐱","🌻","💌","📸","🍕"];
export const COLORS = ["#ffffff","#1d1d1d","#ff5a6e","#e8b04b","#3fa37f","#3b6fd8","#a855f7","#ff8fb1"];

/* Fonts the canvas uses; load them before drawing so text isn't drawn in a fallback face. */
export const CANVAS_FONTS = ["54px Shrikhand", "40px Caveat", "800 40px 'Bricolage Grotesque'", "500 22px 'DM Mono'"];

/**
 * Draw the whole strip.
 * s = { photos, bgId, filterId, items, caption, selectedId, dateStr }
 * boxes (optional) is filled with each item's hit box, used for dragging.
 */
export function renderStrip(ctx, s, boxes) {
  const bd = BACKDROPS.find((b) => b.id === s.bgId) || BACKDROPS[0];
  const flt = FILTERS.find((f) => f.id === s.filterId) || FILTERS[0];

  ctx.save(); ctx.clearRect(0, 0, W, H); bd.draw(ctx); ctx.restore();

  // photos
  PYS.forEach((py, i) => {
    const p = s.photos[i];
    if (p) {
      ctx.save(); ctx.filter = flt.css; ctx.drawImage(p.img, PX, py, PW, PH); ctx.restore();
    } else {
      ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.fillRect(PX, py, PW, PH);
    }
  });

  // caption + date
  ctx.save();
  ctx.fillStyle = bd.ink; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.font = "54px Shrikhand, Georgia, serif";
  ctx.fillText(s.caption || "", W / 2, 1372, W - 60);
  ctx.font = "500 22px 'DM Mono', monospace";
  try { ctx.letterSpacing = "4px"; } catch { /* older browsers */ }
  ctx.globalAlpha = 0.75;
  ctx.fillText(s.dateStr, W / 2, 1422);
  ctx.restore();

  // stickers + text
  s.items.forEach((it) => {
    ctx.save();
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    let w, h;
    if (it.type === "sticker") {
      ctx.font = `${it.size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.fillText(it.content, it.x, it.y);
      w = it.size * 1.15; h = it.size * 1.15;
    } else {
      ctx.font = fontFor(it.font, it.size);
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(4, it.size / 7);
      ctx.strokeStyle = it.color === "#ffffff" ? "rgba(0,0,0,.55)" : "#ffffff";
      ctx.strokeText(it.content, it.x, it.y);
      ctx.fillStyle = it.color;
      ctx.fillText(it.content, it.x, it.y);
      w = ctx.measureText(it.content).width + 16; h = it.size * 1.2;
    }
    if (boxes) boxes[it.id] = { x: it.x - w / 2, y: it.y - h / 2, w, h };
    if (s.selectedId === it.id) {
      ctx.setLineDash([10, 8]); ctx.lineWidth = 3; ctx.strokeStyle = "#e8b04b";
      ctx.strokeRect(it.x - w / 2 - 6, it.y - h / 2 - 6, w + 12, h + 12);
    }
    ctx.restore();
  });
}

/* Render the strip off-screen (no selection box) and return a PNG blob URL. */
export function exportStrip(strip) {
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  renderStrip(c.getContext("2d"), { ...strip, selectedId: null });
  return new Promise((res) => c.toBlob((blob) => res(URL.createObjectURL(blob)), "image/png"));
}
