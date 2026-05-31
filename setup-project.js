import fs from 'fs';
import path from 'path';

const dirs = [
    'src/components',
    'src/pages',
    'src/pages/auth',
    'src/pages/profile',
    'src/layouts',
    'src/services',
    'src/hooks',
    'src/types',
    'src/utils',
    'src/components/ui'
];

dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created: ${dir}`);
    }
});

const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22c55e',
          dark: '#16a34a',
          light: '#4ade80',
        },
        dark: {
          DEFAULT: '#121212',
          paper: '#1e1e1e',
          lighter: '#2d2d2d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
`;

fs.writeFileSync('tailwind.config.js', tailwindConfig);
console.log('Created tailwind.config.js');

const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

fs.writeFileSync('postcss.config.js', postcssConfig);
console.log('Created postcss.config.js');

const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-dark text-white font-sans antialiased;
}

.glass {
  @apply bg-white/10 backdrop-blur-md border border-white/20;
}
`;

fs.writeFileSync('src/index.css', indexCss);
console.log('Updated src/index.css');
