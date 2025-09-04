/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      // Ayurveda-inspired color palette
      colors: {
        // Primary Ayurvedic colors
        ayurveda: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Dosha-specific colors
        vata: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        pitta: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        kapha: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Seasonal colors
        spring: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
        },
        summer: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
        },
        autumn: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
        },
        winter: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
        },
      },
      // Custom fonts
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        ayurveda: ['Poppins', 'sans-serif'],
      },
      // Custom spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Custom shadows
      boxShadow: {
        'ayurveda': '0 4px 6px -1px rgba(34, 197, 94, 0.1), 0 2px 4px -1px rgba(34, 197, 94, 0.06)',
        'dosha': '0 10px 15px -3px rgba(34, 197, 94, 0.1), 0 4px 6px -2px rgba(34, 197, 94, 0.05)',
      },
      // Custom gradients
      backgroundImage: {
        'ayurveda-gradient': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'dosha-gradient': 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
        'seasonal-gradient': 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      },
      // Custom border radius
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [
    // Custom plugin for Ayurveda utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-dosha-vata': {
          color: theme('colors.vata.600'),
        },
        '.text-dosha-pitta': {
          color: theme('colors.pitta.600'),
        },
        '.text-dosha-kapha': {
          color: theme('colors.kapha.600'),
        },
        '.bg-dosha-vata': {
          backgroundColor: theme('colors.vata.100'),
        },
        '.bg-dosha-pitta': {
          backgroundColor: theme('colors.pitta.100'),
        },
        '.bg-dosha-kapha': {
          backgroundColor: theme('colors.kapha.100'),
        },
        '.border-dosha-vata': {
          borderColor: theme('colors.vata.300'),
        },
        '.border-dosha-pitta': {
          borderColor: theme('colors.pitta.300'),
        },
        '.border-dosha-kapha': {
          borderColor: theme('colors.kapha.300'),
        },
        '.shadow-ayurveda': {
          boxShadow: theme('boxShadow.ayurveda'),
        },
        '.shadow-dosha': {
          boxShadow: theme('boxShadow.dosha'),
        },
      };
      addUtilities(newUtilities);
    },
    // Forms plugin
    require('@tailwindcss/forms'),
  ],
};
