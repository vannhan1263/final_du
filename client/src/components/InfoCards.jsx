import { CalendarDays, Clock3, MapPin } from 'lucide-react';

export default function InfoCards() {
  const cards = [
    {
      icon: CalendarDays,
      label: 'Ngày tổ chức',
      val: 'Thứ Sáu, 24/04/2026',
      sub: null
    },
    {
      icon: Clock3,
      label: 'Thời gian',
      val: '15:30 - 17:00',
    },
    {
      icon: MapPin,
      label: 'Địa điểm',
      val: 'Hội trường A',
      sub: 'Trường Đại học Tài chính - Marketing\n306 Võ Văn Hát, Long Trường, Hồ Chí Minh'
    }
  ];

  return (
    <section className="section-light" id="thong-tin">
      <div className="container">
        <div className="sec-head" data-aos="fade-up">
          <h2 className="sec-title">Thông Tin Buổi Lễ</h2>
          <div className="sec-bar"></div>
        </div>

        <div className="info-grid">
          {cards.map((c, i) => (
            <div
              className="info-card"
              key={i}
              data-aos="fade-up"
              data-aos-delay={String((i + 1) * 100)}
            >
              <div className="info-icon-ring">
                <c.icon size={22} />
              </div>
              <h3 className="info-label">{c.label}</h3>
              <p className="info-val">{c.val}</p>
              {c.sub && (
                <p className="info-sub" style={{ whiteSpace: 'pre-line' }}>{c.sub}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
