import { useState, useRef, useEffect, useCallback } from 'react';
import { Music2, Pause } from 'lucide-react';
import babyAudio from '../../assets/Baby.mp3';

const LOCAL_AUDIO_CANDIDATES = [
  babyAudio
];
const WEB_AUDIO_SRC = '';

const resolveAudioSource = () => {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('music');
  if (fromUrl && /^(https?:\/\/|\/)/i.test(fromUrl)) return fromUrl;
  return WEB_AUDIO_SRC;
};

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const resolvedSrc = resolveAudioSource();
  const [sourceIndex, setSourceIndex] = useState(0);
  const audioRef = useRef(null);
  const noteTimerRef = useRef(null);
  const autoplayArmedRef = useRef(true);

  const candidateSources = resolvedSrc
    ? [resolvedSrc]
    : LOCAL_AUDIO_CANDIDATES;
  const audioSrc = candidateSources[sourceIndex] || '';

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
    if (!audioRef.current || !audioSrc) return;
    autoplayArmedRef.current = false;

    if (playing) {
      audioRef.current.pause();
      clearTimeout(noteTimerRef.current);
    } else {
      try {
        await audioRef.current.play();
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

  useEffect(() => {
    if (!audioRef.current || !audioSrc) return;
    audioRef.current.load();
    autoplayArmedRef.current = true;
  }, [audioSrc]);

  /* Try autoplay on load and on first interaction */
  useEffect(() => {
    const tryAutoplay = async () => {
      if (!audioRef.current || playing || !audioSrc || !autoplayArmedRef.current) return;

      try {
        await audioRef.current.play();
        autoplayArmedRef.current = false;
        return;
      } catch {
        // Browser may require muted autoplay first.
      }

      try {
        audioRef.current.muted = true;
        await audioRef.current.play();
        audioRef.current.muted = false;
        autoplayArmedRef.current = false;
      } catch {
        // Still blocked until user interacts.
      }
    };

    const handleFirstInteraction = (event) => {
      if (event.target?.closest('.music-btn')) return;
      tryAutoplay();
    };

    const tid = setTimeout(() => {
      tryAutoplay();
    }, 250);

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    tryAutoplay();
    return () => {
      clearTimeout(tid);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [audioSrc, playing]);

  return (
    <div className="music-player" id="music-player">
      <audio
        ref={audioRef}
        loop
        playsInline
        src={audioSrc}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          autoplayArmedRef.current = false;
          if (sourceIndex < candidateSources.length - 1) {
            setSourceIndex(prev => prev + 1);
          }
        }}
      />
      <button
        type="button"
        className={`music-btn ${playing ? 'playing' : ''}`}
        onClick={toggleMusic}
        title="Bật / tắt nhạc"
        disabled={!audioSrc}
      >
        {playing ? <Pause size={18} /> : <Music2 size={18} />}
      </button>
      <span className="music-label">{audioSrc ? (playing ? 'Đang phát' : 'Nhạc nền') : 'Chưa có nhạc'}</span>
    </div>
  );
}
