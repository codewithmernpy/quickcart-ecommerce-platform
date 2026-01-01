/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      animation: {
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'zoom-in-up': 'zoom-in-up 0.6s ease-out forwards',
        'blob-slow': 'blob-slow 10s infinite cubic-bezier(0.6, 0.01, 0.6, 1)',
        'spin-slow-custom': 'spin-slow-custom 2s linear infinite',
        'pulse-custom': 'pulse-custom 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-up-down': 'float-up-down 2s ease-in-out infinite',
        'modal-fade-in': 'modal-fade-in 0.3s ease-out forwards',
      },
      animationDelay: {
         '2000': '2s', 
      },
      boxShadow: {
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      willChange: {
        'transform': 'transform, opacity', 
      }
    },
  },
  plugins: [],
};