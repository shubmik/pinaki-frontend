/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        saffron: { 50:'#fff8f0', 100:'#ffefd6', 200:'#ffd9a3', 300:'#ffbc63', 400:'#ff9a2e', 500:'#f97c0a', 600:'#e8541a', 700:'#c23e10', 800:'#9c3113', 900:'#7d2912' },
        navy:   { 50:'#eef2ff', 100:'#e0e7ff', 200:'#c7d2fe', 300:'#a5b4fc', 400:'#818cf8', 500:'#1a1a2e', 600:'#16162a', 700:'#111126', 800:'#0d0d1f', 900:'#08081a' },
        gold:   { 400:'#fbbf24', 500:'#f59e0b' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
