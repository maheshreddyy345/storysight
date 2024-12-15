// inject-env.js
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the template file
const template = readFileSync(join(__dirname, 'index.html'), 'utf8');

// Create a placeholder that won't trigger secret scanning
const apiKeyPlaceholder = '{{OPENAI_API_KEY}}';

// Replace the environment variable placeholder
const html = template.replace(apiKeyPlaceholder, process.env.OPENAI_API_KEY || '');

// Write the processed file
writeFileSync(join(__dirname, 'index.html'), html);
