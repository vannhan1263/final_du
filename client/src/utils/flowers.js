/* ─── All SVG flower definitions ─── */
export const FLOWER_DEFS = [
  {
    id: 'lily_pink', name: 'Lily Hồng', row: 0, stemColor: '#5a9e4a',
    svgFn: () => `
      <line x1="27" y1="72" x2="27" y2="28" stroke="#5a9e4a" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="27" y1="55" x2="18" y2="42" stroke="#5a9e4a" stroke-width="1.4"/>
      <ellipse cx="15" cy="40" rx="7" ry="4" fill="#7ab84a" transform="rotate(-30 15 40)"/>
      <ellipse cx="27" cy="18" rx="5" ry="12" fill="#f07caa" transform="rotate(-20 27 18)"/>
      <ellipse cx="27" cy="18" rx="5" ry="12" fill="#f07caa" transform="rotate(20 27 18)"/>
      <ellipse cx="27" cy="18" rx="5" ry="12" fill="#e85a90" transform="rotate(0 27 18)"/>
      <ellipse cx="14" cy="22" rx="5" ry="12" fill="#f07caa" transform="rotate(-70 14 22)"/>
      <ellipse cx="40" cy="22" rx="5" ry="12" fill="#f07caa" transform="rotate(70 40 22)"/>
      <circle cx="27" cy="18" r="4" fill="#fff176"/>
      <circle cx="26" cy="17" r="1.5" fill="#f9a825"/>`
  },
  {
    id: 'lily_blue', name: 'Lily Xanh', row: 0, stemColor: '#5a9e4a',
    svgFn: () => `
      <line x1="27" y1="72" x2="27" y2="28" stroke="#5a9e4a" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="27" y1="50" x2="38" y2="40" stroke="#5a9e4a" stroke-width="1.4"/>
      <ellipse cx="40" cy="38" rx="7" ry="4" fill="#7ab84a" transform="rotate(30 40 38)"/>
      <ellipse cx="27" cy="18" rx="5" ry="12" fill="#82b0e0" transform="rotate(-20 27 18)"/>
      <ellipse cx="27" cy="18" rx="5" ry="12" fill="#82b0e0" transform="rotate(20 27 18)"/>
      <ellipse cx="27" cy="18" rx="5" ry="12" fill="#5a90c8" transform="rotate(0 27 18)"/>
      <ellipse cx="14" cy="22" rx="5" ry="12" fill="#82b0e0" transform="rotate(-70 14 22)"/>
      <ellipse cx="40" cy="22" rx="5" ry="12" fill="#82b0e0" transform="rotate(70 40 22)"/>
      <circle cx="27" cy="18" r="4" fill="#fff9c4"/>
      <circle cx="26" cy="17" r="1.5" fill="#f9a825"/>`
  },
  {
    id: 'tulip_pink', name: 'Tulip', row: 0, stemColor: '#4d8e3c',
    svgFn: () => `
      <line x1="27" y1="72" x2="27" y2="36" stroke="#4d8e3c" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="27" y1="52" x2="17" y2="44" stroke="#4d8e3c" stroke-width="1.4"/>
      <ellipse cx="13" cy="42" rx="8" ry="4" fill="#6aaa48" transform="rotate(-25 13 42)"/>
      <path d="M18,36 Q12,22 27,14 Q42,22 36,36 Q31,42 27,42 Q23,42 18,36 Z" fill="#f48faa"/>
      <path d="M18,36 Q15,25 27,16" stroke="#e06080" stroke-width="1" fill="none"/>
      <path d="M36,36 Q39,25 27,16" stroke="#e06080" stroke-width="1" fill="none"/>`
  },
  {
    id: 'daisy', name: 'Hoa Cúc', row: 1, stemColor: '#5a9e4a',
    svgFn: () => `
      <line x1="27" y1="72" x2="27" y2="30" stroke="#5a9e4a" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="27" cy="30" r="5" fill="#f9c21a"/>
      <ellipse cx="27" cy="16" rx="4" ry="9" fill="white"/>
      <ellipse cx="27" cy="16" rx="4" ry="9" fill="white" transform="rotate(45 27 30)"/>
      <ellipse cx="27" cy="16" rx="4" ry="9" fill="white" transform="rotate(90 27 30)"/>
      <ellipse cx="27" cy="16" rx="4" ry="9" fill="white" transform="rotate(135 27 30)"/>
      <circle cx="27" cy="30" r="5.5" fill="#f9c21a"/>
      <circle cx="27" cy="30" r="3" fill="#e6a800"/>`
  },
  {
    id: 'rose', name: 'Hoa Hồng', row: 1, stemColor: '#4d8e3c',
    svgFn: () => `
      <line x1="27" y1="72" x2="27" y2="36" stroke="#4d8e3c" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M25,68 Q14,58 18,48" stroke="#4d8e3c" stroke-width="1.2" fill="none"/>
      <ellipse cx="14" cy="46" rx="8" ry="4" fill="#6aaa48" transform="rotate(-30 14 46)"/>
      <circle cx="27" cy="27" r="12" fill="#f06080"/>
      <path d="M27,15 Q38,15 38,26 Q38,34 27,37 Q16,34 16,26 Q16,15 27,15Z" fill="#e04060"/>
      <path d="M21,18 Q27,12 33,18 Q36,24 27,28 Q18,24 21,18Z" fill="#f07090"/>
      <path d="M23,15 Q27,10 31,15 Q33,20 27,23 Q21,20 23,15Z" fill="#f8a0b0"/>
      <circle cx="27" cy="26" r="3" fill="#c02040"/>`
  },
  {
    id: 'sunflower', name: 'Hướng Dương', row: 1, stemColor: '#5a9e4a',
    svgFn: () => `
      <line x1="27" y1="72" x2="27" y2="30" stroke="#5a9e4a" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="27" y1="55" x2="38" y2="44" stroke="#5a9e4a" stroke-width="1.4"/>
      <ellipse cx="41" cy="42" rx="8" ry="4" fill="#6aaa48" transform="rotate(30 41 42)"/>
      <ellipse cx="27" cy="16" rx="4.5" ry="10" fill="#f9c21a"/>
      <ellipse cx="27" cy="16" rx="4.5" ry="10" fill="#f9c21a" transform="rotate(45 27 30)"/>
      <ellipse cx="27" cy="16" rx="4.5" ry="10" fill="#f9a800" transform="rotate(90 27 30)"/>
      <ellipse cx="27" cy="16" rx="4.5" ry="10" fill="#f9a800" transform="rotate(135 27 30)"/>
      <circle cx="27" cy="30" r="9" fill="#5d3a1a"/>
      <circle cx="27" cy="30" r="6" fill="#7a4e24"/>
      <circle cx="24" cy="28" r="1.2" fill="#4a2a10"/>
      <circle cx="27" cy="27" r="1.2" fill="#4a2a10"/>
      <circle cx="30" cy="28" r="1.2" fill="#4a2a10"/>
      <circle cx="25" cy="32" r="1.2" fill="#4a2a10"/>
      <circle cx="29" cy="32" r="1.2" fill="#4a2a10"/>`
  },
  {
    id: 'bow_pink', name: 'Nơ Hồng', row: 2, stemColor: '',
    svgFn: () => `
      <path d="M27,36 Q14,22 10,30 Q10,42 27,40 Q44,42 44,30 Q40,22 27,36Z" fill="#f9a8c4"/>
      <path d="M10,30 Q14,22 27,36" fill="#f07caa"/>
      <path d="M44,30 Q40,22 27,36" fill="#f07caa"/>
      <ellipse cx="27" cy="36" rx="4" ry="3.5" fill="#f07caa"/>
      <path d="M23,36 Q27,50 22,58" stroke="#f9a8c4" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M31,36 Q27,50 32,58" stroke="#f9a8c4" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
  },
  {
    id: 'bow_yellow', name: 'Nơ Vàng', row: 2, stemColor: '',
    svgFn: () => `
      <path d="M27,36 Q14,22 10,30 Q10,42 27,40 Q44,42 44,30 Q40,22 27,36Z" fill="#f9dd6a"/>
      <path d="M10,30 Q14,22 27,36" fill="#e6b800"/>
      <path d="M44,30 Q40,22 27,36" fill="#e6b800"/>
      <ellipse cx="27" cy="36" rx="4" ry="3.5" fill="#e6b800"/>
      <path d="M23,36 Q27,50 22,58" stroke="#f9dd6a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M31,36 Q27,50 32,58" stroke="#f9dd6a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
  },
  {
    id: 'bow_blue', name: 'Nơ Xanh', row: 2, stemColor: '',
    svgFn: () => `
      <path d="M27,36 Q14,22 10,30 Q10,42 27,40 Q44,42 44,30 Q40,22 27,36Z" fill="#82c4e8"/>
      <path d="M10,30 Q14,22 27,36" fill="#4a9ec8"/>
      <path d="M44,30 Q40,22 27,36" fill="#4a9ec8"/>
      <ellipse cx="27" cy="36" rx="4" ry="3.5" fill="#4a9ec8"/>
      <path d="M23,36 Q27,50 22,58" stroke="#82c4e8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M31,36 Q27,50 32,58" stroke="#82c4e8" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
  }
];

export const BOUQUET_SLOTS = [
  [44, 8], [28, 18], [60, 16], [18, 30], [52, 32],
  [35, 4], [64, 7], [22, 8], [70, 26]
];

export const EMOJI_MAP = {
  lily_pink: '🌸', lily_blue: '💠', tulip_pink: '🌷',
  daisy: '🌼', rose: '🌹', sunflower: '🌻',
  bow_pink: '🎀', bow_yellow: '🎗️', bow_blue: '💙'
};
