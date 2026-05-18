/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "accent-green": "#10b981",
        "accent-amber": "#f59e0b",
        "accent-red": "#ef4444",
        "background-dark": "#05080a",
        "background-secondary": "#0b0e11",
        "background-tertiary": "#10151a",
      },
      fontFamily: {
        "heading": ["Syne", "Arial Narrow", "sans-serif"],
        "body": ["Inter Tight", "sans-serif"],
        "data": ["DM Mono", "monospace"],
      },
      fontSize: {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "3.75rem",
        "7xl": "4.5rem",
      },
      spacing: {
        "xs": "0.5rem",
        "sm": "1rem",
        "md": "1.5rem",
        "lg": "2rem",
        "xl": "3rem",
        "2xl": "4rem",
        "3xl": "6rem",
      },
      borderRadius: {
        "sm": "6px",
        "md": "8px",
        "lg": "12px",
        "xl": "16px",
      },
      backdropBlur: {
        "xs": "2px",
        "sm": "4px",
        "md": "8px",
        "lg": "12px",
        "xl": "16px",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.23, 1, 0.320, 1)",
      },
    },
  },
  plugins: [],
}