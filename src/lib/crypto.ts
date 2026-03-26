import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'promogen_api_key_encrypted';

export function saveEncryptedApiKey(apiKey: string, pin: string): void {
  if (!apiKey || !pin) return;
  const encrypted = CryptoJS.AES.encrypt(apiKey, pin).toString();
  localStorage.setItem(STORAGE_KEY, encrypted);
}

export function getDecryptedApiKey(pin: string): string | null {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return null;
  
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, pin);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch (e) {
    return null;
  }
}

export function hasEncryptedApiKey(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}
