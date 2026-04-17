import { useCallback, useEffect, useRef, useState } from 'react';
import { Heart, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { FLOWER_DEFS, BOUQUET_SLOTS, EMOJI_MAP } from '../utils/flowers.js';
import { launchConfetti, spawnHearts } from '../utils/confetti.js';

/* Bouquet paper SVG markup (static) */
const BouquetPaper = () => (
  <svg className="bouquet-paper-svg" viewBox="0 0 180 220" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="90" cy="215" rx="42" ry="7" fill="rgba(0,0,0,0.12)" />
    <path d="M30,80 L90,215 L150,80 Q120,60 90,65 Q60,60 30,80 Z" fill="#c8874a" />
    <path d="M30,80 Q50,70 75,72 L90,215 Z" fill="#d9965a" opacity="0.6" />
    <path d="M105,72 Q135,68 150,80 L90,215 Z" fill="#b07038" opacity="0.5" />
    <path d="M65,148 Q90,138 115,148" stroke="#e8c97e" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M65,148 Q52,135 58,125 Q68,128 65,148 Z" fill="#e8c97e" />
    <path d="M115,148 Q128,135 122,125 Q112,128 115,148 Z" fill="#d4b56a" />
    <circle cx="90" cy="147" r="5" fill="#f0d080" />
    <path d="M30,80 Q40,75 50,78 Q60,72 70,76 Q80,70 90,73 Q100,68 110,72 Q120,68 130,73 Q140,70 150,80" stroke="#c8874a" strokeWidth="2" fill="none" />
  </svg>
);

export default function FlowerSection() {
  const { bouquet, counts, addFlower, resetBouquet } = useApp();
  const [isSent,   setIsSent]   = useState(false);
  const [sentEmojis, setSentEmojis] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const bouquetVisualRef = useRef(null);
  const draggingFlowerRef = useRef(null);
  const dragGhostRef      = useRef(null);
  const touchFlowerRef    = useRef(null);
  const touchGhostRef     = useRef(null);

  /* ── Create floating drag ghost ── */
  const createGhost = useCallback((flowerDef) => {
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.innerHTML = `<svg width="60" height="74" viewBox="0 0 54 74" xmlns="http://www.w3.org/2000/svg" overflow="visible">${flowerDef.svgFn()}</svg>`;
    const portal = document.getElementById('drag-portal');
    if (portal) portal.appendChild(ghost);
    return ghost;
  }, []);

  /* ── Desktop drag ── */
  const handleDragStart = useCallback((e, flowerDef) => {
    draggingFlowerRef.current = flowerDef;
    const blank = document.createElement('canvas');
    blank.width = 1; blank.height = 1;
    e.dataTransfer.setDragImage(blank, 0, 0);
    e.dataTransfer.effectAllowed = 'copy';
    dragGhostRef.current = createGhost(flowerDef);
  }, [createGhost]);

  const handleDragEnd = useCallback(() => {
    dragGhostRef.current?.remove();
    dragGhostRef.current = null;
    draggingFlowerRef.current = null;
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    if (!draggingFlowerRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (draggingFlowerRef.current && bouquet.length < BOUQUET_SLOTS.length) {
      addFlower(draggingFlowerRef.current);
    }
  }, [addFlower, bouquet.length]);

  /* ── Touch drag ── */
  const handleTouchStart = useCallback((e, flowerDef) => {
    e.preventDefault();
    touchFlowerRef.current = flowerDef;
    touchGhostRef.current = createGhost(flowerDef);
    const t = e.touches[0];
    touchGhostRef.current.style.left = t.clientX + 'px';
    touchGhostRef.current.style.top  = t.clientY + 'px';
  }, [createGhost]);

  /* ── Global drag ghost follow mouse ── */
  useEffect(() => {
    const onDragMove = (e) => {
      if (dragGhostRef.current) {
        dragGhostRef.current.style.left = e.clientX + 'px';
        dragGhostRef.current.style.top  = e.clientY + 'px';
      }
    };
    document.addEventListener('dragover', onDragMove);
    return () => document.removeEventListener('dragover', onDragMove);
  }, []);

  /* ── Global touch move/end ── */
  useEffect(() => {
    const onTouchMove = (e) => {
      if (!touchGhostRef.current) return;
      e.preventDefault();
      const t = e.touches[0];
      touchGhostRef.current.style.left = t.clientX + 'px';
      touchGhostRef.current.style.top  = t.clientY + 'px';
      const visual = bouquetVisualRef.current;
      if (visual) {
        const r = visual.getBoundingClientRect();
        setIsDragOver(t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom);
      }
    };

    const onTouchEnd = (e) => {
      const t = e.changedTouches[0];
      const visual = bouquetVisualRef.current;
      if (visual && touchFlowerRef.current && bouquet.length < BOUQUET_SLOTS.length) {
        const r = visual.getBoundingClientRect();
        if (t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom) {
          addFlower(touchFlowerRef.current);
        }
      }
      touchGhostRef.current?.remove();
      touchGhostRef.current = null;
      touchFlowerRef.current = null;
      setIsDragOver(false);
    };

    document.addEventListener('touchmove',   onTouchMove,  { passive: false });
    document.addEventListener('touchend',    onTouchEnd);
    document.addEventListener('touchcancel', onTouchEnd);
    return () => {
      document.removeEventListener('touchmove',   onTouchMove);
      document.removeEventListener('touchend',    onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [addFlower, bouquet.length]);

  /* ── Bounce bouquet visual when flower added ── */
  useEffect(() => {
    if (bouquet.length === 0) return;
    const vis = bouquetVisualRef.current;
    if (!vis) return;
    vis.style.transform = 'scale(1.06)';
    const tid = setTimeout(() => { vis.style.transform = ''; }, 250);
    return () => clearTimeout(tid);
  }, [bouquet.length]);

  /* ── Send bouquet ── */
  const handleSend = () => {
    if (bouquet.length === 0) return;
    const emojis = bouquet.slice(0, 8).map(b => EMOJI_MAP[b.flowerDef.id] || '🌸').join(' ');
    setSentEmojis(emojis);
    setIsSent(true);
    launchConfetti();
    spawnHearts(bouquetVisualRef.current);
  };

  const handleReset = () => {
    resetBouquet();
    setIsSent(false);
    setSentEmojis('');
    setIsDragOver(false);
  };

  return (
    <section className="section-pink" id="tang-hoa">
      <div className="container">
        <div className="sec-head" data-aos="fade-up">
          <h2 className="sec-title dark">Tặng Hoa Chúc Mừng 💐</h2>
          <div className="sec-bar pink"></div>
          <p className="flower-subtitle-dark">Kéo thả những bông hoa vào bó để tặng cho mình nhé!</p>
          <p className="flower-hint-mobile">📱 Nhấn giữ rồi kéo thả hoa vào bó</p>
        </div>

        <div className="flower-studio-new" data-aos="fade-up" data-aos-delay="100">

          {/* ── LEFT: Bouquet drop zone ── */}
          <div className="bouquet-zone" id="bouquet-zone">
            <p className="zone-label">Bó Hoa Của Bạn</p>

            <div
              ref={bouquetVisualRef}
              className={`bouquet-visual ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <BouquetPaper />

              {/* Stems SVG */}
              <svg
                className="bouquet-stems-svg"
                viewBox="0 0 180 220"
                xmlns="http://www.w3.org/2000/svg"
              >
                {bouquet.map((item, idx) => {
                  if (!item.flowerDef.stemColor) return null;
                  const slot = BOUQUET_SLOTS[idx];
                  return (
                    <line
                      key={idx}
                      x1={20 + slot[0] * 1.4} y1={180}
                      x2={30 + slot[0] * 1.4} y2={slot[1] * 2.2 + 54}
                      stroke={item.flowerDef.stemColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {/* Flower heads */}
              <div className="bouquet-heads">
                {bouquet.map((item, idx) => (
                  <div
                    key={idx}
                    className="b-flower-head"
                    style={{
                      left: BOUQUET_SLOTS[idx][0] + '%',
                      top:  BOUQUET_SLOTS[idx][1] + '%',
                      transform: `rotate(${item.rotation}deg)`
                    }}
                  >
                    <svg
                      width="46" height="54"
                      viewBox="0 0 54 74"
                      xmlns="http://www.w3.org/2000/svg"
                      overflow="visible"
                      dangerouslySetInnerHTML={{ __html: item.flowerDef.svgFn() }}
                    />
                  </div>
                ))}
              </div>

              {/* Drop hint overlay */}
              <div className={`drop-overlay ${isDragOver ? 'active' : ''}`}>
                <div className="drop-overlay-inner">
                  <span className="drop-icon">💐</span>
                  <span className="drop-text">Thả hoa vào đây</span>
                </div>
              </div>

              {/* Empty hint */}
              {bouquet.length === 0 && (
                <div className="bouquet-empty-hint2">
                  <span>Kéo hoa từ kệ</span>
                  <span className="hint-arrow">→</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="bouquet-footer">
              {!isSent && bouquet.length > 0 && (
                <div className="bouquet-controls2">
                  <p className="count-label">
                    <span>{bouquet.length}</span> bông hoa 🌸
                  </p>
                  <div className="bouquet-btns2">
                    <button className="send-btn2" onClick={handleSend}>
                      <Heart size={14} fill="currentColor" /> Gửi Tặng
                    </button>
                    <button className="reset-btn2" onClick={handleReset} title="Làm lại">
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              )}
              {isSent && (
                <div className="flower-sent2">
                  <div className="sent-emoji-row">{sentEmojis}</div>
                  <p className="sent-title2">Cảm ơn bạn! 🎉</p>
                  <p className="sent-msg2">Bó hoa xinh xắn đã được gửi đến mình rồi ✨</p>
                  <button className="again-btn" onClick={handleReset}>Tặng thêm 🌸</button>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Flower shelf ── */}
          <div className="shelf-zone">
            <p className="zone-label">Kệ Hoa</p>
            <div className="shelf-new" id="shelf-new">
              {[0, 1, 2].map(row => (
                <div className="shelf-row" key={row} id={`shelf-row-${row}`}>
                  <div className="shelf-board"></div>
                  <div className="shelf-row-flowers" id={`shelf-row-flowers-${row}`}>
                    {FLOWER_DEFS.filter(f => f.row === row).map(f => (
                      <div
                        key={f.id}
                        className="shelf-flower-card"
                        draggable
                        onDragStart={e => handleDragStart(e, f)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={e => handleTouchStart(e, f)}
                        title={f.name}
                      >
                        <div className="shelf-svg-wrap">
                          <svg
                            viewBox="0 0 54 74"
                            xmlns="http://www.w3.org/2000/svg"
                            overflow="visible"
                            dangerouslySetInnerHTML={{ __html: f.svgFn() }}
                          />
                        </div>
                        <div className="shelf-badge" id={`sbadge-${f.id}`}>
                          {counts[f.id] ? `×${counts[f.id]}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="shelf-board shelf-board-bottom"></div>
                </div>
              ))}
              <div className="shelf-frame-left"></div>
              <div className="shelf-frame-right"></div>
              <div className="shelf-frame-bottom"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Ghost portal */}
      <div
        id="drag-portal"
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5000 }}
      ></div>
    </section>
  );
}
