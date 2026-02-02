/**
 * แปลง prename (คำนำหน้า) เป็นเพศ
 */
export const prenameToGender = (prename) => {
  if (!prename) return '';

  // ลบช่องว่างหน้าหลังและแปลงเป็นตัวเล็กเพื่อการตรวจสอบ (สำหรับภาษาอังกฤษ)
  // แต่ภาษาไทยเราจะเทียบตรงๆ หรือใช้ includes
  const text = prename.trim();
  
  // ---------------------------------------------------------
  // 1. กลุ่มที่ระบุเพศหญิง (Female)
  // ---------------------------------------------------------
  const femaleSet = new Set([
    'นาง', 'นางสาว', 'เด็กหญิง', 'ด.ญ.', 
    'คุณหญิง', 'ท่านผู้หญิง', // เพิ่มกลุ่มฐานันดรศักดิ์ที่เจอบ่อย
    'Mrs.', 'Miss', 'Ms.', 
    'พญ.', 'ทพญ.', 'ภญ.', 'สพ.ญ.'
  ]);

  if (femaleSet.has(text)) return 'หญิง';

  // ตรวจสอบกรณีมีคำต่อท้าย เช่น "พล.ต.หญิง" หรือ "คุณหญิง" (กรณีไม่ได้อยู่ใน Set)
  if (text.endsWith('หญิง') || text.includes('คุณหญิง')) return 'หญิง';
  if (text.toLowerCase().includes('(female)')) return 'หญิง';


  // ---------------------------------------------------------
  // 2. กลุ่มที่ระบุเพศชาย (Male)
  // ---------------------------------------------------------
  const maleSet = new Set([
    'นาย', 'เด็กชาย', 'ด.ช.', 
    'Mr.', 'Master', 
    'นพ.', 'ทพ.', 'ภก.', 'นสพ.',
    'พระ', 'สามเณร'
  ]);

  if (maleSet.has(text)) return 'ชาย';
  
  // ตรวจสอบกรณีระบุ (Male)
  if (text.toLowerCase().includes('(male)')) return 'ชาย';


  // ---------------------------------------------------------
  // 3. กลุ่มเป็นกลาง (Neutral) - คืนค่าว่างเพื่อให้ User ระบุเอง
  // ---------------------------------------------------------
  // การ Import Excel ถ้าเจอคำพวกนี้ ให้ถือว่าระบุเพศไม่ได้
  const neutralSet = new Set([
    'คุณ', 'ดร.', 'ศ.', 'รศ.', 'ผศ.', 'อ.', 'ทนาย',
    'Dr.', 'Prof.', 'Mx.'
  ]);

  if (neutralSet.has(text)) return ''; // ระบุไม่ได้

  // กรณีไม่เข้าเงื่อนไขใดๆ เลย
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