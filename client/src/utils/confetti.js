export function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#ffd700','#ff6b8b','#4ecdc4','#f9a8c4','#f9c21a','#ff9ff3','#82b0e0','#f06080'];
  const particles = Array.from({ length: 240 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: Math.random() * 11 + 5,
    h: Math.random() * 5 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: Math.random() * 4 + 2,
    angle: Math.random() * Math.PI * 2,
    spin:  (Math.random() - 0.5) * 0.22,
    drift: (Math.random() - 0.5) * 1.6
  }));

  let frame = 0;
  const maxFrames = 240;

  (function draw() {
    if (frame >= maxFrames) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const alpha = frame > maxFrames - 70 ? (maxFrames - frame) / 70 : 1;
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      p.y += p.speed; p.x += p.drift; p.angle += p.spin;
    });
    frame++;
    requestAnimationFrame(draw);
  })();
}

export function spawnHearts(targetEl) {
  const arr = ['❤️','💕','✨','💛','🌟','💗','🌸'];
  const rect = targetEl ? targetEl.getBoundingClientRect() : { left: 100, top: 100, width: 200, height: 200 };
  for (let i = 0; i < 16; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'music-note';
      h.textContent = arr[Math.floor(Math.random() * arr.length)];
      h.style.left = (rect.left + Math.random() * rect.width) + 'px';
      h.style.top  = (rect.top  + Math.random() * rect.height * 0.6) + 'px';
      h.style.fontSize = (14 + Math.random() * 14) + 'px';
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 2100);
    }, i * 70);
  }
}

export function spawnHeartsWindow() {
  const arr = ['🌸','💛','✨','🌟','💕','🎓','🎉'];
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'music-note';
      h.textContent = arr[Math.floor(Math.random() * arr.length)];
      h.style.left = (Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1) + 'px';
      h.style.top  = (Math.random() * window.innerHeight * 0.6 + 100) + 'px';
      h.style.fontSize = (14 + Math.random() * 18) + 'px';
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 2200);
    }, i * 60);
  }
}
