/**
 * OCR Service - Web Version (ไม่ต้อง expo-file-system)
 * ใช้ได้กับ Web React ธรรมดา
 */

export const performOCR = async (imageSource, apiKey = 'K87899142388957') => {
  try {
    console.log('Starting OCR with OCR.space...');

    // ✅ imageSource เป็น Base64 string แล้ว (จาก FileReader.readAsDataURL().split(',')[1])
    let base64Image = '';

    if (typeof imageSource === 'string') {
      if (imageSource.startsWith('data:')) {
        // ถ้าเป็น Data URL ให้เอา Base64 ส่วนหลัง comma
        base64Image = imageSource.split(',')[1];
      } else {
        // ถ้าเป็น Base64 แล้ว ใช้เลย
        base64Image = imageSource;
      }
    } else {
      throw new Error('Invalid image source');
    }

    if (!base64Image) {
      throw new Error('Invalid base64 image');
    }

    // ============================================
    // 🆕 บีบรูปให้เล็กลงถ้าเกิน 1MB
    // ============================================
    const maxSizeKB = 900; // เก็บไว้ 900KB ให้มีขอบไป
    base64Image = await compressImage(base64Image, maxSizeKB);

    // ============================================
    // ส่งไปยัง OCR.space API
    // ============================================
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

    if (!result.ParsedResults || !result.ParsedResults[0]) {
      throw new Error('No OCR results found');
    }

    const text = result.ParsedResults[0].ParsedText;
    console.log('OCR Text:', text);

    const lines = text.split(/[\n\r]+/).filter(line => line.trim().length > 0);

    // ============================================
    // แยกข้อมูลจากข้อความ
    // ============================================
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
      expiryDate: extractExpiryDate(lines, text),
      lotNumber: extractLotNumber(lines, text),
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
// 🆕 ฟังก์ชันบีบรูป (Compression)
// ============================================
const compressImage = async (base64String, maxSizeKB = 900) => {
  return new Promise((resolve) => {
    // สร้าง img element เพื่อโหลดรูป
    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64String}`;

    img.onload = () => {
      // สร้าง canvas สำหรับบีบรูป
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // ตั้งค่าขนาด canvas
      let width = img.width;
      let height = img.height;

      // ลดขนาดรูปถ้าเกินกว่า 2000px
      if (width > 2000 || height > 2000) {
        const maxDimension = 2000;
        if (width > height) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // วาดรูปลงใน canvas
      ctx.drawImage(img, 0, 0, width, height);

      // บีบรูป - เริ่มจาก 0.9 quality แล้วลดลง
      let quality = 0.9;
      let compressed = canvas.toDataURL('image/jpeg', quality);

      // วนลูปบีบรูปจนกว่าจะเล็กกว่า maxSizeKB
      while (
        compressed.length > maxSizeKB * 1024 * 1.33 && // 1.33 เพราะ Base64 ใช้ 33% มากกว่า binary
        quality > 0.1
      ) {
        quality -= 0.1;
        compressed = canvas.toDataURL('image/jpeg', quality);
        console.log(`Compressing... Quality: ${quality.toFixed(1)}, Size: ${(compressed.length / 1024).toFixed(2)} KB`);
      }

      // เอา data:image/jpeg;base64, ออก ให้ได้แค่ Base64 string
      const base64Compressed = compressed.split(',')[1];

      const finalSizeKB = (base64Compressed.length / 1.33 / 1024).toFixed(2);
      console.log(`✅ Compression complete! Final size: ${finalSizeKB} KB`);

      resolve(base64Compressed);
    };

    img.onerror = () => {
      console.warn('⚠️ Image compression failed, using original');
      resolve(base64String);
    };
  });
};


// ============================================
// 🔍 Helper Functions สำหรับแยกข้อมูล
// ============================================

const extractMedicationName = (lines, fullText) => {
  let genericName = '';
  let tradeName = '';

  const syrupPattern = /([A-Z][A-Z\s]+?)\s+\d+(?:\.\d+)?\s*(?:gm?|mg)[\s\/]+\d+(?:\.\d+)?\s*m[lL]\s*(?:syr|syrup|sol|solution|susp|suspension)/i;
  const syrupMatch = fullText.match(syrupPattern);
  if (syrupMatch) {
    genericName = syrupMatch[1].trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    return { genericName, tradeName: '' };
  }

  const beforeDosagePattern = /([A-Z][A-Z\s]+?)\s+\d+(?:\.\d+)?\s*(?:gm?|mg|g)(?:\/|\s*\/\s*|\s+)\d+/i;
  const beforeDosageMatch = fullText.match(beforeDosagePattern);
  if (beforeDosageMatch) {
    genericName = beforeDosageMatch[1].trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    return { genericName, tradeName: '' };
  }

  const combinationPattern = /([A-Z][A-Z\s]+\+[A-Z\s]+)(?:\s+\d+(?:\.\d+)?\+\d+(?:\.\d+)?\s*(?:mg|g|ml))/i;
  const combMatch = fullText.match(combinationPattern);
  if (combMatch) {
    genericName = combMatch[1].trim()
      .split('+')
      .map(name => name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase())
      .join(' + ');
    return { genericName, tradeName: '' };
  }

  const pattern1 = /([A-Z][a-zA-Z]+)\s*\(([^)]*(?:mg|g|ml|mcg)[^)]*)\)\s*([a-zA-Z]+)/i;
  const match1 = fullText.match(pattern1);
  if (match1) {
    tradeName = match1[1].trim().replace(/["']/g, '');
    genericName = match1[3].trim().replace(/["']/g, '');
    return { genericName, tradeName };
  }

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

  for (let line of lines) {
    if (line.includes('ชื่อสามัญ') || line.toLowerCase().includes('generic')) {
      const match = line.match(/(?:ชื่อสามัญ|generic)[\s:]*([A-Z][a-zA-Z\s+]+)/i);
      if (match) {
        genericName = match[1].trim().replace(/["']/g, '');
      }
    }
  }

  return { genericName, tradeName };
};

const extractExpiryDate = (lines, fullText) => {
  const patterns = [
    /(?:exp\.?|expiry|หมดอายุ|ใช้ได้ถึง)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /(?:exp\.?|expiry|หมดอายุ)[\s:]*(\d{1,2}[\/\-\.]\d{2,4})/i,
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

const formatDate = (dateStr) => {
  let formatted = dateStr.replace(/[\-\.]/g, '/');
  const parts = formatted.split('/');

  if (parts.length >= 2) {
    let lastPart = parts[parts.length - 1];
    let yearNum = parseInt(lastPart, 10);

    if (lastPart.length === 4) {
      if (yearNum > 2500) {
        yearNum = yearNum - 543;
        parts[parts.length - 1] = yearNum.toString();
      }
    } else if (lastPart.length === 2) {
      const currentYear = new Date().getFullYear();

      const year19 = 1900 + yearNum;
      const year20 = 2000 + yearNum;
      const yearBE = 2500 + yearNum - 543;

      const allYears = [year19, year20, yearBE];
      const futureYears = allYears.filter(y => y >= currentYear && y <= currentYear + 10);

      if (futureYears.length > 0) {
        parts[parts.length - 1] = Math.min(...futureYears).toString();
      } else {
        const closest = allYears.reduce((prev, curr) =>
          Math.abs(curr - currentYear) < Math.abs(prev - currentYear) ? curr : prev
        );
        parts[parts.length - 1] = closest.toString();
      }
    }
  }

  // ============================================
  // 🆕 Convert to yyyy-MM-dd format for input[type=date]
  // ============================================
  let day = parts[0] || '01';
  let month = parts[1] || '01';
  let year = parts[2] || new Date().getFullYear();

  // Pad with zeros
  day = String(day).padStart(2, '0');
  month = String(month).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const extractLotNumber = (lines, fullText) => {
  const patterns = [
    /(?:lot\s*no\.?|lot\s*number|batch\s*no\.?)[\s:\.]*([A-Z0-9\-]+)/i,
    /(?:lot|batch)([A-Z0-9]+)/i,
  ];

  for (let pattern of patterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      let lotNum = match[1].trim();
      if (lotNum.length >= 2 && lotNum.length <= 20) {
        return lotNum.toUpperCase();
      }
    }
  }

  for (let line of lines) {
    const lineLower = line.toLowerCase();
    if (lineLower.includes('lotno') ||
      lineLower.includes('lot no') ||
      lineLower.includes('batch')) {

      const lotMatch = line.match(/(?:lotno\.?|lot\s*no\.?)[\s:]*([A-Z0-9]+)/i);
      if (lotMatch && lotMatch[1]) {
        return lotMatch[1].toUpperCase();
      }
    }
  }

  return '';
};

const extractDosage = (lines, fullText) => {
  let match = fullText.match(/(\d+(?:\.\d+)?)\s*(?:gm?|mg)\s*\/\s*(\d+(?:\.\d+)?)\s*m[lL]/i);
  if (match) {
    return `${match[1]} ${match[0].includes('gm') || match[0].includes('g ') ? 'g' : 'mg'}/${match[2]} mL`;
  }

  match = fullText.match(/(\d+(?:\.\d+)?\+\d+(?:\.\d+)?)\s*(mg|g|ml|mcg|microgram|unit)/i);
  if (match) {
    return match[0].trim();
  }

  match = fullText.match(/(\d+(?:\.\d+)?)\s*(mg|g|ml|mcg|microgram|unit|มก\.)/i);
  if (match) {
    return match[0].trim();
  }

  return '';
};

const extractDosageInstruction = (lines, fullText) => {
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
  
  if (text.includes('วันเว้นวัน') || text.match(/ทุก\s*48\s*ชั?(?:วโมง|ม)/)) return 'q48h';
  if (text.match(/ทุก\s*72\s*ชั?(?:วโมง|ม)/)) return 'q72h';
  
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

  if (text.includes('พร้อมอาหาร') || text.includes('หลังอาหารทันที')) return 'pc';
  if (text.includes('ก่อนนอน') || text.includes('hs') || text.includes('before bed')) return 'hs';
  if (text.includes('ก่อนอาหาร') || text.includes('ac') || text.includes('before meal')) return 'ac';
  if (text.includes('หลังอาหาร') || text.includes('pc') || text.includes('after meal')) return 'pc';
  if (text.includes('เมื่อต้องการ') || text.includes('prn') || text.includes('as needed')) return 'prn';
  if (text.includes('ทันที') || text.includes('stat') || text.includes('immediately')) return 'stat';

  return '';
};

const extractQuantity = (lines, fullText) => {
  let match = fullText.match(/(\d+)\s*m[lL](?:\s|\.|\)|$)/);
  if (match) {
    const num = parseInt(match[1]);
    if (num >= 30) {
      return `${num} mL`;
    }
  }
  
  match = fullText.match(/\[(\d+)\s*(?:เม็ด|แคปซูล|tablet|capsule|cap)\]/i);
  if (match) return match[1];
  
  match = fullText.match(/จำนวน[\s:]*(\d+)/i);
  if (match) return match[1];
  
  match = fullText.match(/[x×]\s*(\d+)\s*(?:เม็ด|แคปซูล|tablet|capsule)/i);
  if (match) return match[1];
  
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

  for (let line of lines) {
    const lineLower = line.toLowerCase();

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

  if (hospitalLines.length === 0) return '';

  hospitalLines.sort((a, b) => b.score - a.score);

  return hospitalLines[0].text;
};

const calculateHospitalScore = (line) => {
  let score = 0;

  if (line.includes('โรงพยาบาล')) {
    score += 10;
  }

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

  score += Math.floor(line.length / 10) * 2;

  if (/\d{2,}/.test(line)) {
    score += 2;
  }

  const trimmed = line.trim();
  if (trimmed === 'Hospital' ||
    trimmed === 'hospital' ||
    trimmed === 'โรงพยาบาล' ||
    trimmed.length < 10) {
    score -= 10;
  }

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