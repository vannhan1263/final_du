import { useCountdown } from '../hooks/useCountdown.js';

const TARGET_DATE = '2026-04-24T12:00:00';

export default function CountdownSection() {
  const { days, hours, minutes, seconds } = useCountdown(TARGET_DATE);

  return (
    <section className="section-dark" id="dem-nguoc">
      <div className="container" style={{ textAlign: 'center' }}>
        <div data-aos="fade-up">
          <h2 className="sec-title light">Đếm Ngược Đến Ngày Nè</h2>
          <div className="sec-bar light"></div>
        </div>

        <div className="countdown-row" data-aos="zoom-in" data-aos-delay="150">
          <div className="cd-box">
            <span className="cd-num">{days}</span>
            <span className="cd-lbl">Ngày</span>
          </div>
          <div className="cd-sep">:</div>
          <div className="cd-box">
            <span className="cd-num">{hours}</span>
            <span className="cd-lbl">Giờ</span>
          </div>
          <div className="cd-sep">:</div>
          <div className="cd-box">
            <span className="cd-num">{minutes}</span>
            <span className="cd-lbl">Phút</span>
          </div>
          <div className="cd-sep">:</div>
          <div className="cd-box">
            <span className="cd-num">{seconds}</span>
            <span className="cd-lbl">Giây</span>
          </div>
        </div>
      </div>
    </section>
  );
}
