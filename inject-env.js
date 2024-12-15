// inject-env.js
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the template file
const template = readFileSync(join(__dirname, 'index.html'), 'utf8');

// Create a placeholder that won't trigger secret scanning
const apiKeyPlaceholder = '{{OPENAI_API_KEY}}';

// Get the API key from environment variables
const apiKey = process.env.OPENAI_API_KEY || '';

// Create a safe version of the API key for the client
const safeHtml = template.replace(
  apiKeyPlaceholder,
  // Only expose the first and last 4 characters if key exists
  apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : ''
);

// Write the processed file
writeFileSync(join(__dirname, 'index.html'), safeHtml);
