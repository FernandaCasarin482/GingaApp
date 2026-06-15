const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Clean up previous failed PS injection
  const badString = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`n  <script src="supabase.js"></script>`n  <script src="app.js';
  if (content.includes(badString)) {
    content = content.replace(badString, '<script src="app.js');
  }

  // Proper injection
  if (!content.includes('supabase-js@2')) {
    content = content.replace('<script src="app.js', '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n  <script src="supabase.js"></script>\n  <script src="app.js');
    fs.writeFileSync(file, content);
  } else {
    // Write cleaned up version anyway if it just removed the bad string
    fs.writeFileSync(file, content);
  }
}
console.log('Injection done!');
