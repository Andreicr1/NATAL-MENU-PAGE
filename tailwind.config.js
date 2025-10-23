/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: 'var(--cream)',
        burgundy: 'var(--burgundy)',
        gold: 'var(--gold)',
        'dark-burgundy': 'var(--dark-burgundy)',
        'light-gold': 'var(--light-gold)',
      },
    },
  },
  // Configure for better browser compatibility
  future: {
    hoverOnlyWhenSupported: true,
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
  corePlugins: {
    preflight: false,
  },
}
