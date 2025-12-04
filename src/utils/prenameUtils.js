/**
 * แปลง prename (คำนำหน้า) เป็นเพศ
 */
export const prenameToGender = (prename) => {
  if (!prename) return '';

  const femaleNames = [
    'นาง', 'นางสาว', 'ด.ญ.', 'หญิง',
    'Mrs.', 'Miss', 'Ms.', 'Dr. (Female)',
    'Prof. (Female)', 'Assoc.Prof. (Female)'
  ];

  const maleNames = [
    'นาย', 'ด.ช.', 'ชาย',
    'Mr.', 'Dr. (Male)',
    'Prof. (Male)', 'Assoc.Prof. (Male)',
    'Eng.', 'Arch.'
  ];

  const prenameToCheck = prename.trim().toLowerCase();

  // ตรวจสอบเพศหญิง
  if (femaleNames.some(name => prenameToCheck.includes(name.toLowerCase()))) {
    return 'หญิง';
  }

  // ตรวจสอบเพศชาย
  if (maleNames.some(name => prenameToCheck.includes(name.toLowerCase()))) {
    return 'ชาย';
  }

  // ถ้าไม่พบ return ว่าง
  return '';
};

/**
 * สร้างชื่อเต็ม จาก prename + firstName + lastName
 */
export const buildFullName = (prename, firstName, lastName) => {
  const parts = [];
  
  if (prename) parts.push(prename);
  if (firstName) parts.push(firstName);
  if (lastName) parts.push(lastName);
  
  return parts.join(' ');
};

/**
 * แปลง object ของข้อมูลผู้ป่วย
 * @param {Object} data - ข้อมูลผู้ป่วย (prename, firstName, lastName, gender)
 * @returns {Object} - ข้อมูลที่แปลงแล้ว (fullName, detectedGender)
 */
export const processPatientName = (data) => {
  const { prename = '', firstName = '', lastName = '', gender = '' } = data;

  // สร้างชื่อเต็ม
  const fullName = buildFullName(prename, firstName, lastName);

  // แปลง prename เป็นเพศ
  const detectedGender = prenameToGender(prename);

  // ใช้เพศที่ detected ถ้าไม่มีการกำหนด gender
  const finalGender = gender || detectedGender;

  return {
    fullName,
    detectedGender,
    finalGender,
    prename,
    firstName,
    lastName
  };
};

/**
 * ตัวอย่างการใช้งาน:
 * 
 * const data = {
 *   prename: 'นาง',
 *   firstName: 'วิชัย',
 *   lastName: 'สมหวัง'
 * };
 * 
 * const result = processPatientName(data);
 * console.log(result);
 * // {
 * //   fullName: 'นาง วิชัย สมหวัง',
 * //   detectedGender: 'หญิง',
 * //   finalGender: 'หญิง',
 * //   prename: 'นาง',
 * //   firstName: 'วิชัย',
 * //   lastName: 'สมหวัง'
 * // }
 */