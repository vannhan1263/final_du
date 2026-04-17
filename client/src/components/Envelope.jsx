import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, MousePointer2, X, CalendarDays, Clock, MapPin } from 'lucide-react';

export default function Envelope() {
  const [envOpen, setEnvOpen]         = useState(false);
  const [letterVisible, setLetterVisible] = useState(false);
  const [searchParams] = useSearchParams();
  const letterSrc = searchParams.get('letter') || '/letter.jpg';

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
        <div data-aos="fade-up">
          <h2 className="sec-title">Lá Thư Mời</h2>
          <div className="sec-bar"></div>
          <p className="env-hint-top">Nhấn vào phong bì để mở thư 💌</p>
        </div>

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
            <div className="env-letter-inner">
              <span style={{ fontSize: '26px' }}>🎓</span>
              <span className="env-letter-label">Lá thư mời</span>
            </div>
          </div>
          <p className="env-click-hint" id="env-click-hint">
            <MousePointer2 size={13} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />Nấn để mở
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
            <img
              id="letter-canva-img"
              src={letterSrc}
              alt="Lá thư mời"
              className="letter-canva-img"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                document.getElementById('letter-fallback').style.display = 'block';
              }}
            />
            <div id="letter-fallback" style={{ display: 'none' }}>
              <div className="letter-deco-top">🎓</div>
              <h2 className="letter-heading">Thư Mời Tốt Nghiệp</h2>
              <div className="letter-hr">
                <span></span>
                <Heart size={12} color="#f9a8c9" fill="#f9a8c9" />
                <span></span>
              </div>
              <p className="letter-greeting">Kính gửi bạn thân mến,</p>
              <p className="letter-text">
                Sau những năm tháng miệt mài trên giảng đường, hôm nay mình vô cùng hạnh phúc
                khi chính thức nhận được tấm bằng <strong>Cử nhân Marketing</strong>.
              </p>
              <div className="letter-event-box">
                <div className="letter-event-row">
                  <CalendarDays size={14} />
                  <span>Thứ Sáu, 24/04/2026</span>
                </div>
                <div className="letter-event-row">
                  <Clock size={14} />
                  <span>08:00 – 11:30</span>
                </div>
                <div className="letter-event-row">
                  <MapPin size={14} />
                  <span>Hội trường A – Trường ĐH Tài chính - Marketing</span>
                </div>
              </div>
              <p className="letter-closing">Mong được đón tiếp bạn!</p>
              <p className="letter-signature">Nguyễn Ngọc Minh Châu</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
