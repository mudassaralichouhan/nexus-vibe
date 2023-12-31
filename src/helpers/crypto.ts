import crypto from 'crypto';
import {env} from "./index";

const algorithm = 'aes-256-cbc';
const secretKey = env('SECRET_KEY', 'WHCI2QWgEH2eEsKf8hSGVfEfcHJLwfqJ');

/**
 * Encrypts the given text using AES-256-CBC algorithm.
 * @param {string} text - The text to be encrypted.
 * @returns {string} - The encrypted text in hex format.
 */
export function encrypt(text: string): string {
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encryptedBuffer = Buffer.concat([cipher.update(text, 'utf-8'), cipher.final()]);
    return `${iv.toString('hex')}:${encryptedBuffer.toString('hex')}`;
}

/**
 * Decrypts the given encrypted text using AES-256-CBC algorithm.
 * @param {string} encryptedText - The encrypted text in hex format.
 * @returns {string} - The decrypted text.
 */
export function decrypt(encryptedText: string): string {
    const [ivHex, encryptedDataHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(secretKey, 'salt', 32); // Use scrypt or another key derivation function

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const encryptedBuffer = Buffer.from(encryptedDataHex, 'hex');
    const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return decryptedBuffer.toString('utf-8');
}
