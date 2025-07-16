import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'sentry_wallets';

// Save wallets to localStorage with encryption
export const saveWallets = (wallets, password) => {
  try {
    const walletsJson = JSON.stringify(wallets);
    const encrypted = CryptoJS.AES.encrypt(walletsJson, password).toString();
    localStorage.setItem(STORAGE_KEY, encrypted);
    return true;
  } catch (error) {
    console.error('Error saving wallets:', error);
    throw new Error('Failed to save wallets');
  }
};

// Load wallets from localStorage with decryption
export const loadWallets = (password) => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) {
      return [];
    }
    
    const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Invalid password');
    }
    
    const wallets = JSON.parse(decrypted);
    return wallets;
  } catch (error) {
    console.error('Error loading wallets:', error);
    if (error.message === 'Invalid password') {
      throw error;
    }
    throw new Error('Failed to load wallets or invalid password');
  }
};

// Check if wallets exist in storage
export const hasWallets = () => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};

// Clear all wallets from storage
export const clearWallets = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Save wallet password hint (optional security feature)
export const savePasswordHint = (hint) => {
  localStorage.setItem('sentry_password_hint', hint);
};

// Get password hint
export const getPasswordHint = () => {
  return localStorage.getItem('sentry_password_hint') || null;
};

// Clear password hint
export const clearPasswordHint = () => {
  localStorage.removeItem('sentry_password_hint');
};

// Validate password by trying to decrypt
export const validatePassword = (password) => {
  try {
    loadWallets(password);
    return true;
  } catch (error) {
    return false;
  }
};

// Generate wallet ID
export const generateWalletId = () => {
  return 'wallet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Storage utility for user preferences
export const saveUserPreferences = (preferences) => {
  try {
    localStorage.setItem('sentry_preferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

// Load user preferences
export const loadUserPreferences = () => {
  try {
    const preferences = localStorage.getItem('sentry_preferences');
    return preferences ? JSON.parse(preferences) : {
      defaultWallet: null,
      currency: 'USD',
      theme: 'light'
    };
  } catch (error) {
    console.error('Error loading preferences:', error);
    return {
      defaultWallet: null,
      currency: 'USD',
      theme: 'light'
    };
  }
};