const fs = require('fs');
const path = require('path');
const { createTemplate, ORDER } = require('./template-builder.cjs');
const { blogDefinitions: usaBlogDefinitions } = require('./blog-definitions-usa.cjs');
const { ukBlogDefinitions } = require('./blog-definitions-uk.cjs');

console.log('🚀 Compiling Programmatic Standardized Blog Templates across regions...\n');

// 1. Compile USA regional templates
const USA_DIRS = [
  path.resolve(__dirname, '../templates'),
  path.resolve(__dirname, '../regions/usa/templates'),
  path.resolve(__dirname, '../../Scentspired-USA/templates')
];

let usaWritten = 0;
for (let i = 1; i <= 16; i++) {
  const def = usaBlogDefinitions[i];
  if (!def) {
    console.error(`❌ Missing USA definition for Blog ${i}`);
    process.exit(1);
  }
  const templateObj = createTemplate(def);
  const jsonString = JSON.stringify(templateObj, null, 2) + '\n';
  const fileName = `article.blog-${i}.json`;

  USA_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.writeFileSync(path.join(dir, fileName), jsonString, 'utf8');
      usaWritten++;
    }
  });
  console.log(`✅ [USA] Blog ${i}: Standardized 10-section JSON generated (${fileName})`);
}

// 2. Compile UK regional templates
const UK_DIRS = [
  path.resolve(__dirname, '../regions/uk/templates'),
  path.resolve(__dirname, '../../Scentspired-UK/templates')
];

let ukWritten = 0;
for (let i = 1; i <= 16; i++) {
  const def = ukBlogDefinitions[i];
  if (!def) {
    console.error(`❌ Missing UK definition for Blog ${i}`);
    process.exit(1);
  }
  const templateObj = createTemplate(def);
  const jsonString = JSON.stringify(templateObj, null, 2) + '\n';
  const fileName = `article.blog-${i}.json`;

  UK_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.writeFileSync(path.join(dir, fileName), jsonString, 'utf8');
      ukWritten++;
    }
  });
  console.log(`✅ [UK]  Blog ${i}: Standardized 10-section JSON generated (${fileName})`);
}

console.log(`\n🎉 Programmatic Compilation Complete!`);
console.log(`   - USA Templates: ${usaWritten} files updated across core & USA repos`);
console.log(`   - UK Templates:  ${ukWritten} files updated across regional & UK repos`);
