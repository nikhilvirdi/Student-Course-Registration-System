/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar-bg)',
          foreground: 'var(--sidebar-fg)',
          accent: 'var(--sidebar-accent)',
          border: 'var(--sidebar-border)',
        },
        card: {
          DEFAULT: 'var(--card-bg)',
          foreground: 'var(--card-fg)',
          border: 'var(--card-border)',
        }
      },
    },
  },
  plugins: [],
}
