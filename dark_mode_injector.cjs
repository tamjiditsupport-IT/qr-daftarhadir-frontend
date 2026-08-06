const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'src', 'pages'),
  path.join(__dirname, 'src', 'layouts'),
  path.join(__dirname, 'src', 'components')
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip files that might already be processed or not needed
  if (filePath.endsWith('AdminLayout.tsx')) return;
  if (filePath.endsWith('ThemeContext.tsx')) return;

  const replacements = [
    { regex: /\bbg-white\b(?! dark:bg-)/g, replacement: 'bg-white dark:bg-slate-800' },
    { regex: /\bbg-slate-50\b(?! dark:bg-)/g, replacement: 'bg-slate-50 dark:bg-slate-900' },
    { regex: /\btext-slate-800\b(?! dark:text-)/g, replacement: 'text-slate-800 dark:text-slate-100' },
    { regex: /\btext-slate-700\b(?! dark:text-)/g, replacement: 'text-slate-700 dark:text-slate-200' },
    { regex: /\btext-slate-600\b(?! dark:text-)/g, replacement: 'text-slate-600 dark:text-slate-300' },
    { regex: /\btext-slate-500\b(?! dark:text-)/g, replacement: 'text-slate-500 dark:text-slate-400' },
    { regex: /\btext-slate-400\b(?! dark:text-)/g, replacement: 'text-slate-400 dark:text-slate-500' },
    { regex: /\bborder-slate-200\b(?! dark:border-)/g, replacement: 'border-slate-200 dark:border-slate-700' },
    { regex: /\bborder-slate-100\b(?! dark:border-)/g, replacement: 'border-slate-100 dark:border-slate-800' },
    { regex: /\bborder-slate-300\b(?! dark:border-)/g, replacement: 'border-slate-300 dark:border-slate-600' },
    { regex: /\bdivide-slate-100\b(?! dark:divide-)/g, replacement: 'divide-slate-100 dark:divide-slate-800' },
    { regex: /\bdivide-slate-200\b(?! dark:divide-)/g, replacement: 'divide-slate-200 dark:divide-slate-700' },
    { regex: /\bbg-slate-100\b(?! dark:bg-)/g, replacement: 'bg-slate-100 dark:bg-slate-800' },
    { regex: /\bbg-slate-200\b(?! dark:bg-)/g, replacement: 'bg-slate-200 dark:bg-slate-700' },
    { regex: /\bhover:bg-slate-50\b(?! dark:hover:bg-)/g, replacement: 'hover:bg-slate-50 dark:hover:bg-slate-700' },
    { regex: /\bhover:bg-slate-100\b(?! dark:hover:bg-)/g, replacement: 'hover:bg-slate-100 dark:hover:bg-slate-800' },
    { regex: /\bhover:bg-slate-200\b(?! dark:hover:bg-)/g, replacement: 'hover:bg-slate-200 dark:hover:bg-slate-700' },
  ];

  let newContent = content;
  replacements.forEach(r => {
    newContent = newContent.replace(r.regex, r.replacement);
  });

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

directories.forEach(d => walkDir(d));
console.log('Done.');
