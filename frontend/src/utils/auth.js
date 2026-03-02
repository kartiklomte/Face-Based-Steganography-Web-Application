/**
 * Authentication utility functions
 */

/**
 * Store JWT token in localStorage
 */
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Get JWT token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Store user data in localStorage
 */
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Get user data from localStorage
 */
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Convert blob to base64
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert hex string back to blob
 */
export const hexToBlob = (hexString) => {
  const bytes = [];
  for (let i = 0; i < hexString.length; i += 2) {
    bytes.push(parseInt(hexString.substr(i, 2), 16));
  }
  return new Blob([new Uint8Array(bytes)], { type: 'image/png' });
};

/**
 * Download file from blob
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).catch(err => {
    console.error('Failed to copy:', err);
  });
};
