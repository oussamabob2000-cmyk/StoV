import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'promogen_settings_encrypted';

export interface AISettings {
  provider: 'gemini' | 'openrouter';
  apiKey: string;
  modelName?: string;
}

export function saveEncryptedSettings(settings: AISettings, pin: string): void {
  if (!settings.apiKey || !pin) return;
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(settings), pin).toString();
  localStorage.setItem(STORAGE_KEY, encrypted);
}

export function getDecryptedSettings(pin: string): AISettings | null {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return null;
  
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, pin);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    return JSON.parse(decrypted) as AISettings;
  } catch (e) {
    return null;
  }
}

export function hasEncryptedSettings(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

export function clearSettings(): void {
  localStorage.removeItem(STORAGE_KEY);
}
