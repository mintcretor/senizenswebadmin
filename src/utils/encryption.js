import CryptoJS from 'crypto-js';

// ดึง SECRET_KEY จาก environment variable
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

// ตรวจสอบว่ามี SECRET_KEY หรือไม่
if (!SECRET_KEY) {
  console.error('REACT_APP_SECRET_KEY is not defined in environment variables');
}

export const encryptData = (data) => {
  try {
    if (!SECRET_KEY) {
      throw new Error('SECRET_KEY is not configured');
    }
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

export const decryptData = (encryptedData) => {
  try {
    if (!SECRET_KEY) {
      throw new Error('SECRET_KEY is not configured');
    }
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};