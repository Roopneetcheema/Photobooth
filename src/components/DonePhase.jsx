// Phase 4: show the finished PNG, download it, or start over.
export default function DonePhase({ url, fileName, onBack, onRestart }) {
  const download = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="stage">
      <div className="preview">
        <img src={url} alt="Your finished photo strip" />
      </div>
      <aside className="panel">
        <p className="done-msg">Looking good.</p>
        <p className="hint">Your strip is 600 × 1500 px. Download it, then start a fresh session for the next person.</p>
        <button className="btn primary" onClick={download}>Download PNG</button>
        <button className="btn" onClick={onBack}>← Keep decorating</button>
        <button className="btn" onClick={onRestart}>Start over</button>
      </aside>
    </div>
  );
}
