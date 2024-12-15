// inject-env.js
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the template file
const template = readFileSync(join(__dirname, 'index.html'), 'utf8');

// Replace the environment variable placeholder
const html = template.replace('process.env.OPENAI_API_KEY', `"${process.env.OPENAI_API_KEY}"`);

// Write the processed file
writeFileSync(join(__dirname, 'index.html'), html);
