/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#FF6B35',
        navy: '#1a1a2e'
      },
      boxShadow: {
        soft: '0 18px 50px rgba(26, 26, 46, 0.12)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(255,107,53,0.14) 0%, rgba(255,255,255,0) 55%), radial-gradient(circle at top right, rgba(255,107,53,0.16), transparent 35%)'
      }
    }
  },
  plugins: []
};
