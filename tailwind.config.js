/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Đảm bảo dòng này CHÍNH XÁC
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'], // <-- Bạn cũng đã thêm dòng này chứ?
      },
    },
  },
  plugins: [],
}