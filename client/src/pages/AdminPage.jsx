import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Home, Search, X, Loader2, Image as ImageIcon, Expand, Camera, Clock, Leaf, Download, Trash2, Link2, Copy, Upload, UserRound, MailOpen } from 'lucide-react';
import { getGiftsApi, deleteGiftApi, getLettersApi, createLetterApi, deleteLetterApi } from '../utils/api.js';

const REFRESH_INTERVAL = 30_000;

function formatBouquet(str) {
  if (!str || str === 'Không có hoa') return null;
  const parts = str.split(',').map(s => s.trim()).filter(Boolean);
  const counts = {};
  parts.forEach(p => { counts[p] = (counts[p] || 0) + 1; });
  return Object.entries(counts)
    .map(([k, v]) => (v > 1 ? `${k} ×${v}` : k))
    .join(' · ');
}

function normalizeBouquetLayout(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function AdminPage() {
  const [gifts,       setGifts]      = useState([]);
  const [letters,     setLetters]    = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [letterSaving, setLetterSaving] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [search,      setSearch]     = useState('');
  const [letterRecipient, setLetterRecipient] = useState('');
  const [letterFile, setLetterFile] = useState(null);
  const [justCopiedId, setJustCopiedId] = useState(null);
  const intervalRef = useRef(null);

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const makeLetterPath = (recipient, id) => `/?to=${encodeURIComponent(recipient)}&lid=${id}`;

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [giftsData, lettersData] = await Promise.all([getGiftsApi(), getLettersApi()]);
      setGifts(Array.isArray(giftsData) ? giftsData : []);
      setLetters(Array.isArray(lettersData) ? lettersData : []);
    } catch { /* keep previous */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    document.body.classList.add('admin-body');
    fetchDashboard();
    intervalRef.current = setInterval(fetchDashboard, REFRESH_INTERVAL);
    return () => {
      document.body.classList.remove('admin-body');
      clearInterval(intervalRef.current);
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa quà tặng này?')) return;
    try {
      await deleteGiftApi(id);
      setGifts(prev => prev.filter(g => g.id !== id));
    } catch { alert('Xóa thất bại!'); }
  };

  const handleCreateLetter = async (e) => {
    e.preventDefault();
    if (!letterRecipient.trim()) {
      alert('Vui lòng nhập tên người nhận');
      return;
    }
    if (!letterFile) {
      alert('Vui lòng chọn ảnh lá thư');
      return;
    }

    try {
      setLetterSaving(true);
      const letterImage = await readFileAsDataUrl(letterFile);
      const res = await createLetterApi({ recipient: letterRecipient.trim(), letterImage });
      const created = res?.letter;
      if (created) {
        setLetters(prev => [created, ...prev]);
        const fullLink = `${window.location.origin}${makeLetterPath(created.recipient, created.id)}`;
        try {
          await navigator.clipboard.writeText(fullLink);
          setJustCopiedId(created.id);
          setTimeout(() => setJustCopiedId(null), 1800);
        } catch {
          // Clipboard can fail on non-https contexts.
        }
      }

      setLetterRecipient('');
      setLetterFile(null);
      const input = document.getElementById('adm-letter-file-input');
      if (input) input.value = '';
    } catch {
      alert('Tạo link thư thất bại!');
    } finally {
      setLetterSaving(false);
    }
  };

  const handleDeleteLetter = async (id) => {
    if (!window.confirm('Xóa link thư này?')) return;
    try {
      await deleteLetterApi(id);
      setLetters(prev => prev.filter(item => item.id !== id));
    } catch {
      alert('Xóa link thư thất bại!');
    }
  };

  const copyLetterLink = async (letter) => {
    const fullLink = `${window.location.origin}${makeLetterPath(letter.recipient, letter.id)}`;
    try {
      await navigator.clipboard.writeText(fullLink);
      setJustCopiedId(letter.id);
      setTimeout(() => setJustCopiedId(null), 1800);
    } catch {
      alert('Không thể copy link trên trình duyệt này');
    }
  };

  const filtered = search
    ? gifts.filter(g => g.recipient?.toLowerCase().includes(search.toLowerCase()))
    : gifts;

  return (
    <div className="adm-root">

      {/* ── HEADER ── */}
      <header className="adm-header">
        <div className="adm-header-inner">
          <div className="adm-logo">
            <div className="adm-logo-icon">🎓</div>
            <div>
              <div className="adm-logo-title">Quản lý Quà Tặng</div>
              <div className="adm-logo-sub">Tốt nghiệp · Nguyễn Ngọc Minh Châu</div>
            </div>
          </div>
          <div className="adm-header-right">
            <span className="adm-live-dot"></span>
            <span className="adm-live-text">Live</span>
            <button className="adm-refresh-btn" onClick={fetchDashboard} disabled={loading} title="Làm mới">
              <RefreshCw size={13} className={loading ? 'icon-spin' : ''} />
            </button>
            <a href="/" className="adm-home-btn">
              <Home size={13} />
              <span>Trang chủ</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── TOOLBAR ── */}
      <div className="adm-toolbar">
        <div className="adm-search-wrap">
          <Search size={13} className="adm-search-icon" />
          <input
            className="adm-search"
            placeholder="Tìm theo tên người gửi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="adm-search-clear" onClick={() => setSearch('')}>
              <X size={11} />
            </button>
          )}
        </div>
        <div className="adm-toolbar-count">
          {loading
            ? <><Loader2 size={13} className="icon-spin" /> Đang tải...</>
            : <>{filtered.length} / {gifts.length} quà</>}
        </div>
      </div>

      {/* ── LETTER MANAGER ── */}
      <section className="adm-letter-panel">
        <div className="adm-letter-head">
          <h2><MailOpen size={16} /> Quản lý link lá thư</h2>
          <span>{letters.length} link</span>
        </div>

        <form className="adm-letter-form" onSubmit={handleCreateLetter}>
          <div className="adm-letter-field">
            <label><UserRound size={13} /> Gửi cho ai</label>
            <input
              type="text"
              placeholder="Ví dụ: Trần Ngọc Anh"
              value={letterRecipient}
              onChange={e => setLetterRecipient(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="adm-letter-field">
            <label><ImageIcon size={13} /> Ảnh lá thư đã edit</label>
            <input
              id="adm-letter-file-input"
              type="file"
              accept="image/*"
              onChange={e => setLetterFile(e.target.files?.[0] || null)}
            />
          </div>

          <button type="submit" className="adm-letter-create-btn" disabled={letterSaving}>
            {letterSaving ? <Loader2 size={13} className="icon-spin" /> : <Upload size={13} />}
            {letterSaving ? 'Đang tạo...' : 'Tạo link thư'}
          </button>
        </form>

        {letters.length === 0 ? (
          <p className="adm-letter-empty">Chưa có link thư nào. Hãy upload ảnh thư để tạo link cá nhân.</p>
        ) : (
          <div className="adm-letter-list">
            {letters.map(letter => {
              const relativeLink = makeLetterPath(letter.recipient, letter.id);
              const fullLink = `${window.location.origin}${relativeLink}`;

              return (
                <div className="adm-letter-item" key={letter.id}>
                  <img src={`/letters/${letter.letterFile}`} alt={letter.recipient} className="adm-letter-thumb" />

                  <div className="adm-letter-content">
                    <div className="adm-letter-row1">
                      <strong>{letter.recipient}</strong>
                      <span>{new Date(letter.createdAt).toLocaleString('vi-VN')}</span>
                    </div>

                    <div className="adm-letter-link-wrap">
                      <Link2 size={12} />
                      <input value={fullLink} readOnly />
                    </div>

                    <div className="adm-letter-actions">
                      <button className="adm-btn adm-btn-dl" onClick={() => copyLetterLink(letter)}>
                        <Copy size={12} /> {justCopiedId === letter.id ? 'Đã copy' : 'Copy link'}
                      </button>
                      <a className="adm-btn adm-btn-dl" href={relativeLink} target="_blank" rel="noreferrer">
                        <MailOpen size={12} /> Mở thử
                      </a>
                      <button className="adm-btn adm-btn-del" onClick={() => handleDeleteLetter(letter.id)}>
                        <Trash2 size={12} /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── GRID ── */}
      <main className="adm-main">
        {!loading && filtered.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">{search ? '🔍' : '📭'}</div>
            <p className="adm-empty-title">{search ? 'Không tìm thấy kết quả' : 'Chưa có quà tặng nào!'}</p>
            <p className="adm-empty-sub">{search ? 'Thử từ khoá khác nhé.' : 'Khi có quà mới sẽ hiển thị tại đây.'}</p>
          </div>
        ) : (
          <div className="adm-grid">
            {filtered.map(g => {
              const bouquetLayout = normalizeBouquetLayout(g.bouquetLayout);
              const hasPhoto = Boolean(g.photoFile);

              return (
              <div className="adm-card" key={g.id}>

                {/* Photo */}
                <div
                  className="adm-card-photo"
                  onClick={() => g.photoFile && setLightboxImg(`/gifts/${g.photoFile}`)}
                  style={{ cursor: g.photoFile ? 'pointer' : 'default' }}
                >
                  {g.photoFile
                    ? <img src={`/gifts/${g.photoFile}`} alt={g.recipient} loading="lazy" />
                    : <div className="adm-no-photo"><ImageIcon size={28} /><span>Không có ảnh</span></div>
                  }
                  {bouquetLayout.length > 0 && (
                    <div className={hasPhoto ? 'adm-bq-sticker adm-bq-sticker-photo' : 'adm-bq-sticker adm-bq-sticker-empty'}>
                      <div className="adm-bq-paper"></div>
                      {bouquetLayout.map((item, idx) => (
                        <div
                          key={`${item.id || 'item'}-${idx}`}
                          className="adm-bq-item"
                          style={{
                            left: `${item.x ?? 50}%`,
                            top: `${item.y ?? 40}%`,
                            transform: `translate(-50%, -50%) rotate(${item.rotation ?? 0}deg) scale(${item.scale ?? 1})`
                          }}
                        >
                          <svg viewBox="0 0 54 74" xmlns="http://www.w3.org/2000/svg" overflow="visible" dangerouslySetInnerHTML={{ __html: item.svg || '' }} />
                        </div>
                      ))}
                    </div>
                  )}
                  {g.photoFile && <div className="adm-photo-zoom"><Expand size={20} /></div>}
                  {g.photoFile && <div className="adm-photo-badge"><Camera size={10} /></div>}
                </div>

                {/* Body */}
                <div className="adm-card-body">
                  <div className="adm-card-header">
                    <div className="adm-avatar">{(g.recipient || 'K').charAt(0).toUpperCase()}</div>
                    <div className="adm-card-title">
                      <strong className="adm-recipient">{g.recipient || 'Khách'}</strong>
                      <span className="adm-time"><Clock size={11} /> {g.timestamp || '—'}</span>
                    </div>
                  </div>

                  {formatBouquet(g.bouquet) && (
                    <div className="adm-bouquet">
                      <Leaf size={12} />
                      <span>{formatBouquet(g.bouquet)}</span>
                    </div>
                  )}

                  <div className="adm-card-actions">
                    {g.photoFile && (
                      <a href={`/gifts/${g.photoFile}`} target="_blank" rel="noreferrer"
                        className="adm-btn adm-btn-dl" title="Tải ảnh">
                        <Download size={12} /> Tải ảnh
                      </a>
                    )}
                    <button className="adm-btn adm-btn-del" onClick={() => handleDelete(g.id)}>
                      <Trash2 size={12} /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            );})}
          </div>
        )}
      </main>

      {/* ── LIGHTBOX ── */}
      {lightboxImg && (
        <div className="adm-lightbox" onClick={e => { if (e.target === e.currentTarget) setLightboxImg(null); }}>
          <button className="adm-lb-close" onClick={() => setLightboxImg(null)}>
            <X size={15} />
          </button>
          <img src={lightboxImg} alt="Ảnh đầy đủ" className="adm-lb-img" />
          <a href={lightboxImg} download target="_blank" rel="noreferrer" className="adm-lb-dl">
            <Download size={14} /> Tải xuống
          </a>
        </div>
      )}

    </div>
  );
}
