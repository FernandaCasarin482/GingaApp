const fs = require('fs');
const css = fs.readFileSync('style.css', 'utf8');

const colors = new Set();
const regex = /#[0-9a-fA-F]{3,6}\b/g;
let match;
while ((match = regex.exec(css)) !== null) {
  colors.add(match[0].toUpperCase());
}

console.log(Array.from(colors).sort());
