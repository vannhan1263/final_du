import { useCallback, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import {
  Upload, Undo2, Trash2, RotateCcw, RotateCw,
  FlipHorizontal2, FlipVertical2, Image as ImageIcon,
  RefreshCw, Plus, Send, Download, Loader2,
  Wand2, Smile, Type, Frame, Paintbrush, StopCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext.jsx';
import { sendGiftApi } from '../utils/api.js';
import { launchConfetti, spawnHeartsWindow } from '../utils/confetti.js';

/* ── Sticker & Frame catalogues ── */
const STICKERS = [
  '🌸','🌺','🌼','🌻','🌹','🌷','💐','🪷','🍀',
  '⭐','🌟','✨','💫','🎊','🎉','🎀','🎗️','🏆',
  '🎓','📸','💛','❤️','💕','💖','💗','🥰','😊',
  '🦋','🌈','☁️','🌙','🍓','🧁','🫧','🫶','👑'
];

const FRAMES = [
  { id: 'none',    label: 'Không',     cls: '',          thumb: 'transparent' },
  { id: 'flowers', label: 'Hoa nhẹ',  cls: 'f-flowers', thumb: 'linear-gradient(135deg,#ffb3c6,#ffd6e0)' },
  { id: 'gold',    label: 'Vàng sang', cls: 'f-gold',    thumb: 'linear-gradient(135deg,#ffd700,#ffe97a)' },
  { id: 'dreamy',  label: 'Mộng mơ',  cls: 'f-dreamy',  thumb: 'linear-gradient(135deg,#c77dff,#e0aaff)' },
  { id: 'white',   label: 'Trắng tinh',cls: 'f-white',   thumb: 'linear-gradient(135deg,#f8f8f8,#e0e0e0)' },
  { id: 'dots',    label: 'Chấm bi',   cls: 'f-dots',    thumb: 'radial-gradient(circle,#ff6b9d 1.5px,transparent 1.5px) 0 0/10px 10px #fdf5f8' }
];

const FILTER_PRESETS = [
  { id: 'normal',    label: 'Gốc',      icon: '🖼️' },
  { id: 'vivid',     label: 'Sống động',icon: '🌈' },
  { id: 'warm',      label: 'Ấm áp',    icon: '🌅' },
  { id: 'cool',      label: 'Mát lạnh', icon: '❄️' },
  { id: 'sepia',     label: 'Hoài cổ',  icon: '🕰️' },
  { id: 'grayscale', label: 'Đen trắng',icon: '⚪' },
  { id: 'dramatic',  label: 'Kịch tính',icon: '🎭' },
  { id: 'vintage',   label: 'Vintage',  icon: '📷' },
];

const DRAW_COLORS = ['#e87ea1','#ffd700','#ff5722','#4caf50','#2196f3','#9c27b0','#ffffff','#1a1a1a'];
const TEXT_COLORS  = ['#ffffff','#1a1a2e','#ffd700','#e87ea1','#ff5722','#4caf50','#9c27b0'];
const TEXT_FONTS   = [
  { value: '"Cormorant Garamond", serif',     label: 'Cormorant'  },
  { value: '"Plus Jakarta Sans", sans-serif', label: 'Jakarta'    },
  { value: '"Pinyon Script", cursive',        label: 'Script'     },
  { value: '"Bebas Neue", sans-serif',        label: 'Bebas'      },
  { value: '"Great Vibes", cursive',          label: 'Great Vibes'},
];
const TABS = [
  { id: 'filter',  Icon: Wand2,      label: 'Lọc'     },
  { id: 'sticker', Icon: Smile,      label: 'Sticker' },
  { id: 'text',    Icon: Type,       label: 'Chữ'     },
  { id: 'frame',   Icon: Frame,      label: 'Khung'   },
  { id: 'draw',    Icon: Paintbrush, label: 'Vẽ'      },
];

/* ── Helpers ── */
const resizeTo1200 = (dataURL) =>
  new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1200;
      let w = img.width, h = img.height;
      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
      const tmp = document.createElement('canvas');
      tmp.width = w; tmp.height = h;
      tmp.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(tmp.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(dataURL);
    img.src = dataURL;
  });

const buildFilters = (state) => {
  const F = fabric.Image.filters;
  const list = [];
  switch (state.preset) {
    case 'sepia':     list.push(new F.Sepia()); break;
    case 'grayscale': list.push(new F.Grayscale()); break;
    case 'vintage':
      list.push(new F.Sepia(), new F.Brightness({ brightness: -0.1 }),
                new F.Contrast({ contrast: 0.1 }), new F.Noise({ noise: 25 })); break;
    case 'vivid':
      list.push(new F.Saturation({ saturation: 0.5 }), new F.Contrast({ contrast: 0.12 })); break;
    case 'cool':
      list.push(new F.ColorMatrix({ matrix: [1,0,0,0,0, 0,1,0.05,0,0.03, 0,0,1.25,0,0.05, 0,0,0,1,0] })); break;
    case 'warm':
      list.push(new F.ColorMatrix({ matrix: [1.15,0,0,0,0.05, 0,1.02,0,0,0, 0,0,0.85,0,-0.02, 0,0,0,1,0] })); break;
    case 'dramatic':
      list.push(new F.Contrast({ contrast: 0.35 }), new F.Brightness({ brightness: -0.07 }),
                new F.Saturation({ saturation: -0.25 })); break;
    default: break;
  }
  if (state.brightness !== 0) list.push(new F.Brightness({ brightness: state.brightness }));
  if (state.contrast   !== 0) list.push(new F.Contrast({ contrast: state.contrast }));
  if (state.saturation !== 0) list.push(new F.Saturation({ saturation: state.saturation }));
  if (state.blur > 0)         list.push(new F.Blur({ blur: state.blur / 20 }));
  return list;
};

/* ════════════════════════════════════ */
export default function PhotoEditor() {
  const { bouquet, recipient } = useApp();

  /* steps */
  const [step,         setStep]         = useState('upload');
  const [activeTab,    setActiveTab]     = useState('filter');

  /* photo */
  const [photoDataURL, setPhotoDataURL]  = useState(null);
  const [sending,      setSending]       = useState(false);
  const [successPhoto, setSuccessPhoto]  = useState(null);

  /* frame */
  const [activeFrame,  setActiveFrame]   = useState(FRAMES[0]);

  /* filters */
  const [filterState,  setFilterState]   = useState({
    preset: 'normal', brightness: 0, contrast: 0, saturation: 0, blur: 0
  });

  /* drawing */
  const [isDrawing,    setIsDrawing]     = useState(false);
  const [drawColor,    setDrawColor]     = useState('#e87ea1');
  const [drawSize,     setDrawSize]      = useState(6);

  /* text */
  const [textInput,    setTextInput]     = useState('');
  const [textColor,    setTextColor]     = useState('#ffffff');
  const [textSize,     setTextSize]      = useState(28);
  const [textFont,     setTextFont]      = useState(TEXT_FONTS[0].value);

  /* refs */
  const fabricRef    = useRef(null);  // fabric.Canvas instance
  const imgObjRef    = useRef(null);  // fabric.Image (locked background)
  const canvasElRef  = useRef(null);  // <canvas> DOM element
  const fileInputRef = useRef(null);

  /* ── Init Fabric when step becomes 'editor' ── */
  useEffect(() => {
    if (step !== 'editor' || !photoDataURL) return;
    let fc = null;
    const tid = setTimeout(() => {
      const el = canvasElRef.current;
      if (!el) return;
      const MAX_W = Math.min(560, window.innerWidth - 48);
      const MAX_H = 500;
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(MAX_W / img.naturalWidth, MAX_H / img.naturalHeight, 1);
        const w = Math.round(img.naturalWidth  * ratio);
        const h = Math.round(img.naturalHeight * ratio);
        fc = new fabric.Canvas(el, {
          width: w, height: h,
          preserveObjectStacking: true, selection: true, enableRetinaScaling: false,
        });
        fabricRef.current = fc;
        fabric.Image.fromURL(photoDataURL, (fabricImg) => {
          fabricImg.set({ selectable: false, evented: false, left: 0, top: 0, originX: 'left', originY: 'top' });
          fabricImg.scaleToWidth(w);
          imgObjRef.current = fabricImg;
          fc.add(fabricImg);
          fc.sendToBack(fabricImg);
          fc.renderAll();
        }, { crossOrigin: 'anonymous' });
      };
      img.src = photoDataURL;
    }, 60);
    return () => {
      clearTimeout(tid);
      if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; }
      imgObjRef.current = null;
    };
  }, [step, photoDataURL]);

  /* ── Sync filter state → Fabric image ── */
  useEffect(() => {
    const imgObj = imgObjRef.current;
    const fc     = fabricRef.current;
    if (!imgObj || !fc || step !== 'editor') return;
    imgObj.filters = buildFilters(filterState);
    imgObj.applyFilters();
    fc.renderAll();
  }, [filterState, step]);

  /* ── File upload ── */
  const loadFile = (file) => {
    if (!file?.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Ảnh quá lớn! Tối đa 10MB.'); return; }
    const reader = new FileReader();
    reader.onload = (e) => { setPhotoDataURL(e.target.result); setStep('editor'); };
    reader.readAsDataURL(file);
  };
  const onFileChange = (e) => { if (e.target.files[0]) loadFile(e.target.files[0]); e.target.value = ''; };
  const onDropZone   = (e) => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); };

  /* ── Undo (remove last non-image object) ── */
  const undo = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    const objs = fc.getObjects().filter(o => o !== imgObjRef.current);
    if (!objs.length) return;
    fc.remove(objs[objs.length - 1]);
    fc.discardActiveObject();
    fc.renderAll();
  };

  /* ── Delete selected ── */
  const deleteSelected = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    const active = fc.getActiveObject();
    if (!active || active === imgObjRef.current) return;
    if (active.type === 'activeSelection') {
      active.forEachObject(o => fc.remove(o));
      fc.discardActiveObject();
    } else { fc.remove(active); }
    fc.renderAll();
  };

  /* ── Rotate image ── */
  const rotateImage = (deg) => {
    const imgObj = imgObjRef.current;
    if (!imgObj || !fabricRef.current) return;
    imgObj.rotate(((imgObj.angle || 0) + deg + 360) % 360);
    imgObj.setCoords();
    fabricRef.current.renderAll();
  };

  /* ── Flip image ── */
  const flipImage = (axis) => {
    const imgObj = imgObjRef.current;
    if (!imgObj) return;
    if (axis === 'h') imgObj.set('flipX', !imgObj.flipX);
    else              imgObj.set('flipY', !imgObj.flipY);
    fabricRef.current?.renderAll();
  };

  /* ── Toggle draw mode ── */
  const toggleDraw = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    const next = !isDrawing;
    fc.isDrawingMode = next;
    if (next) {
      fc.freeDrawingBrush = new fabric.PencilBrush(fc);
      fc.freeDrawingBrush.color = drawColor;
      fc.freeDrawingBrush.width = drawSize;
    }
    setIsDrawing(next);
  }, [isDrawing, drawColor, drawSize]);

  /* ── Add sticker (Fabric Text emoji) ── */
  const addSticker = (emoji) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const t = new fabric.Text(emoji, {
      left: fc.getWidth()  / 2 - 24,
      top:  fc.getHeight() / 2 - 24,
      fontSize: 48, selectable: true, hasControls: true, hasBorders: true,
    });
    fc.add(t); fc.setActiveObject(t); fc.renderAll();
    if (fc.isDrawingMode) { fc.isDrawingMode = false; setIsDrawing(false); }
  };

  /* ── Add text (IText) ── */
  const addText = () => {
    const txt = textInput.trim();
    if (!txt) return;
    const fc = fabricRef.current;
    if (!fc) return;
    const t = new fabric.IText(txt, {
      left: 40, top: fc.getHeight() - 60,
      fontSize: textSize, fill: textColor, fontFamily: textFont, fontWeight: '600',
      shadow: textColor === '#ffffff' ? 'rgba(0,0,0,0.6) 0px 2px 8px' : '',
      selectable: true, hasControls: true,
    });
    fc.add(t); fc.setActiveObject(t); fc.renderAll();
    setTextInput('');
    if (fc.isDrawingMode) { fc.isDrawingMode = false; setIsDrawing(false); }
  };

  /* ── Reset editor ── */
  const resetEditor = () => {
    if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; }
    imgObjRef.current = null;
    setPhotoDataURL(null);
    setFilterState({ preset: 'normal', brightness: 0, contrast: 0, saturation: 0, blur: 0 });
    setActiveFrame(FRAMES[0]);
    setIsDrawing(false);
    setActiveTab('filter');
    setStep('upload');
  };

  /* ── Send gift ── */
  const sendGift = async () => {
    const fc = fabricRef.current;
    if (!fc || sending) return;
    setSending(true);
    fc.discardActiveObject(); fc.isDrawingMode = false; setIsDrawing(false); fc.renderAll();
    let finalPhoto = fc.toDataURL({ format: 'jpeg', quality: 0.88, multiplier: 1.5 });
    setSuccessPhoto(finalPhoto);
    setStep('success');
    launchConfetti();
    spawnHeartsWindow();
    finalPhoto = await resizeTo1200(finalPhoto);
    try {
      await sendGiftApi({
        recipient: recipient || 'Khách',
        bouquet:   bouquet.map(b => b.flowerDef.name).join(', ') || 'Không có hoa',
        photo:     finalPhoto,
        timestamp: new Date().toLocaleString('vi-VN')
      });
    } catch { /* success screen already shown */ }
    finally   { setSending(false); }
  };

  /* ── Download ── */
  const downloadPhoto = () => {
    const fc = fabricRef.current;
    const src = fc
      ? fc.toDataURL({ format: 'png', quality: 1, multiplier: 2 })
      : successPhoto;
    if (!src) return;
    const a = document.createElement('a');
    a.download = 'anh-ky-niem.png';
    a.href = src;
    a.click();
  };

  const setFilter = (key, val) => setFilterState(prev => ({ ...prev, [key]: val }));
  const resetFilters = () => setFilterState({ preset: 'normal', brightness: 0, contrast: 0, saturation: 0, blur: 0 });
  const bouquetDesc = bouquet.length > 0 ? `${bouquet.length} bông hoa 🌸` : 'Chưa có bó hoa (tuỳ chọn)';

  /* ════════════════ RENDER ════════════════ */
  return (
    <section className="section-light" id="anh-ky-niem">
      <div className="container">
        <div className="sec-head" data-aos="fade-up">
          <h2 className="sec-title">Ảnh Kỷ Niệm Của Chúng Ta 📸</h2>
          <div className="sec-bar"></div>
          <p className="photo-subtitle">Tải ảnh lên, chỉnh bộ lọc, thêm nhãn dán, vẽ rồi gửi kèm bó hoa nhé!</p>
        </div>

        <div className="photo-editor-wrap" data-aos="fade-up" data-aos-delay="100">

          {/* ── STEP 1: Upload ── */}
          {step === 'upload' && (
            <div className="photo-step">
              <div
                className="upload-zone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-active'); }}
                onDragLeave={e => e.currentTarget.classList.remove('drag-active')}
                onDrop={e => { e.currentTarget.classList.remove('drag-active'); onDropZone(e); }}
              >
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
                <div className="upload-inner">
                  <div className="upload-icon">🖼️</div>
                  <p className="upload-title">Kéo thả ảnh vào đây</p>
                  <p className="upload-or">hoặc</p>
                  <button className="upload-btn" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    <Upload size={18} /> Chọn ảnh từ máy
                  </button>
                  <p className="upload-hint">JPG, PNG, WEBP • Tối đa 10MB</p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Editor ── */}
          {step === 'editor' && (
            <div className="photo-step">
              <div className="editor-layout">

                {/* ── LEFT: Canvas ── */}
                <div className="canvas-area">
                  {/* Control bar */}
                  <div className="ctrl-bar">
                    <button className="ctrl-btn" onClick={undo} title="Hoàn tác">
                      <Undo2 size={13} />
                    </button>
                    <button className="ctrl-btn ctrl-btn-del" onClick={deleteSelected} title="Xóa đang chọn">
                      <Trash2 size={13} />
                    </button>
                    <button className="ctrl-btn" onClick={() => rotateImage(-90)} title="Xoay trái 90°">
                      <RotateCcw size={13} />
                    </button>
                    <button className="ctrl-btn" onClick={() => rotateImage(90)} title="Xoay phải 90°">
                      <RotateCw size={13} />
                    </button>
                    <button className="ctrl-btn" onClick={() => flipImage('h')} title="Lật ngang">
                      <FlipHorizontal2 size={13} />
                    </button>
                    <button className="ctrl-btn" onClick={() => flipImage('v')} title="Lật dọc">
                      <FlipVertical2 size={13} />
                    </button>
                    <button className="ctrl-btn ctrl-btn-change" onClick={resetEditor} title="Đổi ảnh">
                      <ImageIcon size={13} /><span> Đổi ảnh</span>
                    </button>
                  </div>

                  {/* Canvas wrapper */}
                  <div className={`canvas-wrapper ${isDrawing ? 'drawing-mode' : ''}`}>
                    <canvas ref={canvasElRef} id="photo-canvas"></canvas>
                    <div className={`frame-overlay ${activeFrame.cls}`}></div>
                  </div>

                  <p className="canvas-hint">
                    {isDrawing
                      ? '✏️ Đang ở chế độ vẽ – nhấn "Dừng vẽ" để chọn/di chuyển'
                      : '👆 Nhấp để chọn • kéo để di chuyển • nhấp đúp vào chữ để sửa'}
                  </p>
                </div>

                {/* ── RIGHT: Tools ── */}
                <div className="tools-panel">
                  {/* Tab bar */}
                  <div className="et-tabs">
                    {TABS.map(({ id, Icon, label }) => (
                      <button
                        key={id}
                        className={`et-tab ${activeTab === id ? 'active' : ''}`}
                        onClick={() => setActiveTab(id)}
                      >
                        <Icon size={14} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* ── Filter tab ── */}
                  {activeTab === 'filter' && (
                    <div className="tab-content">
                      <div className="filter-presets-grid">
                        {FILTER_PRESETS.map(p => (
                          <button
                            key={p.id}
                            className={`filter-preset-btn ${filterState.preset === p.id ? 'active' : ''}`}
                            onClick={() => setFilter('preset', p.id)}
                          >
                            <span className="fp-icon">{p.icon}</span>
                            <span className="fp-label">{p.label}</span>
                          </button>
                        ))}
                      </div>
                      <div className="adj-divider">Điều chỉnh thủ công</div>
                      {[
                        { key: 'brightness', label: 'Độ sáng',    min: -0.8, max: 0.8, step: 0.05 },
                        { key: 'contrast',   label: 'Tương phản', min: -0.8, max: 0.8, step: 0.05 },
                        { key: 'saturation', label: 'Bão hoà',    min: -1,   max: 1,   step: 0.05 },
                        { key: 'blur',       label: 'Làm mờ',     min: 0,    max: 10,  step: 0.5  },
                      ].map(adj => (
                        <div className="adj-group" key={adj.key}>
                          <div className="adj-header">
                            <span className="adj-label">{adj.label}</span>
                            <span className="adj-value">
                              {filterState[adj.key] > 0 ? '+' : ''}{filterState[adj.key].toFixed(adj.key === 'blur' ? 1 : 2)}
                            </span>
                          </div>
                          <input type="range" className="adj-slider"
                            min={adj.min} max={adj.max} step={adj.step}
                            value={filterState[adj.key]}
                            onChange={e => setFilter(adj.key, parseFloat(e.target.value))} />
                        </div>
                      ))}
                      <button className="reset-filters-btn" onClick={resetFilters}>
                        <RefreshCw size={13} /> Reset bộ lọc
                      </button>
                    </div>
                  )}

                  {/* ── Sticker tab ── */}
                  {activeTab === 'sticker' && (
                    <div className="tab-content">
                      <p className="tab-hint">Nhấn để thêm • Kéo để di chuyển • Dùng góc để co giãn</p>
                      <div className="sticker-grid">
                        {STICKERS.map(s => (
                          <button key={s} className="sticker-btn" onClick={() => addSticker(s)}>{s}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Text tab ── */}
                  {activeTab === 'text' && (
                    <div className="tab-content">
                      <div className="caption-row">
                        <input
                          type="text" className="caption-input" placeholder="Nhập chữ của bạn..."
                          maxLength={80} value={textInput}
                          onChange={e => setTextInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addText()}
                        />
                        <button className="add-caption-btn" onClick={addText}>
                          <Plus size={15} />
                        </button>
                      </div>
                      <div className="adj-group">
                        <div className="adj-header">
                          <span className="adj-label">Cỡ chữ</span>
                          <span className="adj-value">{textSize}px</span>
                        </div>
                        <input type="range" className="adj-slider" min="14" max="80" step="2"
                          value={textSize} onChange={e => setTextSize(+e.target.value)} />
                      </div>
                      <div className="tool-section-label">Màu chữ</div>
                      <div className="color-swatch-row">
                        {TEXT_COLORS.map(c => (
                          <button key={c}
                            className={`color-swatch ${textColor === c ? 'active' : ''}`}
                            style={{ background: c, border: c === '#ffffff' ? '1.5px solid #ccc' : 'none' }}
                            onClick={() => setTextColor(c)} />
                        ))}
                      </div>
                      <div className="tool-section-label">Font chữ</div>
                      <div className="font-grid">
                        {TEXT_FONTS.map(f => (
                          <button key={f.value}
                            className={`font-btn ${textFont === f.value ? 'active' : ''}`}
                            style={{ fontFamily: f.value }}
                            onClick={() => setTextFont(f.value)}
                          >{f.label}</button>
                        ))}
                      </div>
                      <p className="tab-hint" style={{ marginTop: 10 }}>
                        💡 Nhấn đúp vào chữ trên ảnh để sửa trực tiếp
                      </p>
                    </div>
                  )}

                  {/* ── Frame tab ── */}
                  {activeTab === 'frame' && (
                    <div className="tab-content">
                      <div className="frame-grid">
                        {FRAMES.map(f => (
                          <button key={f.id}
                            className={`frame-btn ${activeFrame.id === f.id ? 'active' : ''}`}
                            onClick={() => setActiveFrame(f)}
                          >
                            <span className="frame-thumb" style={{ background: f.thumb }}></span>
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Draw tab ── */}
                  {activeTab === 'draw' && (
                    <div className="tab-content">
                      <button className={`draw-mode-btn ${isDrawing ? 'active' : ''}`} onClick={toggleDraw}>
                        {isDrawing ? <StopCircle size={16} /> : <Paintbrush size={16} />}
                        {isDrawing ? ' Dừng vẽ' : ' Bắt đầu vẽ'}
                      </button>
                      <div className="tool-section-label">Màu bút</div>
                      <div className="color-swatch-row">
                        {DRAW_COLORS.map(c => (
                          <button key={c}
                            className={`color-swatch ${drawColor === c ? 'active' : ''}`}
                            style={{ background: c, border: c === '#ffffff' ? '1.5px solid #ccc' : 'none' }}
                            onClick={() => {
                              setDrawColor(c);
                              const fc = fabricRef.current;
                              if (fc?.freeDrawingBrush) fc.freeDrawingBrush.color = c;
                            }} />
                        ))}
                        <input type="color" className="color-custom-input" value={drawColor}
                          onChange={e => {
                            setDrawColor(e.target.value);
                            const fc = fabricRef.current;
                            if (fc?.freeDrawingBrush) fc.freeDrawingBrush.color = e.target.value;
                          }} title="Màu tuỳ chỉnh" />
                      </div>
                      <div className="adj-group">
                        <div className="adj-header">
                          <span className="adj-label">Độ dày bút</span>
                          <span className="adj-value">{drawSize}px</span>
                        </div>
                        <input type="range" className="adj-slider" min="1" max="30" step="1"
                          value={drawSize} onChange={e => {
                            const v = +e.target.value;
                            setDrawSize(v);
                            const fc = fabricRef.current;
                            if (fc?.freeDrawingBrush) fc.freeDrawingBrush.width = v;
                          }} />
                      </div>
                      <p className="tab-hint">
                        💡 Bật vẽ để vẽ tự do. Tắt vẽ để chọn và di chuyển đối tượng.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Send bar */}
              <div className="send-bar">
                <div className="send-bar-info">
                  <div className="send-bar-photo-thumb">
                    {photoDataURL && <img src={photoDataURL} alt="thumb" />}
                  </div>
                  <div>
                    <p className="send-bar-title">Gửi kèm bó hoa 💐</p>
                    <p className="send-bar-sub">{bouquetDesc}</p>
                  </div>
                </div>
                <button className="final-send-btn" onClick={sendGift} disabled={sending}>
                  {sending
                    ? <><Loader2 size={15} className="icon-spin" /> Đang gửi...</>
                    : <><Send size={15} /> Gửi Tặng!</>}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 'success' && (
            <div className="photo-step">
              <div className="gift-success-box">
                <div className="gift-success-preview">
                  {successPhoto ? <img src={successPhoto} alt="Ảnh kỷ niệm" /> : <span>📸</span>}
                </div>
                <div className="gift-success-text">
                  <div className="gift-success-emoji">🎁 🌸 🎓</div>
                  <h3 className="gift-success-title">Đã gửi thành công!</h3>
                  <p className="gift-success-msg">
                    Bức ảnh kỷ niệm và bó hoa của bạn đã được gửi đến<br />
                    <strong>{recipient || 'Nguyễn Ngọc Minh Châu'}</strong> rồi. Cảm ơn bạn rất nhiều! 💛
                  </p>
                  <button className="download-gift-btn" onClick={downloadPhoto}>
                    <Download size={15} /> Tải ảnh xuống
                  </button>
                  <p className="share-hint">📤 Gửi ảnh này cho mình qua Zalo/Messenger nhé!</p>
                  <button className="gift-again-btn" onClick={() => { resetEditor(); setSuccessPhoto(null); }}>
                    <RotateCcw size={14} /> Làm lại từ đầu
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
