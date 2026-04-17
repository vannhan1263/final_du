import { useState, useEffect } from 'react';

const pad = n => String(n).padStart(2, '0');

export function useCountdown(targetISO) {
  const [time, setTime] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    const target = new Date(targetISO).getTime();

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTime({ days: 'x', hours: 'x', minutes: 'x', seconds: 'x' });
        return;
      }
      setTime({
        days:    pad(Math.floor(diff / 86400000)),
        hours:   pad(Math.floor((diff % 86400000) / 3600000)),
        minutes: pad(Math.floor((diff % 3600000) / 60000)),
        seconds: pad(Math.floor((diff % 60000) / 1000))
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  return time;
}
