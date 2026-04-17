import { useCallback, useEffect, useRef, useState } from 'react';
import { Heart, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { BOUQUET_ITEM_DEFS, SHELF_GROUPS, EMOJI_MAP } from '../utils/flowers.js';
import { launchConfetti, spawnHearts } from '../utils/confetti.js';

const MAX_BOUQUET_ITEMS = 26;

const BouquetPaper = () => (
  <svg className="bouquet-paper-svg" viewBox="0 0 180 220" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="90" cy="212" rx="44" ry="8" fill="rgba(0,0,0,0.14)" />
    <g transform="rotate(-7 90 142)">
      <path d="M28,82 L90,214 L152,82 Q120,60 90,66 Q60,60 28,82 Z" fill="#c8854b" />
      <path d="M28,82 Q50,72 75,74 L90,214 Z" fill="#dd9f6b" opacity="0.65" />
      <path d="M105,74 Q134,70 152,82 L90,214 Z" fill="#ad6b35" opacity="0.48" />
      <path d="M64,147 Q91,136 116,147" stroke="#efcc84" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M64,147 Q52,136 58,125 Q68,128 64,147 Z" fill="#efcc84" />
      <path d="M116,147 Q128,136 122,125 Q112,128 116,147 Z" fill="#d8b871" />
      <circle cx="90" cy="147" r="5" fill="#f1d487" />
    </g>
  </svg>
);

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function FlowerSection() {
  const { bouquet, counts, addBouquetItem, resetBouquet } = useApp();
  const [isSent, setIsSent] = useState(false);
  const [sentEmojis, setSentEmojis] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const bouquetVisualRef = useRef(null);
  const draggingItemRef = useRef(null);
  const dragGhostRef = useRef(null);
  const touchItemRef = useRef(null);
  const touchGhostRef = useRef(null);

  const createGhost = useCallback((itemDef) => {
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.innerHTML = `<svg width="58" height="68" viewBox="0 0 54 74" xmlns="http://www.w3.org/2000/svg" overflow="visible">${itemDef.svgFn()}</svg>`;
    const portal = document.getElementById('drag-portal');
    if (portal) portal.appendChild(ghost);
    return ghost;
  }, []);

  const getDropPos = useCallback((clientX, clientY) => {
    const visual = bouquetVisualRef.current;
    if (!visual) return { x: 50, y: 40, inside: false };
    const r = visual.getBoundingClientRect();
    const relX = ((clientX - r.left) / r.width) * 100;
    const relY = ((clientY - r.top) / r.height) * 100;
    const inside = relX >= 0 && relX <= 100 && relY >= 0 && relY <= 100;
    return {
      x: clamp(Number(relX.toFixed(1)), 10, 90),
      y: clamp(Number(relY.toFixed(1)), 8, 86),
      inside
    };
  }, []);

  const handleDragStart = useCallback((e, itemDef) => {
    draggingItemRef.current = itemDef;
    const blank = document.createElement('canvas');
    blank.width = 1;
    blank.height = 1;
    e.dataTransfer.setDragImage(blank, 0, 0);
    e.dataTransfer.effectAllowed = 'copy';
    dragGhostRef.current = createGhost(itemDef);
  }, [createGhost]);

  const handleDragEnd = useCallback(() => {
    dragGhostRef.current?.remove();
    dragGhostRef.current = null;
    draggingItemRef.current = null;
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    if (!draggingItemRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const itemDef = draggingItemRef.current;
    setIsDragOver(false);
    if (!itemDef || bouquet.length >= MAX_BOUQUET_ITEMS) return;
    const pos = getDropPos(e.clientX, e.clientY);
    if (pos.inside) addBouquetItem(itemDef, pos);
  }, [addBouquetItem, bouquet.length, getDropPos]);

  const handleTouchStart = useCallback((e, itemDef) => {
    e.preventDefault();
    touchItemRef.current = itemDef;
    touchGhostRef.current = createGhost(itemDef);
    const t = e.touches[0];
    touchGhostRef.current.style.left = `${t.clientX}px`;
    touchGhostRef.current.style.top = `${t.clientY}px`;
  }, [createGhost]);

  useEffect(() => {
    const onDragMove = (e) => {
      if (!dragGhostRef.current) return;
      dragGhostRef.current.style.left = `${e.clientX}px`;
      dragGhostRef.current.style.top = `${e.clientY}px`;
    };
    document.addEventListener('dragover', onDragMove);
    return () => document.removeEventListener('dragover', onDragMove);
  }, []);

  useEffect(() => {
    const onTouchMove = (e) => {
      if (!touchGhostRef.current) return;
      e.preventDefault();
      const t = e.touches[0];
      touchGhostRef.current.style.left = `${t.clientX}px`;
      touchGhostRef.current.style.top = `${t.clientY}px`;
      setIsDragOver(getDropPos(t.clientX, t.clientY).inside);
    };

    const onTouchEnd = (e) => {
      const t = e.changedTouches[0];
      const itemDef = touchItemRef.current;
      if (itemDef && bouquet.length < MAX_BOUQUET_ITEMS) {
        const pos = getDropPos(t.clientX, t.clientY);
        if (pos.inside) addBouquetItem(itemDef, pos);
      }
      touchGhostRef.current?.remove();
      touchGhostRef.current = null;
      touchItemRef.current = null;
      setIsDragOver(false);
    };

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchEnd);
    return () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [addBouquetItem, bouquet.length, getDropPos]);

  useEffect(() => {
    if (bouquet.length === 0) return;
    const vis = bouquetVisualRef.current;
    if (!vis) return;
    vis.style.transform = 'rotate(-4deg) scale(1.04)';
    const tid = setTimeout(() => { vis.style.transform = ''; }, 220);
    return () => clearTimeout(tid);
  }, [bouquet.length]);

  const handleSend = () => {
    if (bouquet.length === 0) return;
    const emojis = bouquet.slice(0, 10).map((b) => EMOJI_MAP[b.itemDef.id] || '🌸').join(' ');
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
          <p className="flower-subtitle-dark">Kéo Hoa, Lá và Nơ thả vào bó. Thả ở đâu thì món phụ kiện nằm đúng chỗ đó.</p>
          <p className="flower-hint-mobile">📱 Nhấn giữ item rồi kéo vào bó</p>
        </div>

        <div className="flower-studio-new" data-aos="fade-up" data-aos-delay="100">
          <div className="bouquet-zone" id="bouquet-zone">
            <p className="zone-label">Bó Hoa Của Bạn</p>

            <div
              ref={bouquetVisualRef}
              className={`bouquet-visual bouquet-tilt ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <BouquetPaper />

              <div className="bouquet-heads">
                {bouquet.map((item, idx) => (
                  <div
                    key={`${item.itemDef.id}-${idx}`}
                    className="b-flower-head"
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      zIndex: Math.round(item.y),
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale || 1})`
                    }}
                  >
                    <svg
                      width="52"
                      height="64"
                      viewBox="0 0 54 74"
                      xmlns="http://www.w3.org/2000/svg"
                      overflow="visible"
                      dangerouslySetInnerHTML={{ __html: item.itemDef.svgFn() }}
                    />
                  </div>
                ))}
              </div>

              <div className={`drop-overlay ${isDragOver ? 'active' : ''}`}>
                <div className="drop-overlay-inner">
                  <span className="drop-icon">💐</span>
                  <span className="drop-text">Thả vào đây</span>
                </div>
              </div>

              {bouquet.length === 0 && (
                <div className="bouquet-empty-hint2">
                  <span>Kéo từ kệ bên phải</span>
                  <span className="hint-arrow">→</span>
                </div>
              )}
            </div>

            <div className="bouquet-footer">
              {!isSent && bouquet.length > 0 && (
                <div className="bouquet-controls2">
                  <p className="count-label">
                    <span>{bouquet.length}</span> item trong bó
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
                  <p className="sent-msg2">Bó hoa đã gửi thành công rồi ✨</p>
                  <button className="again-btn" onClick={handleReset}>Tặng thêm 🌸</button>
                </div>
              )}
            </div>
          </div>

          <div className="shelf-zone">
            <p className="zone-label">Kệ Phụ Kiện</p>
            <div className="shelf-new" id="shelf-new">
              {SHELF_GROUPS.map((group) => (
                <div className="shelf-row" key={group.id}>
                  <div className="shelf-group-title">{group.label}</div>
                  <div className="shelf-board"></div>
                  <div className="shelf-row-flowers">
                    {BOUQUET_ITEM_DEFS.filter((f) => f.group === group.id).map((f) => (
                      <div
                        key={f.id}
                        className="shelf-flower-card"
                        draggable
                        onDragStart={(e) => handleDragStart(e, f)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => handleTouchStart(e, f)}
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
                        <div className="shelf-badge">{counts[f.id] ? `×${counts[f.id]}` : ''}</div>
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

      <div id="drag-portal" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5000 }}></div>
    </section>
  );
}
