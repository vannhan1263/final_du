const bloomSvg = (petal, center = '#ffe8a3') => `
  <g>
    <ellipse cx="27" cy="22" rx="8" ry="14" fill="${petal}" transform="rotate(0 27 28)"/>
    <ellipse cx="27" cy="22" rx="8" ry="14" fill="${petal}" transform="rotate(45 27 28)"/>
    <ellipse cx="27" cy="22" rx="8" ry="14" fill="${petal}" transform="rotate(90 27 28)"/>
    <ellipse cx="27" cy="22" rx="8" ry="14" fill="${petal}" transform="rotate(135 27 28)"/>
    <circle cx="27" cy="28" r="6.6" fill="${center}"/>
    <circle cx="27" cy="28" r="2" fill="#f4b028"/>
  </g>
`;

const leafSvg = (color) => `
  <g>
    <path d="M10,44 Q27,18 44,44 Q30,57 10,44 Z" fill="${color}"/>
    <path d="M14,44 Q27,28 40,44" stroke="#7aa157" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </g>
`;

const bowSvg = (main, dark) => `
  <g>
    <path d="M27,34 Q14,18 9,28 Q10,42 27,40 Q44,42 45,28 Q40,18 27,34Z" fill="${main}"/>
    <path d="M9,28 Q15,22 27,34" fill="${dark}"/>
    <path d="M45,28 Q39,22 27,34" fill="${dark}"/>
    <ellipse cx="27" cy="34" rx="4.5" ry="4" fill="${dark}"/>
    <path d="M23,36 Q27,48 22,58" stroke="${main}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M31,36 Q27,48 32,58" stroke="${main}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  </g>
`;

export const BOUQUET_ITEM_DEFS = [
  { id: 'flower_rose',    name: 'Hoa hồng pastel', group: 'flower', emoji: '🌸', svgFn: () => bloomSvg('#f58eb0') },
  { id: 'flower_peach',   name: 'Hoa đào',         group: 'flower', emoji: '🌸', svgFn: () => bloomSvg('#ffb48a') },
  { id: 'flower_lilac',   name: 'Hoa tím',         group: 'flower', emoji: '🌸', svgFn: () => bloomSvg('#c7a0ff') },
  { id: 'flower_sky',     name: 'Hoa xanh trời',   group: 'flower', emoji: '🌸', svgFn: () => bloomSvg('#86c5ff') },
  { id: 'flower_butter',  name: 'Hoa vàng kem',    group: 'flower', emoji: '🌸', svgFn: () => bloomSvg('#ffd979', '#fff4bf') },

  { id: 'leaf_soft',      name: 'Lá mềm',          group: 'leaf',   emoji: '🍃', svgFn: () => leafSvg('#92c56e') },
  { id: 'leaf_dark',      name: 'Lá đậm',          group: 'leaf',   emoji: '🍃', svgFn: () => leafSvg('#6fa154') },
  { id: 'leaf_mint',      name: 'Lá mint',         group: 'leaf',   emoji: '🍃', svgFn: () => leafSvg('#9fd8a5') },

  { id: 'bow_pink',       name: 'Nơ hồng',         group: 'bow',    emoji: '🎀', svgFn: () => bowSvg('#f8a5c7', '#e07aa8') },
  { id: 'bow_cream',      name: 'Nơ kem',          group: 'bow',    emoji: '🎀', svgFn: () => bowSvg('#f7df97', '#dfc372') },
  { id: 'bow_blue',       name: 'Nơ xanh',         group: 'bow',    emoji: '🎀', svgFn: () => bowSvg('#9fc8f6', '#79a8e5') }
];

export const SHELF_GROUPS = [
  { id: 'flower', label: 'Kệ Hoa' },
  { id: 'leaf', label: 'Kệ Lá' },
  { id: 'bow', label: 'Kệ Nơ' }
];

export const EMOJI_MAP = BOUQUET_ITEM_DEFS.reduce((acc, item) => {
  acc[item.id] = item.emoji || '🌸';
  return acc;
}, {});
