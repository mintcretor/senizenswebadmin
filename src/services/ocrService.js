import * as FileSystem from 'expo-file-system/legacy';

export const performOCR = async (imageUri, apiKey = 'K87899142388957') => {
  try {
    console.log('Starting OCR with OCR.space...');

    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
    formData.append('language', 'tha');
    formData.append('apikey', apiKey);
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.OCRExitCode !== 1) {
      throw new Error(result.ErrorMessage || 'OCR failed');
    }

    const text = result.ParsedResults[0].ParsedText;
    console.log('OCR Text:', text);

    const lines = text.split(/[\n\r]+/).filter(line => line.trim().length > 0);

    // แยกชื่อยา
    const { genericName, tradeName } = extractMedicationName(lines, text);

    const parsed = {
      genericName,
      tradeName,
      medicationName: genericName || tradeName || '',
      dosage: extractDosage(lines, text),
      dosageInstruction: extractDosageInstruction(lines, text),
      frequency: extractFrequency(lines, text),
      timing: extractTiming(lines, text),
      quantity: extractQuantity(lines, text),
      hospital: extractHospital(lines, text),
      specialInstruction: extractSpecialInstruction(lines, text),
      expiryDate: extractExpiryDate(lines, text),        // 🆕 เพิ่ม
      lotNumber: extractLotNumber(lines, text),          // 🆕 เพิ่ม
      rawText: text,
    };

    console.log('Parsed data:', parsed);

    return parsed;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('ไม่สามารถอ่านข้อมูลจากรูปภาพได้: ' + error.message);
  }
};


// ============================================
// 🔍 ปรับปรุง Helper Functions ให้แม่นยำขึ้น
// ============================================

const extractMedicationName = (lines, fullText) => {
  let genericName = '';
  let tradeName = '';

  // ============================================
  // วิธีที่ 1: ยาน้ำ เช่น "HEPALAC 10 gm/15 mL syr"
  // ============================================
  const syrupPattern = /([A-Z][A-Z\s]+?)\s+\d+(?:\.\d+)?\s*(?:gm?|mg)[\s\/]+\d+(?:\.\d+)?\s*m[lL]\s*(?:syr|syrup|sol|solution|susp|suspension)/i;
  const syrupMatch = fullText.match(syrupPattern);
  if (syrupMatch) {
    genericName = syrupMatch[1].trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    console.log('Syrup/Solution found:', { genericName });
    return { genericName, tradeName: '' };
  }

  // ============================================
  // วิธีที่ 2: หาชื่อยาที่อยู่ก่อน dosage
  // เช่น "HEPALAC 10 gm" หรือ "Amoxicillin 250 mg/5 mL"
  // ============================================
  const beforeDosagePattern = /([A-Z][A-Z\s]+?)\s+\d+(?:\.\d+)?\s*(?:gm?|mg|g)(?:\/|\s*\/\s*|\s+)\d+/i;
  const beforeDosageMatch = fullText.match(beforeDosagePattern);
  if (beforeDosageMatch) {
    genericName = beforeDosageMatch[1].trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    console.log('Before dosage pattern found:', { genericName });
    return { genericName, tradeName: '' };
  }

  // ============================================
  // วิธีที่ 3: ยาแบบผสม
  // ============================================
  const combinationPattern = /([A-Z][A-Z\s]+\+[A-Z\s]+)(?:\s+\d+(?:\.\d+)?\+\d+(?:\.\d+)?\s*(?:mg|g|ml))/i;
  const combMatch = fullText.match(combinationPattern);
  if (combMatch) {
    genericName = combMatch[1].trim()
      .split('+')
      .map(name => name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase())
      .join(' + ');
    return { genericName, tradeName: '' };
  }

  // ============================================
  // วิธีที่ 4: รูปแบบ "TradeName (Dosage) GenericName"
  // ============================================
  const pattern1 = /([A-Z][a-zA-Z]+)\s*\(([^)]*(?:mg|g|ml|mcg)[^)]*)\)\s*([a-zA-Z]+)/i;
  const match1 = fullText.match(pattern1);
  if (match1) {
    tradeName = match1[1].trim().replace(/["']/g, '');
    genericName = match1[3].trim().replace(/["']/g, '');
    return { genericName, tradeName };
  }

  // ============================================
  // วิธีที่ 5: รูปแบบ "GenericName (TradeName) Dosage"
  // ============================================
  for (let line of lines) {
    if (/\d+\s*(mg|g|ml|mcg)/i.test(line)) {
      const pattern2 = /([A-Z][a-zA-Z]+)\s*\(([A-Z][a-zA-Z]+)\)/i;
      const match2 = line.match(pattern2);
      if (match2) {
        genericName = match2[1].trim().replace(/["']/g, '');
        tradeName = match2[2].trim().replace(/["']/g, '');
        return { genericName, tradeName };
      }
    }
  }

  // ============================================
  // วิธีที่ 6: ค้นหาจาก "ชื่อสามัญ"
  // ============================================
  for (let line of lines) {
    if (line.includes('ชื่อสามัญ') || line.toLowerCase().includes('generic')) {
      const match = line.match(/(?:ชื่อสามัญ|generic)[\s:]*([A-Z][a-zA-Z\s+]+)/i);
      if (match) {
        genericName = match[1].trim().replace(/["']/g, '');
      }
    }
  }

  console.log('Final result:', { genericName, tradeName });
  return { genericName, tradeName };
};

const extractExpiryDate = (lines, fullText) => {
  const patterns = [
    /(?:exp\.?|expiry|หมดอายุ|ใช้ได้ถึง)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /(?:exp\.?|expiry|หมดอายุ)[\s:]*(\d{1,2}[\/\-\.]\d{2,4})/i,
    // หาจาก : ตามด้วยวันที่
    /:\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/,
  ];

  for (let pattern of patterns) {
    const match = fullText.match(pattern);
    if (match) {
      let dateStr = match[1] || match[0];
      dateStr = dateStr.trim();

      if (isValidDate(dateStr)) {
        return formatDate(dateStr);
      }
    }
  }

  for (let line of lines) {
    const lineLower = line.toLowerCase();
    if (lineLower.includes('exp') ||
      lineLower.includes('expiry') ||
      lineLower.includes('หมดอายุ') ||
      lineLower.includes('ใช้ได้ถึง')) {

      const dateMatch = line.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\d{1,2}[\/\-\.]\d{2,4})/);
      if (dateMatch) {
        const dateStr = (dateMatch[1] || dateMatch[2]).trim();
        if (isValidDate(dateStr)) {
          return formatDate(dateStr);
        }
      }
    }
  }

  return '';
};



const isValidDate = (dateStr) => {
  if (!/\d+[\/\-\.]\d+/.test(dateStr)) return false;

  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length < 2) return false;

  const nums = parts.map(p => parseInt(p, 10));
  if (nums.some(n => isNaN(n))) return false;

  if (parts.length === 2) {
    const [month, year] = nums;
    return month >= 1 && month <= 12 && year >= 0;
  }

  if (parts.length === 3) {
    const [day, month, year] = nums;
    return day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 0;
  }

  return false;
};

// 🆕 ฟังก์ชัน format วันที่ให้สวยงาม
const formatDate = (dateStr) => {
  let formatted = dateStr.replace(/[\-\.]/g, '/');
  const parts = formatted.split('/');

  if (parts.length >= 2) {
    let lastPart = parts[parts.length - 1];
    let yearNum = parseInt(lastPart, 10);

    // ============================================
    // แปลง พ.ศ. เป็น ค.ศ.
    // ============================================
    if (lastPart.length === 4) {
      // ถ้าปีมากกว่า 2500 = พ.ศ. (ต้องลบ 543)
      if (yearNum > 2500) {
        yearNum = yearNum - 543;
        parts[parts.length - 1] = yearNum.toString();
      }
    }
    // ถ้าเป็นปี 2 หลัก
    else if (lastPart.length === 2) {
      const currentYear = new Date().getFullYear();
      const currentCentury = Math.floor(currentYear / 100) * 100; // 2000

      // ลองทั้ง 3 แบบ: 19XX, 20XX, 25XX-543
      const year19 = 1900 + yearNum;
      const year20 = 2000 + yearNum;
      const yearBE = 2500 + yearNum - 543; // พ.ศ. แปลง ค.ศ.

      // เลือกปีที่ใกล้เคียงกับปัจจุบันที่สุดและอยู่ในอนาคต
      const allYears = [year19, year20, yearBE];
      const futureYears = allYears.filter(y => y >= currentYear && y <= currentYear + 10);

      if (futureYears.length > 0) {
        // เลือกปีที่น้อยที่สุดในอนาคต
        parts[parts.length - 1] = Math.min(...futureYears).toString();
      } else {
        // ถ้าไม่มีปีไหนในอนาคต ให้เลือกปีที่ใกล้ที่สุด
        const closest = allYears.reduce((prev, curr) =>
          Math.abs(curr - currentYear) < Math.abs(prev - currentYear) ? curr : prev
        );
        parts[parts.length - 1] = closest.toString();
      }
    }
  }

  return parts.join('/');
};


// 🆕 ฟังก์ชันสำหรับหา Lot Number
const extractLotNumber = (lines, fullText) => {
  // ============================================
  // รูปแบบ Lot Number ที่พบได้
  // ============================================
  const patterns = [
    // LotNo.0044, Lot No: 0044
    /(?:lot\s*no\.?|lot\s*number|batch\s*no\.?)[\s:\.]*([A-Z0-9\-]+)/i,

    // LOT123456, BATCH123456
    /(?:lot|batch)([A-Z0-9]+)/i,
  ];

  for (let pattern of patterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      let lotNum = match[1].trim();
      // ตรวจสอบว่ามีความยาวเหมาะสม
      if (lotNum.length >= 2 && lotNum.length <= 20) {
        return lotNum.toUpperCase();
      }
    }
  }

  // ค้นหาแบบทีละบรรทัด
  for (let line of lines) {
    const lineLower = line.toLowerCase();
    if (lineLower.includes('lotno') ||
      lineLower.includes('lot no') ||
      lineLower.includes('batch')) {

      // หาตัวเลข/ตัวอักษรหลัง lot
      const lotMatch = line.match(/(?:lotno\.?|lot\s*no\.?)[\s:]*([A-Z0-9]+)/i);
      if (lotMatch && lotMatch[1]) {
        return lotMatch[1].toUpperCase();
      }
    }
  }

  return '';
};



const extractDosage = (lines, fullText) => {
  // ============================================
  // รูปแบบยาน้ำ: "10 gm/15 mL" หรือ "250 mg/5 mL"
  // ============================================
  let match = fullText.match(/(\d+(?:\.\d+)?)\s*(?:gm?|mg)\s*\/\s*(\d+(?:\.\d+)?)\s*m[lL]/i);
  if (match) {
    return `${match[1]} ${match[0].includes('gm') || match[0].includes('g ') ? 'g' : 'mg'}/${match[2]} mL`;
  }

  // ============================================
  // รูปแบบยาผสม: "231.5+195 mg"
  // ============================================
  match = fullText.match(/(\d+(?:\.\d+)?\+\d+(?:\.\d+)?)\s*(mg|g|ml|mcg|microgram|unit)/i);
  if (match) {
    return match[0].trim();
  }

  // ============================================
  // รูปแบบปกติ: "500 mg"
  // ============================================
  match = fullText.match(/(\d+(?:\.\d+)?)\s*(mg|g|ml|mcg|microgram|unit|มก\.)/i);
  if (match) {
    return match[0].trim();
  }

  return '';
};


const extractDosageInstruction = (lines, fullText) => {
  // ============================================
  // รูปแบบยาน้ำ: "ให้ทางสายยาง 30 mL", "ให้ครั้งละ 15 ซีซี"
  // ============================================
  const liquidPatterns = [
    /ให้.*?\d+(?:\.\d+)?\s*(?:mL|ml|ซีซี|cc)/i,
    /รับประทาน.*?\d+(?:\.\d+)?\s*(?:mL|ml|ซีซี|cc)/i,
    /ครั้งละ\s*\d+(?:\.\d+)?\s*(?:mL|ml|ซีซี|cc)/i,
  ];

  for (let pattern of liquidPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  // ============================================
  // รูปแบบยาเม็ด
  // ============================================
  const tabletPatterns = [
    /รับประทาน\s+ครั้งละ\s+\d+\s+เม็ด/i,
    /ครั้งละ\s*\d+\s*เม็ด/i,
    /take\s*\d+\s*tablet/i,
  ];

  for (let pattern of tabletPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  // ค้นหาทีละบรรทัด
  for (let line of lines) {
    if ((line.includes('รับประทาน') || line.includes('ให้')) &&
      (line.includes('เม็ด') || line.includes('mL') || line.includes('ซีซี'))) {
      return line.trim();
    }
    if (line.includes('ครั้งละ') && /\d/.test(line)) {
      return line.trim();
    }
  }

  return '';
};
const extractFrequency = (lines, fullText) => {
  const text = fullText.toLowerCase();
  
  // ============================================
  // รูปแบบพิเศษ
  // ============================================
  if (text.includes('วันเว้นวัน') || text.match(/ทุก\s*48\s*ชั?(?:วโมง|ม)/)) return 'q48h';
  if (text.match(/ทุก\s*72\s*ชั?(?:วโมง|ม)/)) return 'q72h';
  
  // ============================================
  // รูปแบบมาตรฐาน
  // ============================================
  if (text.includes('tid') || text.match(/วันละ\s*3\s*ครั้ง/) || text.match(/3\s*ครั้ง.*วัน/)) return 'tid';
  if (text.includes('bid') || text.match(/วันละ\s*2\s*ครั้ง/) || text.match(/2\s*ครั้ง.*วัน/)) return 'bid';
  if (text.includes('qid') || text.match(/วันละ\s*4\s*ครั้ง/) || text.match(/4\s*ครั้ง.*วัน/)) return 'qid';
  if (text.includes('q2h') || text.match(/ทุก\s*2\s*ชั?(?:วโมง|ม)/)) return 'q2h';
  if (text.includes('q4h') || text.match(/ทุก\s*4\s*ชั?(?:วโมง|ม)/)) return 'q4h';
  if (text.includes('q6h') || text.match(/ทุก\s*6\s*ชั?(?:วโมง|ม)/)) return 'q6h';
  if (text.includes('q8h') || text.match(/ทุก\s*8\s*ชั?(?:วโมง|ม)/)) return 'q8h';
  if (text.includes('q12h') || text.match(/ทุก\s*12\s*ชั?(?:วโมง|ม)/)) return 'q12h';
  if (text.includes('prn') || text.includes('เมื่อต้องการ') || text.includes('เมื่อจำเป็น')) return 'prn';
  if (text.includes('od') || text.includes('qd') || text.match(/วันละ\s*1?\s*ครั้ง/) || text.match(/1\s*ครั้ง.*วัน/)) return 'OD';
  
  return '';
};

const extractTiming = (lines, fullText) => {
  const text = fullText.toLowerCase();

  // พร้อมอาหาร หรือ หลังอาหารทันที
  if (text.includes('พร้อมอาหาร') || text.includes('หลังอาหารทันที')) return 'pc';
  if (text.includes('ก่อนนอน') || text.includes('hs') || text.includes('before bed')) return 'hs';
  if (text.includes('ก่อนอาหาร') || text.includes('ac') || text.includes('before meal')) return 'ac';
  if (text.includes('หลังอาหาร') || text.includes('pc') || text.includes('after meal')) return 'pc';
  if (text.includes('เมื่อต้องการ') || text.includes('prn') || text.includes('as needed')) return 'prn';
  if (text.includes('ทันที') || text.includes('stat') || text.includes('immediately')) return 'stat';

  return '';
};

const extractQuantity = (lines, fullText) => {
  // ============================================
  // ยาน้ำ: "100 ml", "120 mL"
  // ============================================
  let match = fullText.match(/(\d+)\s*m[lL](?:\s|\.|\)|$)/);
  if (match) {
    const num = parseInt(match[1]);
    // ตรวจสอบว่าไม่ใช่ dosage (เช่น 15 mL ใน "10 g/15 mL")
    if (num >= 30) { // ขวดยามักจะ 30 mL ขึ้นไป
      return `${num} mL`;
    }
  }
  
  // ============================================
  // ยาเม็ด: [278 เม็ด]
  // ============================================
  match = fullText.match(/\[(\d+)\s*(?:เม็ด|แคปซูล|tablet|capsule|cap)\]/i);
  if (match) return match[1];
  
  match = fullText.match(/จำนวน[\s:]*(\d+)/i);
  if (match) return match[1];
  
  match = fullText.match(/[x×]\s*(\d+)\s*(?:เม็ด|แคปซูล|tablet|capsule)/i);
  if (match) return match[1];
  
  // หาจำนวนเม็ดที่มากกว่า 5 เม็ด
  const lines_filtered = lines.filter(line => 
    !line.includes('ครั้งละ') && !line.includes('วันละ')
  );
  
  for (let line of lines_filtered) {
    match = line.match(/(\d+)\s*(?:เม็ด|แคปซูล|tablet|capsule)/i);
    if (match) {
      const num = parseInt(match[1]);
      if (num > 5) {
        return match[1];
      }
    }
  }
  
  return '';
};

const extractHospital = (lines, fullText) => {
  const hospitalLines = [];

  // ============================================
  // รวบรวมบรรทัดที่เกี่ยวกับโรงพยาบาล
  // ============================================
  for (let line of lines) {
    const lineLower = line.toLowerCase();

    // ข้ามบรรทัดที่สั้นเกินไป (น้อยกว่า 5 ตัวอักษร)
    if (line.trim().length < 5) continue;

    if (line.includes('โรงพยาบาล') ||
      line.includes('คณะแพทย์ศาสตร์') ||
      line.includes('คณะแพทย์') ||
      line.includes('รพ.') ||
      lineLower.includes('hospital')) {
      hospitalLines.push({
        text: line.trim(),
        score: calculateHospitalScore(line)
      });
    }
  }

  // ============================================
  // เลือกบรรทัดที่ดีที่สุด
  // ============================================
  if (hospitalLines.length === 0) return '';

  // เรียงตาม score จากมากไปน้อย
  hospitalLines.sort((a, b) => b.score - a.score);

  return hospitalLines[0].text;
};

const calculateHospitalScore = (line) => {
  let score = 0;

  // +10 คะแนน ถ้ามีคำว่า "โรงพยาบาล" เต็มๆ (ไม่ใช่แค่ hospital)
  if (line.includes('โรงพยาบาล')) {
    score += 10;
  }

  // +5 คะแนน ถ้ามีชื่อเฉพาะ เช่น "พระราม", "รามาธิบดี", "จุฬา"
  const specificNames = [
    'พระราม', 'รามาธิบดี', 'จุฬา', 'ศิริราช', 'เชียงใหม่',
    'ขอนแก่น', 'สงขลา', 'วชิรพยาบาล', 'ตำรวจ', 'ราชวิถี',
    'พระมงกุฎ', 'ภูมิพล', 'มหาราช', 'วิชัยวุฒิ', 'เซนต์',
    'BNH', 'Bangkok', 'Bumrungrad', 'Samitivej', 'Praram'
  ];

  for (let name of specificNames) {
    if (line.includes(name)) {
      score += 5;
      break;
    }
  }

  // +3 คะแนน ถ้ามีคำอธิบายประเภท เช่น "ทั่วไป", "เอกชน", "มหาวิทยาลัย"
  const types = [
    'ทั่วไป', 'เอกชน', 'รัฐ', 'มหาวิทยาลัย', 'คณะแพทย์',
    'ขนาดใหญ่', 'ศูนย์', 'สถาบัน'
  ];

  for (let type of types) {
    if (line.includes(type)) {
      score += 3;
      break;
    }
  }

  // +2 คะแนน สำหรับทุกๆ 10 ตัวอักษร (ชื่อยาวมักเป็นชื่อเต็ม)
  score += Math.floor(line.length / 10) * 2;

  // +5 คะแนน ถ้ามีตัวเลขหมายเลขโทรศัพท์ หรือที่อยู่
  if (/\d{2,}/.test(line)) {
    score += 2;
  }

  // -10 คะแนน ถ้าเป็นแค่คำว่า "Hospital" หรือ "โรงพยาบาล" อย่างเดียว
  const trimmed = line.trim();
  if (trimmed === 'Hospital' ||
    trimmed === 'hospital' ||
    trimmed === 'โรงพยาบาล' ||
    trimmed.length < 10) {
    score -= 10;
  }

  // +5 คะแนน ถ้ามีภาษาไทย (ชื่อไทยมักเป็นชื่อเต็ม)
  if (/[ก-๙]/.test(line)) {
    score += 5;
  }

  return score;
};

const extractSpecialInstruction = (lines, fullText) => {
  const keywords = [
    'ง่วง', 'ระวัง', 'ห้าม', 'แพ้', 'อาการข้างเคียง',
    'drowsy', 'warning', 'caution', 'allergy', 'ไม่ควร',
    'โรคตับ', 'โรคไต', 'ตับ', 'ไต'
  ];

  const instructions = [];

  for (let line of lines) {
    const lineLower = line.toLowerCase();
    if (keywords.some(keyword => lineLower.includes(keyword.toLowerCase()))) {
      instructions.push(line.trim());
    }
  }

  return instructions.join(', ');
};