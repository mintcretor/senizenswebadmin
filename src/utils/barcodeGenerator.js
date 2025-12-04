import JsBarcode from 'jsbarcode';

export const generateBarcode = async (hn) => {
  if (!hn) {
    return null;
  }

  try {
    // สร้าง canvas element ชั่วคราว
    const canvas = document.createElement('canvas');
    
    // สร้าง barcode บน canvas
    JsBarcode(canvas, hn, {
      format: 'CODE128',
      width: 2,
      height: 50,
      displayValue: true
    });

    // แปลง canvas เป็น base64 (PNG image)
    const imageData = canvas.toDataURL('image/png');
    
    // ตัด "data:image/png;base64," ออก เหลือแค่ base64 string
    const base64String = imageData.split(',')[1];
    
    console.log('Barcode generated successfully');
    return base64String;
  } catch (error) {
    console.error('Error generating barcode:', error);
    return null;
  }
};