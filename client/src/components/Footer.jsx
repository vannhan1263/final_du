import { Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="container" style={{ textAlign: 'center' }}>
        <div className="footer-hearts">💛 💙 💜 💖</div>
        <p style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2.5rem', color: '#ffd700', marginBottom: '6px' }}>
          Nguyễn Ngọc Minh Châu
        </p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '4px' }}>
          Rất mong được đón tiếp bạn!
        </p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '16px' }}>
          <Phone size={12} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
          084346349 – 0834454093
          &nbsp;|&nbsp;
          <Mail size={12} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
          vannhan.hcmue@gmail.com
        </p>
        <p style={{ color: 'rgba(255,255,255,0.12)', fontSize: '0.7rem', marginTop: '20px' }}>
          © 2026 Nhan Dep Trai
        </p>
      </div>
    </footer>
  );
}
