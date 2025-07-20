/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "hover:shadow-[0_0_60px_30px_#ffffff]", 
  ],
  theme: {
    extend: {
      fontFamily: {
        klee: ['"Klee One"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

module.exports = {
  // ...
  theme: {
    extend: {
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 1s ease-out forwards',
      },
    },
  },
};
