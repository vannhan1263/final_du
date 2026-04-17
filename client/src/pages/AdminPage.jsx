import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Home, Search, X, Loader2, Image as ImageIcon, Expand, Camera, Clock, Leaf, Download, Trash2 } from 'lucide-react';
import { getGiftsApi, deleteGiftApi } from '../utils/api.js';

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

function todayCount(gifts) {
  const today = new Date().toLocaleDateString('vi-VN');
  return gifts.filter(g => g.timestamp && g.timestamp.includes(today)).length;
}

export default function AdminPage() {
  const [gifts,       setGifts]      = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [search,      setSearch]     = useState('');
  const intervalRef = useRef(null);

  const fetchGifts = async () => {
    try {
      setLoading(true);
      const data = await getGiftsApi();
      setGifts(Array.isArray(data) ? data : []);
    } catch { /* keep previous */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    document.body.classList.add('admin-body');
    fetchGifts();
    intervalRef.current = setInterval(fetchGifts, REFRESH_INTERVAL);
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

  const giftsWithPhoto = gifts.filter(g => g.photoFile);
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
            <button className="adm-refresh-btn" onClick={fetchGifts} disabled={loading} title="Làm mới">
              <RefreshCw size={13} className={loading ? 'icon-spin' : ''} />
            </button>
            <a href="/" className="adm-home-btn">
              <Home size={13} />
              <span>Trang chủ</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── STATS ── */}
      <div className="adm-stats">
        <div className="adm-stat-card adm-stat-total">
          <div className="adm-stat-icon">🎁</div>
          <div className="adm-stat-info">
            <div className="adm-stat-num">{gifts.length}</div>
            <div className="adm-stat-label">Tổng quà tặng</div>
          </div>
        </div>
        <div className="adm-stat-card adm-stat-photo">
          <div className="adm-stat-icon">📸</div>
          <div className="adm-stat-info">
            <div className="adm-stat-num">{giftsWithPhoto.length}</div>
            <div className="adm-stat-label">Có kèm ảnh</div>
          </div>
        </div>
        <div className="adm-stat-card adm-stat-today">
          <div className="adm-stat-icon">📅</div>
          <div className="adm-stat-info">
            <div className="adm-stat-num">{todayCount(gifts)}</div>
            <div className="adm-stat-label">Hôm nay</div>
          </div>
        </div>
        <div className="adm-stat-card adm-stat-pct">
          <div className="adm-stat-icon">📊</div>
          <div className="adm-stat-info">
            <div className="adm-stat-num">
              {gifts.length ? Math.round(giftsWithPhoto.length / gifts.length * 100) : 0}%
            </div>
            <div className="adm-stat-label">Tỉ lệ có ảnh</div>
          </div>
        </div>
      </div>

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
            {filtered.map(g => (
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
            ))}
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
