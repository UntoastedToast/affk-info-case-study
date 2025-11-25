const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// CONFIGURATION
const PASSWORD = process.argv[2] || 'affk2026'; // Default password
const INPUT_FILE = path.join(__dirname, 'src', 'index.html');
const TEMPLATE_FILE = path.join(__dirname, 'src', 'login_template.html');
const OUTPUT_FILE = path.join(__dirname, 'index.html');

// 1. Read Source Content
console.log(`Reading source from: ${INPUT_FILE}`);
const htmlContent = fs.readFileSync(INPUT_FILE, 'utf8');

// 2. Encryption (AES-256-GCM)
// We must match the Web Crypto API logic:
// PBKDF2 (SHA-256, 100k iterations) -> Key
// AES-GCM -> Encrypt

const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12); // 96-bit IV is standard for GCM

// Derive Key
const key = crypto.pbkdf2Sync(PASSWORD, salt, 100000, 32, 'sha256');

// Encrypt
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
let encrypted = cipher.update(htmlContent, 'utf8', 'base64');
encrypted += cipher.final('base64');
const authTag = cipher.getAuthTag();

// In GCM, the auth tag is usually appended to the ciphertext or handled separately.
// Web Crypto API's encrypt() returns ciphertext + tag concatenated at the end.
// Node's crypto module handles them separately. We must concatenate them for the browser to decrypt as one blob.
// However, Node's 'base64' output is strings. Let's use buffers to be precise.

const cipherBuffer = crypto.createCipheriv('aes-256-gcm', key, iv);
const encryptedBuffer = Buffer.concat([
    cipherBuffer.update(htmlContent, 'utf8'),
    cipherBuffer.final()
]);
const tagBuffer = cipherBuffer.getAuthTag();

// Combine Ciphertext + Tag (Standard WebCrypto format for AES-GCM)
const finalCiphertext = Buffer.concat([encryptedBuffer, tagBuffer]).toString('base64');

// Prepare Payload
const payload = {
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    ciphertext: finalCiphertext
};

// 3. Inject into Template
console.log(`Reading template from: ${TEMPLATE_FILE}`);
let template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

template = template.replace(
    '__PAYLOAD__', 
    JSON.stringify(payload, null, 4)
);

// 4. Write Output
fs.writeFileSync(OUTPUT_FILE, template);

console.log('---------------------------------------------------');
console.log('✅  SUCCESS: Site encrypted and built.');
console.log(`🔒  Password: ${PASSWORD}`);
console.log(`📂  Output:   ${OUTPUT_FILE}`);
console.log('---------------------------------------------------');
