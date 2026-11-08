import { useEffect, useRef } from "react";
import { W, BACKDROPS, FILTERS } from "../lib/strip.js";
import StripCanvas from "./StripCanvas.jsx";

function Swatch({ bd }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current.getContext("2d");
    c.save();
    c.scale(80 / W, 80 / W); // top 600×900 of the strip, scaled into 80×120
    bd.draw(c);
    c.restore();
  }, [bd]);
  return <canvas ref={ref} width={80} height={120} />;
}

// Phase 2: pick a backdrop and a photo filter.
export default function BackdropPhase({ strip, tick, bgId, setBgId, filterId, setFilterId, onBack, onNext }) {
  return (
    <div className="stage">
      <div className="preview">
        <StripCanvas strip={strip} interactive={false} tick={tick} />
      </div>
      <aside className="panel">
        <div>
          <h2>Backdrop</h2>
          <div className="swatches">
            {BACKDROPS.map((b) => (
              <button key={b.id} className={"sw" + (bgId === b.id ? " on" : "")} onClick={() => setBgId(b.id)} aria-pressed={bgId === b.id}>
                <Swatch bd={b} />
                {b.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h2>Photo filter</h2>
          <div className="chips">
            {FILTERS.map((f) => (
              <button key={f.id} className={"chip" + (filterId === f.id ? " on" : "")} onClick={() => setFilterId(f.id)}>
                {f.name}
              </button>
            ))}
          </div>
        </div>
        <div className="row">
          <button className="btn" onClick={onBack}>← Reshoot</button>
          <button className="btn primary" style={{ flex: 1 }} onClick={onNext}>Decorate →</button>
        </div>
      </aside>
    </div>
  );
}
