import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          'background': '#0d0d0d', // Extracted from Dribbble
          'card': '#161616',       // Extracted from Dribbble
          'border': '#242424',     // Extracted from Dribbble
        },
        accent: {
          'green': '#25E57E',     // Extracted from Dribbble
          'red': '#FF4B7F',       // Extracted from Dribbble
          'blue': '#60A5FA',      // Kept current Sky-400 equivalent for general UI if needed
        },
        text: {
          'primary': '#FFFFFF',    // Extracted from Dribbble
          'secondary': '#A8A8A8',  // Extracted from Dribbble
        }
      },
    },
  },
  plugins: [],
};
export default config;
