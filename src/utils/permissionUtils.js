// utils/permissionUtils.js
import { formatDateForInput, formatTime } from '../utils/dateUtils';

/**
 * ตรวจสอบว่าสามารถแก้ไข/ลบ record ได้หรือไม่
 */

// เงื่อนไข 1: ตรวจสอบตามเวลา (ห้ามแก้ไขหลังจากเวลาที่กำหนด)
export const canEditByTime = (recordDate, recordTime, hoursLimit = 24) => {
  const recordDateTime = new Date(`${formatDateForInput(recordDate)}T${recordTime}`);

  
  const now = new Date();
  const hoursPassed = (now - recordDateTime) / (1000 * 60 * 60);
  
  return hoursPassed <= hoursLimit;
};

export const canEditByTimes = (recordDate, recordTime, hoursLimit = 24) => {
  const recordDateTime = new Date(`${formatDateForInput(recordDate)}`);

  console.log('Record DateTime:', formatDateForInput(recordDate));
  const now = new Date();
  const hoursPassed = (now - recordDateTime) / (1000 * 60 * 60);
  
  return hoursPassed <= hoursLimit;
};

// เงื่อนไข 2: ตรวจสอบตามผู้สร้าง (เฉพาะคนสร้างเท่านั้น)
export const canEditByCreator = (recordCreatedBy, currentUserId) => {
  return recordCreatedBy === currentUserId;
};

// เงื่อนไข 3: ตรวจสอบตามบทบาท (role)
export const canEditByRole = (userRole, allowedRoles = ['admin', 'supervisor']) => {

  return allowedRoles.includes(userRole);
};

// เงื่อนไข 4: ตรวจสอบตามวันเดียวกัน (แก้ไขได้เฉพาะวันเดียวกับที่บันทึก)
export const canEditSameDay = (recordDate) => {
  const recordDateOnly = new Date(recordDate).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];
  
  return recordDateOnly === today;
};

// เงื่อนไข 5: ตรวจสอบตามสถานะ (ถ้ามี approved status)
export const canEditByStatus = (recordStatus) => {
  const editableStatuses = ['draft', 'pending'];
  return editableStatuses.includes(recordStatus);
};

// ฟังก์ชันรวมตรวจสอบทั้งหมด
export const canEditRecord = (record, currentUser, options = {}) => {

  const {
    checkTime = true,
    checkCreator = true,
    checkRole = true,
    checkSameDay = false,
    checkStatus = false,
    hoursLimit = 24,
    allowedRoles = ['หัวหน้าพยาบาล แผนก IPD', 'admin']
  } = options;

  // Admin มีสิทธิ์เต็ม
  if (currentUser.role === 'admin') {
    return { canEdit: true, reason: null };
  }

  // ตรวจสอบสถานะ
  if (checkStatus && record.status && !canEditByStatus(record.status)) {
    return { 
      canEdit: false, 
      reason: 'บันทึกนี้ถูกอนุมัติแล้ว ไม่สามารถแก้ไขได้' 
    };
  }

  // ตรวจสอบเวลา
  if (checkTime && !canEditByTime(record.record_date, record.record_time, hoursLimit)) {
    return { 
      canEdit: false, 
      reason: `แก้ไขได้เฉพาะภายใน ${hoursLimit} ชั่วโมงหลังบันทึก` 
    };
  }

  // ตรวจสอบวันเดียวกัน
  if (checkSameDay && !canEditSameDay(record.record_date)) {
    return { 
      canEdit: false, 
      reason: 'แก้ไขได้เฉพาะในวันที่บันทึกเท่านั้น' 
    };
  }

  // ตรวจสอบผู้สร้าง
  if (checkCreator && !canEditByCreator(record.created_by, currentUser.user_id)) {
    // ถ้าไม่ใช่คนสร้าง ให้ตรวจสอบบทบาท
    if (checkRole && !canEditByRole(currentUser.position_name, allowedRoles)) {
      return { 
        canEdit: false, 
        reason: 'คุณไม่มีสิทธิ์แก้ไขบันทึกของผู้อื่น' 
      };
    }
  }

  return { canEdit: true, reason: null };
};

// ฟังก์ชันสำหรับการลบ (มักจะเข้มงวดกว่าการแก้ไข)
export const canDeleteRecord = (record, currentUser, options = {}) => {
  const {
    checkTime = true,
    checkCreator = true,
    checkRole = true,
    hoursLimit = 2, // ลบได้เฉพาะ 2 ชั่วโมง (เข้มงวดกว่าแก้ไข)
    allowedRoles = ['admin', 'head_nurse']
  } = options;

  // Admin มีสิทธิ์เต็ม
  if (currentUser.role === 'admin') {
    return { canDelete: true, reason: null };
  }

  // ตรวจสอบเวลา
  if (checkTime && !canEditByTime(record.record_date, record.record_time, hoursLimit)) {
    return { 
      canDelete: false, 
      reason: `ลบได้เฉพาะภายใน ${hoursLimit} ชั่วโมงหลังบันทึก` 
    };
  }

  // ตรวจสอบผู้สร้าง
  if (checkCreator && !canEditByCreator(record.created_by, currentUser.user_id)) {
    // ถ้าไม่ใช่คนสร้าง ให้ตรวจสอบบทบาท
    if (checkRole && !canEditByRole(currentUser.role, allowedRoles)) {
      return { 
        canDelete: false, 
        reason: 'คุณไม่มีสิทธิ์ลบบันทึกของผู้อื่น' 
      };
    }
  }

  return { canDelete: true, reason: null };
};



export const canEditreport = (record, currentUser, options = {}) => {

  const {
    checkTime = true,
    checkCreator = true,
    checkRole = true,
    checkSameDay = false,
    checkStatus = false,
    hoursLimit = 24,
    allowedRoles = ['หัวหน้าพยาบาล แผนก IPD', 'admin']
  } = options;

  // Admin มีสิทธิ์เต็ม
  if (currentUser.role === 'admin') {
    return { canEdit: true, reason: null };
  }

  // ตรวจสอบสถานะ
  if (checkStatus && record.status && !canEditByStatus(record.status)) {
    return { 
      canEdit: false, 
      reason: 'บันทึกนี้ถูกอนุมัติแล้ว ไม่สามารถแก้ไขได้' 
    };
  }
  console.log('Record for permission check:', record);
  // ตรวจสอบเวลา
  if (checkTime && !canEditByTimes(record.report_date, record.record_time, hoursLimit)) {
    return { 
      canEdit: false, 
      reason: `แก้ไขได้เฉพาะภายใน ${hoursLimit} ชั่วโมงหลังบันทึก` 
    };
  }

  // ตรวจสอบวันเดียวกัน
  if (checkSameDay && !canEditSameDay(record.report_date)) {
    return { 
      canEdit: false, 
      reason: 'แก้ไขได้เฉพาะในวันที่บันทึกเท่านั้น' 
    };
  }

  // ตรวจสอบผู้สร้าง
  if (checkCreator && !canEditByCreator(record.created_by, currentUser.user_id)) {
    // ถ้าไม่ใช่คนสร้าง ให้ตรวจสอบบทบาท
    if (checkRole && !canEditByRole(currentUser.position_name, allowedRoles)) {
      return { 
        canEdit: false, 
        reason: 'คุณไม่มีสิทธิ์แก้ไขบันทึกของผู้อื่น' 
      };
    }
  }

  return { canEdit: true, reason: null };
};

// ฟังก์ชันสำหรับการลบ (มักจะเข้มงวดกว่าการแก้ไข)
export const canDeleteReport = (record, currentUser, options = {}) => {
  const {
    checkTime = true,
    checkCreator = true,
    checkRole = true,
    hoursLimit = 2, // ลบได้เฉพาะ 2 ชั่วโมง (เข้มงวดกว่าแก้ไข)
    allowedRoles = ['admin', 'head_nurse']
  } = options;

  // Admin มีสิทธิ์เต็ม
  if (currentUser.role === 'admin') {
    return { canDelete: true, reason: null };
  }

  // ตรวจสอบเวลา
  if (checkTime && !canEditByTime(record.report_date, record.record_time, hoursLimit)) {
    return { 
      canDelete: false, 
      reason: `ลบได้เฉพาะภายใน ${hoursLimit} ชั่วโมงหลังบันทึก` 
    };
  }

  // ตรวจสอบผู้สร้าง
  if (checkCreator && !canEditByCreator(record.created_by, currentUser.user_id)) {
    // ถ้าไม่ใช่คนสร้าง ให้ตรวจสอบบทบาท
    if (checkRole && !canEditByRole(currentUser.role, allowedRoles)) {
      return { 
        canDelete: false, 
        reason: 'คุณไม่มีสิทธิ์ลบบันทึกของผู้อื่น' 
      };
    }
  }

  return { canDelete: true, reason: null };
};