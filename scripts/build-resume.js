// scripts/setup-resume-data.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write the resume data to a JSON file in the public directory
const resumeDataPath = path.join(publicDir, 'resume.json');
fs.writeFileSync(resumeDataPath, JSON.stringify(resumeData, null, 2));

console.log(`Resume data saved to ${resumeDataPath}`);