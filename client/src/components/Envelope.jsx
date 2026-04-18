import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, MousePointer2, X } from 'lucide-react';
import { getLetterByIdApi } from '../utils/api.js';

export default function Envelope() {
  const [envOpen, setEnvOpen]         = useState(false);
  const [letterVisible, setLetterVisible] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [searchParams] = useSearchParams();
  const [letterSrc, setLetterSrc] = useState('/letter-invite.jpg');

  useEffect(() => {
    const directLetter = searchParams.get('letter');
    const lid = searchParams.get('lid');

    if (directLetter) {
      setImgError(false);
      setLetterSrc(directLetter);
      return;
    }

    if (!lid) {
      setImgError(false);
      setLetterSrc('/letter-invite.jpg');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await getLetterByIdApi(lid);
        const cloudUrl = data?.letter?.letterUrl;
        const file = data?.letter?.letterFile;
        if (!cancelled && cloudUrl) {
          setImgError(false);
          setLetterSrc(cloudUrl);
        }
        if (!cancelled && !cloudUrl && file) {
          setImgError(false);
          setLetterSrc(`/letters/${file}`);
        }
        if (!cancelled && !cloudUrl && !file) {
          setImgError(false);
          setLetterSrc('/letter-invite.jpg');
        }
      } catch {
        if (!cancelled) {
          setImgError(false);
          setLetterSrc('/letter-invite.jpg');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const handleEnvelopeClick = () => {
    if (envOpen) return;
    setEnvOpen(true);
    setTimeout(() => setLetterVisible(true), 950);
  };

  const closeModal = () => {
    setLetterVisible(false);
    setTimeout(() => setEnvOpen(false), 460);
  };

  const handleModalBackdrop = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  return (
    <section className="section-light" id="la-thu">
      <div className="container" style={{ textAlign: 'center' }}>

        {/* ── Envelope ── */}
        <div
          className={`env-wrap ${envOpen ? 'open' : ''}`}
          id="envelope"
          onClick={handleEnvelopeClick}
          data-aos="zoom-in"
          data-aos-delay="100"
        >
          <div className="env-body"></div>
          <div className="env-fold env-fold-left"></div>
          <div className="env-fold env-fold-right"></div>
          <div className="env-fold env-fold-bottom"></div>
          <div className="env-flap" id="env-flap"></div>
          <div className="env-seal" id="env-seal">
            <Heart size={18} fill="currentColor" />
          </div>
          <div className="env-letter" id="env-letter">
          </div>
          <p className="env-click-hint" id="env-click-hint">
            <MousePointer2 size={13} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />Bạn hãy vỗ tay và thiệp sẽ không mở, bạn nhấn thì mới mở
          </p>
        </div>
      </div>

      {/* ── Letter full-screen modal ── */}
      <div
        className={`letter-modal ${letterVisible ? 'visible' : ''}`}
        id="letter-modal"
        onClick={handleModalBackdrop}
      >
        <div className="letter-modal-card" id="letter-modal-card">
          <button
            className="letter-close-btn"
            id="letter-close-btn"
            onClick={closeModal}
            title="Đóng"
          >
            <X size={18} />
          </button>

          <div className="letter-body-inner">
            {!imgError && (
              <img
                key={letterSrc}
                id="letter-canva-img"
                src={letterSrc}
                alt="Lá thư mời"
                className="letter-canva-img"
                onLoad={() => setImgError(false)}
                onError={() => {
                  setImgError(true);
                }}
              />
            )}
            {imgError && (
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                Không tải được ảnh lá thư. Vui lòng kiểm tra lại link hoặc upload lại ảnh trong trang admin.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
