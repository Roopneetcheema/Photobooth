import { useEffect, useState } from "react";
import { W, FONTS, STICKERS, COLORS } from "../lib/strip.js";
import StripCanvas from "./StripCanvas.jsx";

let uid = 1;

// Phase 3: stickers, text and caption. Items are dragged directly on the strip.
export default function DecoratePhase({ strip, tick, setItems, caption, setCaption, selectedId, setSelectedId, onBack, onFinish }) {
  const [textDraft, setTextDraft] = useState("");
  const [textFont, setTextFont] = useState("retro");
  const [textColor, setTextColor] = useState("#ffffff");

  const selected = strip.items.find((i) => i.id === selectedId);

  const addItem = (it) => {
    const id = uid++;
    setItems((prev) => [...prev, { id, x: W / 2 + (Math.random() * 160 - 80), y: 300 + Math.random() * 800, ...it }]);
    setSelectedId(id);
  };
  const updateSel = (patch) => setItems((prev) => prev.map((i) => (i.id === selectedId ? { ...i, ...patch } : i)));
  const removeSel = () => {
    setItems((prev) => prev.filter((i) => i.id !== selectedId));
    setSelectedId(null);
  };

  // Delete / Backspace removes the selected item (unless typing in a field)
  useEffect(() => {
    const k = (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && e.target.tagName !== "INPUT") {
        e.preventDefault();
        removeSel();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const submitText = (e) => {
    e.preventDefault();
    if (!textDraft.trim()) return;
    addItem({ type: "text", content: textDraft.trim(), size: 56, font: textFont, color: textColor });
    setTextDraft("");
  };

  return (
    <div className="stage">
      <div className="preview">
        <StripCanvas
          strip={strip}
          interactive
          tick={tick}
          onSelect={setSelectedId}
          onMove={(id, x, y) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, x, y } : i)))}
        />
      </div>

      <aside className="panel">
        <p className="hint">Add stickers or text, then drag them around on the strip.</p>

        <div>
          <h2>Stickers</h2>
          <div className="stickers">
            {STICKERS.map((s) => (
              <button key={s} className="stk" onClick={() => addItem({ type: "sticker", content: s, size: 90 })} aria-label={`Add ${s}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ margin: 0 }}>Text</h2>
          <form style={{ display: "flex", gap: 8 }} onSubmit={submitText}>
            <input id="text-draft" type="text" placeholder="besties forever" value={textDraft} onChange={(e) => setTextDraft(e.target.value)} maxLength={40} />
            <button className="btn primary" type="submit" disabled={!textDraft.trim()}>Add</button>
          </form>
          <div className="chips">
            {Object.entries(FONTS).map(([k, f]) => (
              <button
                key={k}
                className={"chip" + (textFont === k ? " on" : "")}
                onClick={() => { setTextFont(k); if (selected?.type === "text") updateSel({ font: k }); }}
              >
                {f.name}
              </button>
            ))}
          </div>
          <div className="colors">
            {COLORS.map((c) => (
              <button
                key={c}
                className={"dot" + (textColor === c ? " on" : "")}
                style={{ background: c }}
                aria-label={`Color ${c}`}
                onClick={() => { setTextColor(c); if (selected?.type === "text") updateSel({ color: c }); }}
              />
            ))}
          </div>
        </div>

        <div>
          <h2>Caption</h2>
          <input id="caption" type="text" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={22} />
        </div>

        {selected && (
          <div className="sel">
            <h2 style={{ margin: 0 }}>Selected {selected.type}</h2>
            {selected.type === "text" && (
              <input id="sel-text" type="text" value={selected.content} onChange={(e) => updateSel({ content: e.target.value })} />
            )}
            <label className="hint" htmlFor="sel-size">Size</label>
            <input
              id="sel-size"
              type="range"
              min={selected.type === "text" ? 24 : 40}
              max={selected.type === "text" ? 140 : 260}
              value={selected.size}
              onChange={(e) => updateSel({ size: +e.target.value })}
            />
            <button className="btn" onClick={removeSel}>Remove</button>
          </div>
        )}

        <div className="row">
          <button className="btn" onClick={onBack}>← Backdrop</button>
          <button className="btn primary" style={{ flex: 1 }} onClick={onFinish}>Finish strip →</button>
        </div>
      </aside>
    </div>
  );
}
