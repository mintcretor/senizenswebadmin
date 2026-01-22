import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import JsBarcode from 'jsbarcode';

// Helper functions
const formatThaiDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = (date.getFullYear() + 543).toString();
  return `${convertToEnglishNumber(day)}/${convertToEnglishNumber(month)}/${convertToEnglishNumber(year)}`;
};

const formatThaiTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${convertToEnglishNumber(hours)}:${convertToEnglishNumber(minutes)}:${convertToEnglishNumber(seconds)}`;
};

const convertToEnglishNumber = (str) => {
  if (!str) return str;
  const thaiNumbers = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = str.toString();
  thaiNumbers.forEach((thai, index) => {
    result = result.replace(new RegExp(thai, 'g'), englishNumbers[index]);
  });
  return result;
};

const sanitizeAllNumbers = (obj) => {
  if (!obj) return obj;
  const sanitized = { ...obj };
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] && typeof sanitized[key] === 'string') {
      sanitized[key] = convertToEnglishNumber(sanitized[key]);
    }
  });
  return sanitized;
};

const wrapNumbers = (text) => {
  if (!text) return '';
  const str = String(text);
  return str.replace(/[0-9]/g, (match) => `<span style="font-family: 'Arial', sans-serif; font-size: 0.8em;">${match}</span>`);
};

const generateBarcodeBase64 = (text) => {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, {
      format: 'CODE128',
      width: 2,
      height: 50,
      displayValue: false,
      margin: 5
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Barcode generation error:', error);
    return null;
  }
};

const loadTHSarabunFont = () => {
  return new Promise((resolve) => {
    if (document.fonts && document.fonts.check) {
      if (document.fonts.check('16px TH SarabunPSK')) {
        resolve();
        return;
      }
    }

    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'TH SarabunPSK';
        font-style: normal;
        font-weight: 400;
        src: url('https://cdn.jsdelivr.net/npm/sarabun-psk@1.0.0/TH_SarabunPSK.woff2') format('woff2'),
             url('https://cdn.jsdelivr.net/npm/sarabun-psk@1.0.0/TH_SarabunPSK.woff') format('woff');
        font-feature-settings: 'lnum' 1;
      }
      @font-face {
        font-family: 'TH SarabunPSK';
        font-style: normal;
        font-weight: 700;
        src: url('https://cdn.jsdelivr.net/npm/sarabun-psk@1.0.0/TH_SarabunPSK_Bold.woff2') format('woff2'),
             url('https://cdn.jsdelivr.net/npm/sarabun-psk@1.0.0/TH_SarabunPSK_Bold.woff') format('woff');
        font-feature-settings: 'lnum' 1;
      }
    `;
    document.head.appendChild(style);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setTimeout(resolve, 100);
      });
    } else {
      setTimeout(resolve, 500);
    }
  });
};

const loadImageAsBase64 = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imagePath;
  });
};

// CSS styles สำหรับ inline elements
const underlineStyle = 'display: inline-block; padding-left: 5px; padding-right: 2px; padding-bottom: 4px; border-bottom: 1px dotted #000; vertical-align: bottom; margin-left: 5px;';
const checkboxStyle = 'border: 1px solid #000; display: inline-block; width: 12px; height: 12px; vertical-align: middle; margin-right: 3px;';

// Helper functions สำหรับสร้าง HTML elements
const createUnderline = (value, width = '200px') => {
  return `<span style="${underlineStyle} width: ${width}; min-width: ${width};">${value || ''}</span>`;
};

const createCheckbox = () => {
  return `<span style="${checkboxStyle} margin-right: 3px;"></span>`;
};

const createField = (label, value, width = '200px', engLabel = '') => {
  return `
    <div style="margin: 10px 0;">
      <span>${label}</span>
      ${createUnderline(value, width)}
      ${engLabel ? `<span style="margin-left: 20px;">${engLabel}</span>` : ''}
    </div>
  `;
};

export const exportPatientRegistrationPDF = async (patientData, setError) => {
  try {
    console.log('Starting PDF export...');
    console.log('Patient data:', patientData);

    const cleanedData = sanitizeAllNumbers(patientData);
    await loadTHSarabunFont();
    console.log('TH SarabunPSK font loaded');

    const now = new Date();
    const dateNow = formatThaiDate(now);
    const timeNow = formatThaiTime(now);

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm';
    container.style.minHeight = '297mm';
    container.style.padding = '0';
    container.style.margin = '0';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = "'TH SarabunPSK', 'Sarabun', sans-serif";
    container.style.fontSize = '14px';
    container.style.lineHeight = '1.4';
    container.style.fontVariantNumeric = 'lining-nums';

    let barcodeDataUrl = '';
    if (cleanedData.hn) {
      console.log('Generating barcode for HN:', cleanedData.hn);
      barcodeDataUrl = generateBarcodeBase64(cleanedData.hn);
    }

    let logoDataUrl = '';
    try {
      logoDataUrl = await loadImageAsBase64('/images/logo.png');
      console.log('Logo loaded successfully');
    } catch (error) {
      console.warn('Logo not found, continuing without logo');
    }

    const fullNameTh = `${cleanedData.prename || ''} ${cleanedData.first_name || ''} ${cleanedData.last_name || ''}`.trim();
    const fullNameEn = `${cleanedData.first_name_en || ''} ${cleanedData.last_name_en || ''}`.trim();
    const birthDateDisplay = cleanedData.birth_date ? cleanedData.birth_date.split('T')[0] : '';
    const ageDisplay = wrapNumbers(cleanedData.age || '');
    const hnDisplay = wrapNumbers(cleanedData.hn || '');
    const phoneDisplay = wrapNumbers(cleanedData.phone || '');
    const houseNumberDisplay = wrapNumbers(cleanedData.house_number || '');
    const villageDisplay = wrapNumbers(cleanedData.village || '');
    const dateNowWrapped = wrapNumbers(dateNow);
    const timeNowWrapped = wrapNumbers(timeNow);

    container.innerHTML = `
      <div style="padding: 15mm; font-size: 14px; line-height: 1.4; width: 210mm; min-height: 297mm; box-sizing: border-box; font-family: 'TH SarabunPSK', 'Sarabun', sans-serif; font-variant-numeric: lining-nums;">
        
        <!-- Header Section -->
        <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 0px;">
          <tr>
            <td style="width: 120px; vertical-align: top; border: none;">
              ${logoDataUrl ? `
                <img src="${logoDataUrl}" style="width: 100px; height: auto;" alt="SENIZENS Logo" />
              ` : `
                <div style="width: 100px; height: 80px; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999;">
                  SENIZENS<br/>LOGO
                </div>
              `}
            </td>
            <td style="vertical-align: top; padding-left: 10px; border: none;">
              <div style="font-size: 11px; line-height: 1.3;">
                <div style="font-weight: bold;">CODE : OPDCARD</div>
                <div style="font-weight: bold;">PROG : OPD</div>
                <div style="margin-top: 5px;">คลินิกเวชกรรม เดอะซีนิเซ่นส์ เลขใบอนุญาต ${wrapNumbers('10101005964')}</div>
                <div>เลขที่ ${wrapNumbers('446')} ถนนบางแวก แขวงบางแวก เขตภาษีเจริญ กรุงเทพฯ ${wrapNumbers('10160')}</div>
                <div>Tel : ${wrapNumbers('02-4120999')} Mobile : ${wrapNumbers('064-2496818')}</div>
              </div>
            </td>
            <td style="width: 220px; vertical-align: top; text-align: right; padding-right: 0; border: none;">
              <div style="font-size: 13px; margin-bottom: 5px;">ใบลงทะเบียนผู้ป่วย</div>
              <div style="font-size: 11px;">Patient Registration Form</div>
              <div style="margin-top: 10px;">
                <table style="float: right; text-align: left; font-size: 11px; border: none;">                                                
                  <tr>
                    <td style="width: 55px; text-align: left; border: none;">Status</td>
                    <td style="width: 15px; text-align: left; border: none;">${createCheckbox()}</td>
                    <td style="border: none;">ทั่วไป(General)</td>
                  </tr>
                  <tr>
                    <td style="border: none;"></td>
                    <td style="padding-right: 5px; border: none;">${createCheckbox()}</td>
                    <td style="border: none;">ฉุกเฉิน(Emergency)</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>

        <!-- HN Section -->
        <div style="margin: 15px 0; padding: 10px 0;">
          <table style="width: 100%; border-collapse: collapse; border: none;">
            <tr>
              <td style="width: 50%; vertical-align: top; border: none; text-align: left;">
                <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">H.N. ${hnDisplay || createUnderline('', '150px')}</div>
                ${barcodeDataUrl ? `
                  <div style="margin-top: 5px;">
                    <img src="${barcodeDataUrl}" style="height: 50px; width: auto;" alt="Barcode" />
                    <div style="font-size: 12px; padding-left: 35px; margin-top: 2px;">${hnDisplay}</div>
                  </div>
                ` : ''}
              </td>
              <td style="width: 50%; text-align: right; vertical-align: top; font-size: 14px; border: none;">
                <div style="margin-bottom: 5px;">วันที่/DATE : ${dateNowWrapped}</div>
                <div>เวลา/TIME : ${timeNowWrapped}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Form Fields -->
        ${createField('ชื่อ-สกุล (นาย/นาง/นางสาว/ด.ช./ด.ญ.)', fullNameTh, '400px')}
        ${createField('Name(Mr./Mrs./Miss/Mast./Girl)', fullNameEn, '430px')}
        ${createField('เพศ/SEX : ', cleanedData.gender, '100px')}

        <div style="margin: 15px 0;">
          <div style="font-weight: bold; margin-bottom: 5px; text-align: center;">ที่อยู่ปัจจุบันที่สามารถติดต่อได้(Present address)</div>
          <div style="margin: 5px 0;">
            ที่อยู่/ADDRESS : ${createUnderline(houseNumberDisplay, '60px')}
            หมู่/MOO : ${createUnderline(villageDisplay, '60px')}
            ตำบล/Sub-district : ${createUnderline(cleanedData.sub_district_name, '120px')}
          </div>
          <div style="margin: 5px 0;">
            อำเภอ/Region : ${createUnderline(cleanedData.district_name, '120px')}
            จังหวัด/Area : ${createUnderline(cleanedData.province_name, '120px')}
          </div>
        </div>

        <div style="margin: 10px 0;">
          <span>โทรศัพท์/TEL : </span>
          ${createUnderline(phoneDisplay, '150px')}
          <span style="margin-left: 20px;">ต่อ/Ext : </span>
          ${createUnderline('', '60px')}
          <span style="margin-left: 20px;">มือถือ/Mobile : </span>
          ${createUnderline(phoneDisplay, '150px')}
        </div>

        <div style="margin: 10px 0;">
          <span>วันเดือนปีเกิด/Date of Birth : </span>
          ${createUnderline(wrapNumbers(birthDateDisplay), '120px')}
          <span style="margin-left: 20px;">อายุ/AGE : </span>
          ${createUnderline(ageDisplay, '50px')}
          <span style="margin-left: 5px;">ปี/Yrs.</span>
          <span style="margin-left: 20px;">สถานภาพ/STATUS : </span>
          ${createUnderline('', '100px')}
        </div>

        <div style="margin: 10px 0;">
          <span>ศาสนา/Religion : </span>
          ${createUnderline(cleanedData.religion, '150px')}
          <span style="margin-left: 40px;">สัญชาติ/NATIONALITY : </span>
          ${createUnderline(cleanedData.nationality, '120px')}
        </div>

        <div style="margin: 10px 0;">
          <span>อาชีพ/OCC. : </span>
          ${createUnderline(cleanedData.ethnicity, '180px')}
          <span style="margin-left: 40px;">E-mail : </span>
          ${createUnderline(cleanedData.email, '250px')}
        </div>

        <div style="margin: 15px 0;">
          <div style="margin-bottom: 5px;">
            <span>แสดงบัตรประชาชน/บัตรอื่นๆ </span>
            <span style="margin-left: 10px;">${createCheckbox()} มี/YES</span>
            <span style="margin-left: 10px;">${createCheckbox()} ไม่มี/NO</span>
            <span style="margin-left: 10px;">ได้รับการแจ้งให้สำเนาบัตรมาภายหลัง วันหมดอายุ</span>
            ${createUnderline('', '100px')}
          </div>
        </div>

        <div style="margin: 10px 0;">
          <span>ID Card/Passport </span>
          ${createUnderline(wrapNumbers(cleanedData.id_card), '200px')}
          <span style="margin-left: 20px;">From Photocopy</span>
          ${createUnderline('', '100px')}
          <span style="margin-left: 10px;">Date of expiry</span>
          ${createUnderline('', '100px')}
        </div>

        <div style="margin: 10px 0;">
          <div>ขณะที่ยังไม่มีบัตรแสดงตน ทางโรงพยาบาลขอสงวนสิทธิการออกเอกสารที่สามารถรับรองทางกฏหมายได้</div>
          <div>If you do not present legal documents for indentification, such as passport or ID card the hospital is unable to privide any medical certificates to be used for legal means.</div>
        </div>

        <div style="margin: 15px 0;">
          <div style="margin-bottom: 5px;">
            ${createCheckbox()} <span>ไม่ทราบ/Do not know</span>
            <span style="margin-left: 20px;">${createCheckbox()} <span>ไม่แพ้</span></span>
            <span style="margin-left: 20px;">${createCheckbox()} <span>แพ้ยา</span></span>
          </div>
        </div>

        <div style="margin: 10px 0;">
          <span>ระบุชื่อยา/สารที่แพ้ Sensitive to </span>
          ${createUnderline('', '350px')}
        </div>

        <div style="margin: 10px 0;">
          <span>กรณีฉุกเฉินติดต่อญาติ ชื่อ/สกุล </span>
          ${createUnderline('', '250px')}
          <span style="margin-left: 20px;">Blood Group / หมู่เลือด</span>
          ${createUnderline('', '80px')}
        </div>

        <div style="margin: 10px 0;">
          <span>In Case of emergency please notify Mr./Mrs./Miss </span>
          ${createUnderline('', '300px')}
        </div>

        <div style="margin: 10px 0;">
          <span>ที่อยู่/Home Address </span>
          ${createUnderline('', '500px')}
        </div>

        <div style="margin: 10px 0;">
          <span>โทรศัพท์/Telephone Number </span>
          ${createUnderline('', '450px')}
        </div>

        <div style="margin: 15px 0; font-weight: bold;">
          <div>ท่านมีสิทธิเบิกค่ารักษาพยาบาลได้จาก/bill to be paid by :</div>
        </div>

        <div style="margin: 10px 0 10px 20px;">
          <table style="width: 100%; border-collapse: collapse; border: none;">
            <tr>
              <td style="width: 50%; vertical-align: top; border: none;">
                <div style="margin-bottom: 5px;">${createCheckbox()} <span>จ่ายเอง/Self pay</span></div>
                <div style="margin-bottom: 5px;">${createCheckbox()} <span>ประกันสังคม/Social security</span></div>
                <div style="margin-bottom: 5px;">
                  ${createCheckbox()} <span>บริษัทประกันสุขภาพ/Health insurance company</span>
                  ${createUnderline('', '80px')}
                </div>
              </td>
              <td style="width: 50%; vertical-align: top; border: none;">
                <div style="margin-bottom: 5px;">
                  ${createCheckbox()} <span>ราชการ/Government service</span>
                  ${createUnderline('', '100px')}
                </div>
                <div style="margin-bottom: 5px;">
                  ${createCheckbox()} <span>สวัสดิการบริษัท/contract company</span>
                  ${createUnderline('', '80px')}
                </div>
              </td>
            </tr>
          </table>
        </div>

        <div style="margin: 15px 0; font-weight: bold;">
          <div>ท่านต้องการพบแพทย์ท่านใด/Please notify your preferance :</div>
        </div>

        <div style="margin: 10px 0 10px 20px;">
          <div style="margin-bottom: 5px;">
            ${createCheckbox()} <span>ระบุชื่อแพทย์/Your selected physician</span>
            ${createUnderline('', '350px')}
          </div>
          <div style="margin-bottom: 5px;">
            ${createCheckbox()} <span>แพทย์ที่ทางโรงพยาบาลแนะนำ/Physician recommended by hospital</span>
            ${createUnderline('', '231px')}
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(container);
    await new Promise(resolve => setTimeout(resolve, 200));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    document.body.removeChild(container);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));

    const fileName = `ใบลงทะเบียน_${cleanedData.first_name || 'patient'}_${cleanedData.hn || 'unknown'}.pdf`;
    pdf.save(fileName);

    console.log('PDF saved successfully:', fileName);
    alert('ส่งออก PDF สำเร็จ!');
    if (setError) setError(null);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    console.error('Error stack:', error.stack);
    const errorMsg = `เกิดข้อผิดพลาดในการ export PDF: ${error.message}`;
    if (setError) setError(errorMsg);
    alert(`Error: ${error.message}`);
  }
};