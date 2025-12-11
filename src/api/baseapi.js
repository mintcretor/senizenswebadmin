// src/api/baseapi.js
import axios from 'axios';

// สร้าง axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - เพิ่ม token ก่อนส่ง request
api.interceptors.request.use(
  (config) => {
    // ดึง token จาก localStorage
    const token = localStorage.getItem('userToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request (สำหรับ development)
    if (process.env.REACT_APP_ENV === 'development') {
      console.log('🔵 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - จัดการ response และ error
api.interceptors.response.use(
  (response) => {
    // Log response (สำหรับ development)
    if (process.env.REACT_APP_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // จัดการ error ต่างๆ
    if (error.response) {
      // Server ตอบกลับมา แต่เป็น error status (4xx, 5xx)
      console.error('❌ API Error Response:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
      });

      // Token หมดอายุ (401 Unauthorized)
      if (error.response.status === 401) {
        console.warn('🔐 Token expired or invalid');
        
        // ลบ token และ user data
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
        
        // Redirect to login (ถ้าไม่ใช่หน้า login อยู่แล้ว)
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Forbidden (403)
      if (error.response.status === 403) {
        console.warn('⛔ Access forbidden');
        alert('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
      }

      // Not Found (404)
      if (error.response.status === 404) {
        console.warn('🔍 Resource not found');
      }

      // Server Error (500)
      if (error.response.status >= 500) {
        console.error('💥 Server error');
        alert('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
      }

    } else if (error.request) {
      // ส่ง request ไปแล้ว แต่ไม่ได้รับ response (Network Error)
      console.error('🌐 Network Error:', error.request);
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      
    } else {
      // Error อื่นๆ
      console.error('⚠️ Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;