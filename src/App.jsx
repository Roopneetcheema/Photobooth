import { useEffect, useMemo, useState } from "react";
import { CANVAS_FONTS, exportStrip, today } from "./lib/strip.js";
import ShootPhase from "./components/ShootPhase.jsx";
import BackdropPhase from "./components/BackdropPhase.jsx";
import DecoratePhase from "./components/DecoratePhase.jsx";
import DonePhase from "./components/DonePhase.jsx";

const PHASES = ["Shoot", "Backdrop", "Decorate", "Download"];

export default function App() {
  const [phase, setPhase] = useState(0);
  const [photos, setPhotos] = useState([null, null, null]);
  const [bgId, setBgId] = useState("cream");
  const [filterId, setFilterId] = useState("none");
  const [items, setItems] = useState([]);
  const [caption, setCaption] = useState("photobooth");
  const [selectedId, setSelectedId] = useState(null);
  const [result, setResult] = useState(null);
  const [tick, setTick] = useState(0); // bumps once fonts are loaded, to redraw canvases
  const dateStr = useMemo(today, []);

  useEffect(() => {
    Promise.all(CANVAS_FONTS.map((f) => document.fonts.load(f))).finally(() => setTick((t) => t + 1));
  }, []);

  const strip = useMemo(
    () => ({ photos, bgId, filterId, items, caption, selectedId, dateStr }),
    [photos, bgId, filterId, items, caption, selectedId, dateStr]
  );

  const finish = async () => {
    setSelectedId(null);
    if (result) URL.revokeObjectURL(result);
    setResult(await exportStrip(strip));
    setPhase(3);
  };

  const restart = () => {
    if (result) URL.revokeObjectURL(result);
    setResult(null);
    setPhotos([null, null, null]);
    setItems([]);
    setSelectedId(null);
    setBgId("cream");
    setFilterId("none");
    setCaption("photobooth");
    setPhase(0);
  };

  return (
    <div className="wrap">
      <header>
        <h1>Strip Booth</h1>
        <ol className="steps">
          {PHASES.map((p, i) => (
            <li key={p} className={i === phase ? "on" : i < phase ? "done" : ""}>
              {i + 1}. {p}
            </li>
          ))}
        </ol>
      </header>

      {phase === 0 && <ShootPhase photos={photos} setPhotos={setPhotos} onNext={() => setPhase(1)} />}

      {phase === 1 && (
        <BackdropPhase
          strip={strip}
          tick={tick}
          bgId={bgId}
          setBgId={setBgId}
          filterId={filterId}
          setFilterId={setFilterId}
          onBack={() => setPhase(0)}
          onNext={() => setPhase(2)}
        />
      )}

      {phase === 2 && (
        <DecoratePhase
          strip={strip}
          tick={tick}
          setItems={setItems}
          caption={caption}
          setCaption={setCaption}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onBack={() => { setSelectedId(null); setPhase(1); }}
          onFinish={finish}
        />
      )}

      {phase === 3 && result && (
        <DonePhase
          url={result}
          fileName={`photobooth-${dateStr.replace(/ · /g, "-")}.png`}
          onBack={() => setPhase(2)}
          onRestart={restart}
        />
      )}
    </div>
  );
}
