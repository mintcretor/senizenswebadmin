// utils/auth.js

/**
 * ฟังก์ชันสำหรับล้างข้อมูล authentication และออกจากระบบ
 */
export const logout = () => {
  // ลบข้อมูลทั้งหมดที่เกี่ยวข้องกับ authentication
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // ถ้ามีข้อมูลอื่นๆ ที่ต้องลบ เพิ่มตรงนี้
  // localStorage.removeItem('userPreferences');
  // localStorage.removeItem('settings');
  
  // Redirect ไปหน้า login
  window.location.href = '/login';
};

/**
 * ฟังก์ชันตรวจสอบว่า token หมดอายุหรือไม่
 * @param {string} token - JWT token
 * @returns {boolean} - true ถ้า token หมดอายุ
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode JWT token (ไม่ต้องใช้ library)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // ตรวจสอบเวลา expiration (exp เป็น timestamp ในหน่วยวินาที)
    if (payload.exp) {
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    }
    
    return false;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

/**
 * ฟังก์ชันตรวจสอบ authentication status
 * @returns {boolean} - true ถ้ายังล็อกอินอยู่
 */
export const checkAuthStatus = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return false;
  }
  
  // ตรวจสอบว่า token หมดอายุหรือไม่
  if (isTokenExpired(token)) {
    logout(); // ออกจากระบบทันทีถ้า token หมดอายุ
    return false;
  }
  
  return true;
};

/**
 * ฟังก์ชันสำหรับ handle API errors
 * @param {Error} error - Error object จาก API call
 */
export const handleApiError = (error) => {
  // ถ้า response status เป็น 401 (Unauthorized)
  if (error.response?.status === 401) {
    logout();
    return;
  }
  
  // ถ้า response status เป็น 403 (Forbidden) - อาจเป็น token หมดอายุ
  if (error.response?.status === 403) {
    const message = error.response?.data?.message || '';
    if (message.includes('token') || message.includes('expired')) {
      logout();
      return;
    }
  }
  
  // Return error สำหรับ handle ในที่อื่น
  return error;
};

/**
 * ฟังก์ชันสร้าง axios instance ที่มี interceptor
 */
export const createAxiosInstance = () => {
  const axios = require('axios');
  
  const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL
  });
  
  // Request interceptor - เพิ่ม token ใน header
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        // ตรวจสอบว่า token หมดอายุก่อนส่ง request
        if (isTokenExpired(token)) {
          logout();
          return Promise.reject(new Error('Token expired'));
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Response interceptor - handle errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      handleApiError(error);
      return Promise.reject(error);
    }
  );
  
  return instance;
};

/**
 * ฟังก์ชันดึงข้อมูล user จาก localStorage
 * @returns {Object|null} - User object หรือ null
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * ฟังก์ชันบันทึกข้อมูล authentication
 * @param {string} token - Auth token
 * @param {Object} user - User object
 */
export const saveAuthData = (token, user) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('token', token); // สำหรับ backward compatibility
  localStorage.setItem('user', JSON.stringify(user));
};