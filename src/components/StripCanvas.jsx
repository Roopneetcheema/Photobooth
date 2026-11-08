import { useEffect, useRef } from "react";
import { W, H, clamp, renderStrip } from "../lib/strip.js";

// Live preview of the strip. When `interactive`, items can be clicked to select and dragged to move.
export default function StripCanvas({ strip, interactive, onSelect, onMove, tick }) {
  const ref = useRef(null);
  const boxes = useRef({});
  const drag = useRef(null);

  useEffect(() => {
    const ctx = ref.current.getContext("2d");
    boxes.current = {};
    renderStrip(ctx, interactive ? strip : { ...strip, selectedId: null }, boxes.current);
  }, [strip, interactive, tick]);

  // screen coords -> strip coords (canvas is scaled down by CSS)
  const toStrip = (e) => {
    const r = ref.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
  };

  const down = (e) => {
    if (!interactive) return;
    const p = toStrip(e);
    // topmost item first
    for (let i = strip.items.length - 1; i >= 0; i--) {
      const it = strip.items[i];
      const b = boxes.current[it.id];
      if (b && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
        drag.current = { id: it.id, dx: p.x - it.x, dy: p.y - it.y };
        onSelect(it.id);
        ref.current.setPointerCapture(e.pointerId);
        e.preventDefault();
        return;
      }
    }
    onSelect(null);
  };

  const move = (e) => {
    if (!drag.current) return;
    const p = toStrip(e);
    onMove(drag.current.id, clamp(p.x - drag.current.dx, 0, W), clamp(p.y - drag.current.dy, 0, H));
  };

  const up = () => { drag.current = null; };

  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      className={interactive ? "live" : ""}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      style={{ cursor: interactive ? "grab" : "default" }}
      aria-label="Photo strip preview"
    />
  );
}
