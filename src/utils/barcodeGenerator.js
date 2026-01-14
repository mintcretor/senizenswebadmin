import JsBarcode from 'jsbarcode';

export const generateBarcode = async (hn) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 120;
      
      JsBarcode(canvas, hn, {
        format: 'CODE128',
        width: 2.5,
        height: 60,
        displayValue: true,
        fontSize: 16,
        margin: 10,
      });

      // ✅ ส่ง base64 string โดยตรง (ไม่ต้องแปลง)
      const base64 = canvas.toDataURL('image/png');
      console.log('Barcode base64 generated:', base64.substring(0, 50) + '...');
      resolve(base64);
    } catch (error) {
      console.error('Error generating barcode:', error);
      reject(error);
    }
  });
};