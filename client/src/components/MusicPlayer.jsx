import { useState, useRef, useEffect, useCallback } from 'react';

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const audioRef    = useRef(null);
  const noteTimerRef = useRef(null);

  const spawnNote = useCallback(() => {
    const notes = ['♪', '♫', '♬'];
    const btn = document.querySelector('.music-btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const n = document.createElement('div');
    n.className = 'music-note';
    n.textContent = notes[Math.floor(Math.random() * notes.length)];
    n.style.left = (rect.left + rect.width / 2 - 8 + (Math.random() * 20 - 10)) + 'px';
    n.style.top  = (rect.top - 10) + 'px';
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2000);
  }, []);

  const scheduleNote = useCallback(() => {
    noteTimerRef.current = setTimeout(() => {
      spawnNote();
      scheduleNote();
    }, 1800 + Math.random() * 1200);
  }, [spawnNote]);

  const toggleMusic = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      clearTimeout(noteTimerRef.current);
    } else {
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch { /* autoplay blocked */ }
    }
  };

  useEffect(() => {
    if (playing) {
      scheduleNote();
    } else {
      clearTimeout(noteTimerRef.current);
    }
    return () => clearTimeout(noteTimerRef.current);
  }, [playing, scheduleNote]);

  /* Try autoplay on first user interaction */
  useEffect(() => {
    const tryAutoplay = async () => {
      if (!audioRef.current || playing) return;
      try { await audioRef.current.play(); setPlaying(true); } catch { /* blocked */ }
    };
    document.addEventListener('click',      tryAutoplay, { once: true });
    document.addEventListener('touchstart', tryAutoplay, { once: true });
    tryAutoplay();
    return () => {
      document.removeEventListener('click',      tryAutoplay);
      document.removeEventListener('touchstart', tryAutoplay);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="music-player" id="music-player">
      <audio ref={audioRef} loop>
        {/* 🎵 Thay link nhạc của bạn vào đây */}
        <source src="https://audio.com/emilis-pa/audio/justin-bieber-baby-ft-ludacris" type="audio/mpeg" />
      </audio>
      <button
        className={`music-btn ${playing ? 'playing' : ''}`}
        onClick={toggleMusic}
        title="Bật / tắt nhạc"
      >
        <i className={`fas ${playing ? 'fa-pause' : 'fa-music'}`}></i>
      </button>
      <span className="music-label">{playing ? 'Đang phát' : 'Nhạc nền'}</span>
    </div>
  );
}
