const fs = require('fs');
const content = fs.readFileSync('app/admin/alumnos/[id]/page.tsx', 'utf8');
const lines = content.split('\n');
const imports = lines.filter(l => l.startsWith('import '));
console.log(imports.join('\n'));
