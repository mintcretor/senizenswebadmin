// utils/dateUtils.js

/**
 * แปลง ISO date string เป็น format YYYY-MM-DD สำหรับ input type="date"
 */
export const formatDateForInput = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toISOString().split('T')[0];
};

/**
 * แปลง ISO date string เป็นรูปแบบไทย (วัน/เดือน/ปี)
 */
export const formatDateThai = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * แปลง ISO date string เป็นรูปแบบไทยแบบยาว (1 มกราคม 2568)
 */
export const formatDateThaiLong = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
  return `${day} ${month} ${year}`;
};

/**
 * แปลง ISO time string เป็น HH:MM
 */
export const formatTime = (timeString) => {
  if (!timeString) return '-';
  // ถ้าเป็น ISO format เต็ม
  if (timeString.includes('T')) {
    const date = new Date(timeString);
    return date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
  // ถ้าเป็น HH:MM:SS หรือ HH:MM อยู่แล้ว
  return timeString.slice(0, 5);
};

/**
 * แปลง date และ time สำหรับส่งไป API
 */
export const formatDateTimeForAPI = (date, time) => {
  if (!date) return null;
  // ถ้ามี time ให้รวมเข้าด้วยกัน
  if (time) {
    return `${date}T${time}:00.000Z`;
  }
  return `${date}T00:00:00.000Z`;
};

/**
 * ดึงวันที่และเวลาปัจจุบันในรูปแบบที่ใช้งานได้
 */
export const getCurrentDateTime = () => {
  const now = new Date();
  return {
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().slice(0, 5)
  };
};