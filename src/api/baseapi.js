// src/api/baseapi.js
import axios from 'axios';

// กำหนด URLs ทั้งหมด (เรียงตามลำดับที่ต้องการลอง)
const API_URLS = [
  process.env.REACT_APP_LOCAL_API_URL,     // Local ก่อน (ถ้ามี)
  process.env.REACT_APP_API_BASE_URL,     // Public หลัง
].filter(Boolean); // กรอง undefined ออก

// ตรวจสอบว่ามี URL อย่างน้อย 1 ตัว
if (API_URLS.length === 0) {
  console.error('❌ No API URLs configured!');
  API_URLS.push('http://172.16.40.11:3001/api'); // fallback
}

console.log('📋 Available API URLs:', API_URLS);

let currentUrlIndex = 0;
let currentBaseURL = API_URLS[currentUrlIndex];

// สร้าง axios instance - ลด timeout ลง
const api = axios.create({
  baseURL: currentBaseURL,
  timeout: 5000, // 5 วินาที
});

// ฟังก์ชันสลับไปใช้ URL ถัดไป
const switchToNextURL = () => {
  currentUrlIndex++;

  if (currentUrlIndex < API_URLS.length) {
    currentBaseURL = API_URLS[currentUrlIndex];
    api.defaults.baseURL = currentBaseURL;

    // บันทึก URL ที่ใช้งานได้
    localStorage.setItem('activeBaseURL', currentBaseURL);
    localStorage.setItem('activeUrlIndex', currentUrlIndex.toString());

    console.log(`🔄 Switched to URL [${currentUrlIndex}/${API_URLS.length}]: ${currentBaseURL}`);
    return currentBaseURL; // return URL ใหม่
  }

  // หมด URL แล้ว - รีเซ็ตกลับไปใช้ primary
  console.error(`❌ All ${API_URLS.length} URLs failed, resetting to primary`);
  resetToPrimaryURL();
  return null;
};

// ฟังก์ชันรีเซ็ตกลับไปใช้ primary URL
export const resetToPrimaryURL = () => {
  currentUrlIndex = 0;
  currentBaseURL = API_URLS[0];
  api.defaults.baseURL = currentBaseURL;
  localStorage.removeItem('activeBaseURL');
  localStorage.removeItem('activeUrlIndex');
  console.log('🔄 Reset to primary URL:', currentBaseURL);
};

// ⚠️ ฟังก์ชัน logout อัตโนมัติ
const handleAutoLogout = () => {
  console.warn('🔐 Token expired - Auto logout');

  // ลบข้อมูลทั้งหมดที่เกี่ยวกับ authentication
  localStorage.removeItem('userToken');
  localStorage.removeItem('user');
  localStorage.removeItem('authToken'); // กรณีมีชื่อเก่า

  // แสดง notification (ถ้าต้องการ)
  const message = 'เซสชันของคุณหมดอายุ กรุณาเข้าสู่ระบบใหม่';

  // ใช้ alert หรือ toast notification
  if (window.confirm) {
    alert(message);
  }

  // Redirect ไปหน้า login
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

// ฟังก์ชันดึง current base URL
export const getCurrentBaseURL = () => currentBaseURL;

// ฟังก์ชันดึงทุก URLs ที่มี
export const getAllURLs = () => [...API_URLS];

// ฟังก์ชันดึง URL สำหรับรูปภาพ
export const getImageBaseURL = () => {
  // ตรวจสอบว่า currentBaseURL มีค่า
  if (!currentBaseURL) {
    console.error('❌ currentBaseURL is empty!');
    return 'https://api.thesenizens.com';
  }
  
  console.log('🔍 Original currentBaseURL:', currentBaseURL);
  
  // วิธีที่ปลอดภัยกว่า: แยก protocol และ domain ออกมา
  let baseURL = currentBaseURL;
  
  // ลบ /api ออก (ทั้ง /api และ /api/)
  baseURL = baseURL.replace(/\/api\/?$/, '');
  
  // ลบ / ท้ายออก
  baseURL = baseURL.replace(/\/$/, '');
  
  // ตรวจสอบว่าต้องมี protocol (http:// หรือ https://)
  if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
    console.error('❌ Invalid URL format:', baseURL);
    return 'https://api.thesenizens.com';
  }
  
  console.log('✅ Final Image Base URL:', baseURL);
  
  return baseURL;
};
// โหลด URL ที่ใช้งานได้จากครั้งก่อน
const loadActiveURL = () => {
  try {
    const savedURL = localStorage.getItem('activeBaseURL');
    const savedIndex = localStorage.getItem('activeUrlIndex');

    if (savedURL && savedIndex) {
      const index = parseInt(savedIndex);
      if (index < API_URLS.length && API_URLS[index] === savedURL) {
        currentUrlIndex = index;
        currentBaseURL = savedURL;
        api.defaults.baseURL = currentBaseURL;
        console.log(`✅ Loaded saved URL [${index}/${API_URLS.length}]: ${currentBaseURL}`);
        return;
      }
    }

    console.log(`🚀 Starting with primary URL [0/${API_URLS.length}]: ${currentBaseURL}`);
  } catch (error) {
    console.error('⚠️ Error loading active URL:', error);
  }
};

// เรียกใช้ตอน initialize
loadActiveURL();

// Request Interceptor - เพิ่ม token ก่อนส่ง request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else {
      // ถ้าเป็น FormData ให้ลบ Content-Type ออก ให้ browser ตั้งค่าเอง
      delete config.headers['Content-Type'];
    }

    if (process.env.REACT_APP_ENV === 'development') {
      console.log('🔵 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        timeout: config.timeout,
        currentIndex: currentUrlIndex,
        totalURLs: API_URLS.length,
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
    if (process.env.REACT_APP_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        baseURL: response.config.baseURL,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      console.error('❌ API Error Response:', {
        status: error.response.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        data: error.response.data,
      });

      // ⚠️ Token หมดอายุ (401 Unauthorized) - Auto Logout
      if (error.response.status === 401) {
        // เช็คว่าไม่ใช่หน้า login ก่อน (ป้องกันการ loop)
        if (!originalRequest.url?.includes('/auth/login')) {
          handleAutoLogout();
          return Promise.reject(error);
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

      // Server Error (500+) - ลองสลับ URL
      if (error.response.status >= 500 && !originalRequest._retry) {
        console.warn('💥 Server error - trying next URL');
        originalRequest._retry = true;

        const newBaseURL = switchToNextURL();
        if (newBaseURL) {
          // อัปเดต baseURL ใน originalRequest
          originalRequest.baseURL = newBaseURL;
          // รอ 500ms ก่อนลองใหม่
          await new Promise(resolve => setTimeout(resolve, 500));
          return api(originalRequest);
        }

        alert('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
      }

    } else if (error.request) {
      // Network Error หรือ Timeout - ลองสลับ URL ทันที
      const isTimeout = error.code === 'ECONNABORTED';

      console.error('🌐 Network Error:', {
        message: error.message,
        code: error.code,
        isTimeout,
        currentURL: originalRequest.baseURL || currentBaseURL,
        urlIndex: `${currentUrlIndex}/${API_URLS.length}`,
      });

      if (!originalRequest._retry) {
        originalRequest._retry = true;

        const newBaseURL = switchToNextURL();
        if (newBaseURL) {
          // อัปเดต baseURL ใน originalRequest
          originalRequest.baseURL = newBaseURL;

          console.log(`🔄 Retrying request with URL [${currentUrlIndex}/${API_URLS.length}]: ${newBaseURL}`);

          // รอ 300ms ก่อนลองใหม่
          await new Promise(resolve => setTimeout(resolve, 300));

          return api(originalRequest);
        }
      }

      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');

    } else {
      console.error('⚠️ Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;