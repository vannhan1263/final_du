import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { launchConfetti } from '../utils/confetti.js';
import MusicPlayer      from '../components/MusicPlayer.jsx';
import PickupAssistant  from '../components/PickupAssistant.jsx';
import Hero             from '../components/Hero.jsx';
import InfoCards        from '../components/InfoCards.jsx';
import CountdownSection from '../components/CountdownSection.jsx';
import Envelope         from '../components/Envelope.jsx';
import PhotoEditor      from '../components/PhotoEditor.jsx';
import MapSection       from '../components/MapSection.jsx';
import Footer           from '../components/Footer.jsx';

export default function HomePage() {
  const { setRecipient } = useApp();
  const [searchParams]   = useSearchParams();
  const confettiFired    = useRef(false);

  /* Apply URL personalisation: ?to=TenNguoi */
  useEffect(() => {
    const to = searchParams.get('to');
    if (to) {
      setRecipient(to);
      document.title = `Thư Mời Tốt Nghiệp – Gửi đến ${to}`;
    }
  }, [searchParams, setRecipient]);

  /* Auto-confetti on load */
  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;
    const tid = setTimeout(launchConfetti, 1600);
    return () => clearTimeout(tid);
  }, []);

  /* Confetti canvas resize */
  useEffect(() => {
    const onResize = () => {
      const c = document.getElementById('confetti-canvas');
      if (c) { c.width = window.innerWidth; c.height = window.innerHeight; }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      {/* Floating music player */}
      <MusicPlayer />
      <PickupAssistant />

      {/* Confetti canvas (shared across page) */}
      <canvas
        id="confetti-canvas"
        style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:9999 }}
      />

      {/* Page sections */}
      <Hero />
      <InfoCards />
      <CountdownSection />
      <Envelope />
      <PhotoEditor />
      <MapSection />
      <Footer />
    </>
  );
}
