// inject-env.js
const fs = require('fs');
const path = require('path');

// Read the template file
const template = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Replace the environment variable placeholder
const html = template.replace('process.env.OPENAI_API_KEY', `"${process.env.OPENAI_API_KEY}"`);

// Write the processed file
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
