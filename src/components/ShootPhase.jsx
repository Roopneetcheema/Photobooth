import { useCallback, useEffect, useRef, useState } from "react";
import { PW, PH, sleep, loadImg } from "../lib/strip.js";

// Phase 1: webcam, countdown, 3 slots with retakes.
export default function ShootPhase({ photos, setPhotos, onNext }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const alive = useRef(true);
  const [err, setErr] = useState(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const [retake, setRetake] = useState(null);
  const [delay, setDelay] = useState(3);

  // open the camera on mount, stop it on unmount
  useEffect(() => {
    alive.current = true;
    if (!navigator.mediaDevices?.getUserMedia) {
      setErr("This browser can't open a camera here. Try Chrome, Edge or Firefox on localhost or https.");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: "user" }, audio: false })
      .then((s) => {
        if (!alive.current) { s.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = s;
        videoRef.current.srcObject = s;
        videoRef.current.play().finally(() => setReady(true));
      })
      .catch((e) =>
        setErr(
          e.name === "NotAllowedError"
            ? "Camera access was blocked. Allow the camera in your browser's address bar, then reload the page."
            : "No camera was found, or another app is using it. Close other video apps and reload."
        )
      );
    return () => {
      alive.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const firstEmpty = photos.findIndex((p) => !p);
  const target = retake !== null ? retake : firstEmpty;
  const allDone = firstEmpty === -1;

  const capture = useCallback(async () => {
    if (busy || !ready || target === -1) return;
    setBusy(true);
    for (let n = delay; n > 0; n--) {
      if (!alive.current) return;
      setCount(n);
      await sleep(1000);
    }
    if (!alive.current) return;
    setCount(0);

    // crop the video to 4:3 from the centre, mirror it like a selfie
    const v = videoRef.current;
    const vw = v.videoWidth, vh = v.videoHeight;
    let sw = vw, sh = (vw * 3) / 4;
    if (sh > vh) { sh = vh; sw = (vh * 4) / 3; }
    const c = document.createElement("canvas");
    c.width = PW * 2; c.height = PH * 2;
    const ctx = c.getContext("2d");
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, c.width, c.height);
    const src = c.toDataURL("image/jpeg", 0.92);

    setFlash(true);
    requestAnimationFrame(() => setTimeout(() => setFlash(false), 60));

    const img = await loadImg(src);
    setPhotos((prev) => { const next = [...prev]; next[target] = { src, img }; return next; });
    setRetake(null);
    setBusy(false);
  }, [busy, ready, target, delay, setPhotos]);

  // Space bar = shutter
  useEffect(() => {
    const k = (e) => {
      if (e.code === "Space" && e.target.tagName !== "BUTTON") { e.preventDefault(); capture(); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [capture]);

  const label = busy
    ? "Hold that pose…"
    : allDone && retake === null
      ? "All three taken. Tap a photo to retake it."
      : `Next up: photo ${target + 1} of 3${retake !== null ? " (retake)" : ""}`;

  return (
    <div className="stage">
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        <div className="cam">
          <video ref={videoRef} playsInline muted />
          {count > 0 && <div className="count" aria-live="assertive">{count}</div>}
          <div className={"flash" + (flash ? " on" : "")} />
          {err && <div className="camerr"><div><strong>Camera unavailable</strong>{err}</div></div>}
          {!err && !ready && <div className="camerr"><div>Waiting for camera permission…</div></div>}
        </div>
        <div className="shoot">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p className="hint" aria-live="polite" style={{ color: "var(--paper)" }}>{label}</p>
            <div className="chips" role="group" aria-label="Countdown">
              {[0, 3, 5].map((d) => (
                <button key={d} className={"chip" + (delay === d ? " on" : "")} onClick={() => setDelay(d)}>
                  {d === 0 ? "No timer" : `${d}s timer`}
                </button>
              ))}
            </div>
          </div>
          <button
            className="shutter"
            onClick={capture}
            disabled={busy || !ready || target === -1}
            aria-label="Take photo (Space)"
            title="Take photo (Space)"
          />
        </div>
      </div>

      <aside className="panel">
        <div>
          <h2>Your three shots</h2>
          <p className="hint">Tap any photo to retake it. Retake as often as you like.</p>
        </div>
        <div className="slots">
          {photos.map((p, i) => (
            <button
              key={i}
              className={"slot" + (target === i ? " target" : "")}
              onClick={() => p && !busy && setRetake(retake === i ? null : i)}
              aria-label={p ? `Retake photo ${i + 1}` : `Photo ${i + 1}, empty`}
            >
              {p ? <img src={p.src} alt={`Photo ${i + 1}`} /> : <span className="n">{i + 1}</span>}
              {p && retake === i && <span className="tag">Retaking</span>}
            </button>
          ))}
        </div>
        <button className="btn primary" disabled={!allDone || busy} onClick={onNext}>
          Choose a backdrop →
        </button>
      </aside>
    </div>
  );
}
