/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ethereum': {
          'blue': '#627eea',
          'purple': '#764ba2',
          'dark': '#1a1a1a',
          'darker': '#0a0a0a',
        },
        'devconnect': {
          'gold': '#D4AF37',
          'light-gold': '#FFD700',
        }
      }
    },
  },
  plugins: [],
}
