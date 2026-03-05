/**
 * API client for communicating with the backend
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Register a new user with face image
 */
export const registerUser = async (name, email, password, faceImage) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);
  formData.append('face_image', faceImage);

  const response = await apiClient.post('/api/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Login user with email, password, and face image
 */
export const loginUser = async (email, password, faceImage) => {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('password', password);
  formData.append('face_image', faceImage);

  const response = await apiClient.post('/api/login', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Embed encrypted message in merged images
 */
export const embedMessage = async (receiverEmail, secretMessage, image1, image2) => {
  const formData = new FormData();
  formData.append('receiver_email', receiverEmail);
  formData.append('secret_message', secretMessage);
  formData.append('image1', image1);
  formData.append('image2', image2);

  const response = await apiClient.post('/api/embed', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Extract message from stego image
 */
export const extractMessage = async (stegoImage, encryptionKey) => {
  const formData = new FormData();
  formData.append('stego_image', stegoImage);
  formData.append('encryption_key', encryptionKey);

  const response = await apiClient.post('/api/extract', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Share stego image via email
 */
export const shareViaEmail = async (receiverEmail, encryptionKey, stegoImage) => {
  const formData = new FormData();
  formData.append('receiver_email', receiverEmail);
  formData.append('encryption_key', encryptionKey);
  formData.append('stego_image', stegoImage);

  const response = await apiClient.post('/api/share-email', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Get all received messages
 */
export const getMessages = async () => {
  const response = await apiClient.get('/api/messages');
  return response.data;
};

export default apiClient;
