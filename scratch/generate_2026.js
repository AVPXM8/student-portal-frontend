const fs = require('fs');
const path = require('path');

const resultsDir = path.join(__dirname, '../public/results');
const files = fs.readdirSync(resultsDir);

let output = '  // --- 2026 Batch ---\n';

let idCounter = 1;
for (const file of files) {
  let exam = 'Unknown';
  if (file.toLowerCase().includes('cuet')) exam = 'CUET-PG';
  else if (file.toLowerCase().includes('vit')) exam = 'VITMEE';
  else if (file.toLowerCase().includes('ipu')) exam = 'IPU-CET';

  let name = file.replace(/\.webp$/i, '');
  // capitalize first letter of each word
  name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const id = `26-${exam.substring(0,3).toLowerCase()}-${idCounter.toString().padStart(2, '0')}`;
  
  output += `  { id: '${id}', name: '${name}', achievement: 'Selected', exam: '${exam}', year: 2026, photoUrl: '/results/${file}' },\n`;
  idCounter++;
}

fs.writeFileSync(path.join(__dirname, 'generate_2026.txt'), output);
console.log('done');
