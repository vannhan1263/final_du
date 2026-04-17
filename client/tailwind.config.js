/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['"Cormorant Garamond"', '"Playfair Display"', 'serif'],
        body:     ['"Plus Jakarta Sans"', 'Montserrat', 'sans-serif'],
        script:   ['"Pinyon Script"', '"Great Vibes"', 'cursive'],
        bebas:    ['"Bebas Neue"', 'Impact', 'sans-serif']
      },
      colors: {
        gold:  { DEFAULT: '#ffd700', dark: '#e6ac00' },
        navy:  { DEFAULT: '#1a1a2e', mid: '#16213e', dark: '#0f3460' },
        pink:  { DEFAULT: '#ffb3c6', dark: '#ff8fab', darker: '#ff6b8b' }
      }
    }
  },
  plugins: []
};
