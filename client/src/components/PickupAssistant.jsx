import { useEffect, useState } from 'react';

const AVATAR_IMAGE = '../../assets/image/pickup-host.png';
const SCHOOL_MAP_IMAGE = '../../assets/image/school-map.png';

const POPUP_CONTENT = {
  title: 'Hi, mình là Nhân 2004',
  subtitle: 'Mình là "trợ lý tốt nghiệp của Châu".',
  pickupLocation: 'Mình sẽ đón bạn tại khúc quẹo vào hầm xe máy.',
  pickupTime: '',
  contactInfo: 'Zalo / SĐT: 0834454093',
  socialLinks: {
    facebook: 'https://www.facebook.com/nhan1810.nehihi/',
    instagram: 'https://www.instagram.com/han.n_18/',
    threads: 'https://www.threads.com/@han.n_18',
    zalo: 'https://zalo.me/0834454093'
  }
};

export default function PickupAssistant() {
  const [open, setOpen] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);
  const [mapBroken, setMapBroken] = useState(false);
  const [mapZoomOpen, setMapZoomOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(AVATAR_IMAGE);
  const [toggleHint, setToggleHint] = useState(false);

  useEffect(() => {
    const tid = setInterval(() => {
      setToggleHint((prev) => !prev);
    }, 900);

    return () => clearInterval(tid);
  }, []);

  return (
    <>
      <div className="pickup-widget" aria-label="Hỗ trợ đón khách">
        <div className="pickup-cloud pickup-cloud-blink">{toggleHint ? 'Click me' : 'Hi'}</div>
        <button
          type="button"
          className="pickup-avatar-btn"
          onClick={() => setOpen(true)}
          title="Mở thông tin đón khách"
        >
          {!imgBroken ? (
            <img
              src={avatarSrc}
              alt="Ảnh đại diện"
              className="pickup-avatar-img"
              onError={() => setImgBroken(true)}
            />
          ) : (
            <img
              src={AVATAR_IMAGE}
              alt="Ảnh đại diện dự phòng"
              className="pickup-avatar-fallback-img"
            />
          )}
        </button>
      </div>

      {open && (
        <div className="pickup-modal" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="pickup-modal-card">
            <button className="pickup-close-btn" onClick={() => setOpen(false)} title="Đóng">
              <i className="fas fa-times"></i>
            </button>

            <div className="pickup-modal-grid">
              <div>
                <h3 className="pickup-modal-title">{POPUP_CONTENT.title}</h3>
                <p className="pickup-modal-sub">{POPUP_CONTENT.subtitle}</p>

                <div className="pickup-form">
                  <div className="pickup-preview-box">
                    <div><strong><i className="fas fa-map-marker-alt pickup-inline-icon"></i> Điểm đón:</strong> {POPUP_CONTENT.pickupLocation}</div>
                    {POPUP_CONTENT.pickupTime && (
                      <div><strong><i className="far fa-clock pickup-inline-icon"></i> Thời gian:</strong> {POPUP_CONTENT.pickupTime}</div>
                    )}
                    {POPUP_CONTENT.contactInfo && (
                      <div><strong><i className="fas fa-phone-alt pickup-inline-icon"></i> Liên hệ:</strong> {POPUP_CONTENT.contactInfo}</div>
                    )}

                    <div className="pickup-social-title">Kết nối với mình:</div>
                    <div className="pickup-social-row">
                      <a className="pickup-social-link fb" href={POPUP_CONTENT.socialLinks.facebook} target="_blank" rel="noreferrer" title="Facebook">
                        <i className="fab fa-facebook-f"></i>
                      </a>
                      <a className="pickup-social-link ig" href={POPUP_CONTENT.socialLinks.instagram} target="_blank" rel="noreferrer" title="Instagram">
                        <i className="fab fa-instagram"></i>
                      </a>
                      <a className="pickup-social-link th" href={POPUP_CONTENT.socialLinks.threads} target="_blank" rel="noreferrer" title="Threads">
                        <i className="fab fa-threads"></i>
                      </a>
                      <a className="pickup-social-link zl" href={POPUP_CONTENT.socialLinks.zalo} target="_blank" rel="noreferrer" title="Zalo">
                        <i className="fas fa-comment-dots"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pickup-map-panel">
                <p className="pickup-map-title">Sơ đồ điểm đón</p>
                <img
                  src={SCHOOL_MAP_IMAGE}
                  alt="Sơ đồ điểm đón"
                  className="pickup-map-img"
                  onClick={() => {
                    if (!mapBroken) setMapZoomOpen(true);
                  }}
                  onError={(e) => {
                    setMapBroken(true);
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div className="pickup-map-fallback" style={{ display: 'none' }}>
                  Chưa có ảnh sơ đồ. Bạn chỉ cần up file school-map.png vào thư mục public là sẽ hiện.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {mapZoomOpen && (
        <div className="pickup-map-lightbox" onClick={(e) => { if (e.target === e.currentTarget) setMapZoomOpen(false); }}>
          <button
            className="pickup-map-lightbox-close"
            onClick={() => setMapZoomOpen(false)}
            title="Đóng sơ đồ"
          >
            <i className="fas fa-times"></i>
          </button>
          <img src={SCHOOL_MAP_IMAGE} alt="Sơ đồ điểm đón phóng to" className="pickup-map-lightbox-img" />
        </div>
      )}
    </>
  );
}
