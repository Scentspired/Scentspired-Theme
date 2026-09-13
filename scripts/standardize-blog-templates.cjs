const fs = require('fs');
const path = require('path');
const { createTemplate, ORDER } = require('./template-builder.cjs');
const { blogDefinitions } = require('./blog-definitions.cjs');

// Directories to write standardized templates to
const TARGET_DIRS = [
  path.resolve(__dirname, '../templates'),
  path.resolve(__dirname, '../regions/usa/templates'),
  path.resolve(__dirname, '../regions/uk/templates'),
  path.resolve(__dirname, '../../Scentspired-USA/templates'),
  path.resolve(__dirname, '../../Scentspired-UK/templates')
];

// Load master blog-7
const blog7Path = path.resolve(__dirname, '../templates/article.blog-7.json');
const blog7Data = JSON.parse(fs.readFileSync(blog7Path, 'utf8'));

console.log('🚀 Starting Universal Blog Template Standardization across 16 templates...\n');

let totalWritten = 0;

for (let i = 1; i <= 16; i++) {
  let templateObj;
  if (i === 7) {
    templateObj = blog7Data;
  } else {
    const def = blogDefinitions[i];
    if (!def) {
      console.error(`❌ Missing definition for Blog ${i}`);
      process.exit(1);
    }
    templateObj = createTemplate(def);
  }

  const jsonString = JSON.stringify(templateObj, null, 2) + '\n';
  const fileName = `article.blog-${i}.json`;

  TARGET_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      const filePath = path.join(dir, fileName);
      fs.writeFileSync(filePath, jsonString, 'utf8');
      totalWritten++;
    }
  });

  console.log(`✅ Blog ${i}: Standardized 10-section canonical template generated (${fileName})`);
}

console.log(`\n🎉 Completed! Successfully written ${totalWritten} template files across target repositories.`);
