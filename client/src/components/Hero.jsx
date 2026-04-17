import { useEffect } from 'react';
import { Star, ChevronDown } from 'lucide-react';

export default function Hero() {
  /* Generate twinkling stars */
  useEffect(() => {
    const container = document.getElementById('star-particles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 50; i++) {
      const s = document.createElement('div');
      const sz = Math.random() * 2.5 + 0.8;
      s.className = 'star-particle';
      s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--dur:${(Math.random()*4+2).toFixed(1)}s;--del:${(Math.random()*5).toFixed(1)}s;`;
      container.appendChild(s);
    }
  }, []);

  return (
    <section className="hero-section" id="hero">
      <div className="hero-overlay"></div>
      <div id="star-particles" className="star-field"></div>

      <div className="hero-content">
        <div className="cap-emoji" data-aos="zoom-in">🎓</div>

        <p className="hero-sub" data-aos="fade-up" data-aos-delay="100">
          Trân trọng kính mời bạn đến dự
        </p>

        <h1 className="hero-title" data-aos="fade-up" data-aos-delay="200">
          Lễ Tốt Nghiệp
        </h1>

        <div className="hero-divider" data-aos="fade-up" data-aos-delay="300">
          <span></span>
          <Star size={10} color="#ffd700" fill="#ffd700" />
          <span></span>
        </div>

        <p className="hero-name" data-aos="fade-up" data-aos-delay="400">
          Nguyễn Ngọc Minh Châu
        </p>
        <p className="hero-degree" data-aos="fade-up" data-aos-delay="500">
          Cử nhân Marketing
        </p>
        <p className="hero-school" data-aos="fade-up" data-aos-delay="600">
          Trường Đại học Tài chính - Marketing &bull; Khóa 2022 – 2026
        </p>

        <a href="#thong-tin" className="hero-scroll" data-aos="fade-up" data-aos-delay="700">
          <span>Xem chi tiết</span>
          <div className="scroll-chevron">
            <ChevronDown size={16} />
          </div>
        </a>
      </div>
    </section>
  );
}
