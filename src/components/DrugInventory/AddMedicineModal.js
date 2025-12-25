import React, { useState, useEffect } from 'react';
import { X, Search, Loader } from 'lucide-react';
import { performOCR } from '../../services/ocrService'; // ← ใช้ ocrService ของคุณ

// Mock data for autocomplete
const mockMedicineList = [
  { id: 1, name: 'Paracetamol', dose: '500mg', unit: 'เม็ด' },
  { id: 2, name: 'Amoxicillin', dose: '250mg', unit: 'แคปซูล' },
  { id: 3, name: 'Ibuprofen', dose: '400mg', unit: 'เม็ด' },
  { id: 4, name: 'Omeprazole', dose: '20mg', unit: 'แคปซูล' },
  { id: 5, name: 'Metformin', dose: '500mg', unit: 'เม็ด' },
  { id: 6, name: 'Lisinopril', dose: '5mg', unit: 'เม็ด' },
];

function AddMedicineModal({ 
  onClose, 
  onSave, 
  editingMedicine = null
}) {
  const isEditMode = !!editingMedicine;

  const [formData, setFormData] = useState({
    id: editingMedicine?.id || null,
    medication_name: editingMedicine?.medication_name || '',
    generic_name: editingMedicine?.generic_name || '',
    trade_name: editingMedicine?.trade_name || '',
    dosage: editingMedicine?.dosage || '',
    route: editingMedicine?.route || '',
    dosage_instruction: editingMedicine?.dosage_instruction || '',
    frequency: editingMedicine?.frequency || '',
    timing: editingMedicine?.timing || '',
    quantity: editingMedicine?.quantity || '',
    last_dose: editingMedicine?.last_dose || '',
    special_instruction: editingMedicine?.special_instruction || '',
    is_external: editingMedicine?.is_external || false,
    external_hospital: editingMedicine?.external_hospital || '',
    status: editingMedicine?.status || 'continue_same',
    adjusted_dosage: editingMedicine?.adjusted_dosage || '',
    has_changes: editingMedicine?.has_changes || false,
    change_reason: editingMedicine?.change_reason || '',
    image_url: null,
    expiry_date: editingMedicine?.expiry_date || '',
    lot_number: editingMedicine?.lot_number || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [imagePreview, setImagePreview] = useState(editingMedicine?.image_url || null);

  // Autocomplete states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredMedicines, setFilteredMedicines] = useState([]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.medication_name.trim()) {
      newErrors.medication_name = 'โปรดระบุชื่อยา';
    }
    if (!formData.dosage.trim()) {
      newErrors.dosage = 'โปรดระบุขนาดยา';
    }
    if (!formData.dosage_instruction.trim()) {
      newErrors.dosage_instruction = 'โปรดระบุวิธีใช้ยา';
    }
    if (!formData.frequency.trim()) {
      newErrors.frequency = 'โปรดระบุความถี่';
    }
    if (!formData.status) {
      newErrors.status = 'โปรดเลือกสถานะการใช้ยา';
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await onSave(formData);
      setLoading(false);
    } catch (error) {
      console.error('Error saving medicine:', error);
      setErrors({ submit: 'เกิดข้อผิดพลาดในการบันทึกยา' });
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Autocomplete handler
  const handleMedicineNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, medication_name: value }));

    if (errors.medication_name) {
      setErrors(prev => ({ ...prev, medication_name: '' }));
    }

    // Filter medicines based on input
    if (value.trim()) {
      const filtered = mockMedicineList.filter(med =>
        med.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMedicines(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredMedicines([]);
      setShowSuggestions(false);
    }
  };

  // Select medicine from suggestions
  const handleSelectMedicine = (medicine) => {
    setFormData(prev => ({
      ...prev,
      medication_name: medicine.name,
      dosage: medicine.dose
    }));
    setShowSuggestions(false);
    setFilteredMedicines([]);
  };

  // ============================================
  // 🆕 ฟังก์ชัน: จัดการเมื่อเลือกรูป
  // ============================================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image_url: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // เรียก OCR ให้อัตโนมัติ
        performOCROnImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ============================================
  // 🆕 ฟังก์ชัน: เรียก OCR และ auto-fill form
  // ============================================
  const performOCROnImage = async (imageData) => {
    try {
      setOcrLoading(true);
      setOcrStatus('🔍 กำลังอ่านข้อมูลจากรูป...');

      // เปลี่ยน Data URL เป็น Base64
      const base64String = imageData.split(',')[1];
      
      // เรียก performOCR จาก ocrService ของคุณ
      const result = await performOCR(base64String);

      console.log('OCR Result:', result);

      // ✅ AUTO FILL ข้อมูลจากผลลัพธ์ OCR
      setFormData(prev => ({
        ...prev,
        medication_name: result.medicationName || result.genericName || prev.medication_name,
        generic_name: result.genericName || prev.generic_name,
        trade_name: result.tradeName || prev.trade_name,
        dosage: result.dosage || prev.dosage,
        dosage_instruction: result.dosageInstruction || prev.dosage_instruction,
        frequency: result.frequency || prev.frequency,
        timing: result.timing || prev.timing,
        quantity: result.quantity || prev.quantity,
        special_instruction: result.specialInstruction || prev.special_instruction,
        expiry_date: result.expiryDate || prev.expiry_date,
        lot_number: result.lotNumber || prev.lot_number,
      }));

      setOcrStatus('✅ อ่านข้อมูลเสร็จสิ้น! กรุณาตรวจสอบความถูกต้อง');
      
      // ลบ status หลัง 3 วินาที
      setTimeout(() => {
        setOcrStatus('');
      }, 3000);

      setOcrLoading(false);
    } catch (error) {
      console.error('OCR Error:', error);
      setOcrStatus('❌ ไม่สามารถอ่านข้อมูล: ' + error.message);
      setOcrLoading(false);
      
      // ลบ status หลัง 4 วินาที
      setTimeout(() => {
        setOcrStatus('');
      }, 4000);
    }
  };

  // ============================================
  // 🆕 ฟังก์ชัน: ลบรูปที่เลือก
  // ============================================
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_url: null }));
    setImagePreview(null);
    setOcrStatus('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-8">
        {/* HEADER */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 bg-blue-500">
          <div>
            <h3 className="font-bold text-lg text-white">
              {isEditMode ? '📝 แก้ไขยา' : '➕ เพิ่มรายการยา'}
            </h3>
            <p className="text-sm text-blue-100 mt-1">
              {isEditMode ? 'แก้ไขข้อมูลยา' : 'กรอกข้อมูลยาให้ครบถ้วน'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* ============================================
              🆕 IMAGE UPLOAD - with OCR
              ============================================ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📷 รูปของยา
            </label>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-6xl mb-2">📷</div>
                  <p className="text-blue-600 font-medium mb-1">ถ่ายรูป / เลือกรูปซองยา</p>
                  <p className="text-gray-500 text-sm">ระบบจะอ่านข้อมูลอัตโนมัติ</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={ocrLoading}
              />
              {!imagePreview && (
                <label
                  htmlFor="image-upload"
                  className="mt-3 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition disabled:opacity-50"
                >
                  เลือกรูป
                </label>
              )}
            </div>

            {/* ============================================
                🆕 OCR Status Message
                ============================================ */}
            {ocrStatus && (
              <div className={`mt-3 p-3 rounded text-sm font-medium text-center ${
                ocrStatus.includes('❌') 
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : ocrStatus.includes('✅')
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-blue-100 text-blue-700 border border-blue-300'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {ocrLoading && <Loader size={16} className="animate-spin" />}
                  {ocrStatus}
                </div>
              </div>
            )}
          </div>

          {/* MEDICATION NAME */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อยา *
            </label>
            <input
              type="text"
              value={formData.medication_name}
              onChange={handleMedicineNameChange}
              placeholder="เช่น Paracetamol"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {errors.medication_name && <p className="text-xs text-red-600 mt-1">{errors.medication_name}</p>}

            {/* AUTOCOMPLETE SUGGESTIONS */}
            {showSuggestions && filteredMedicines.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-50">
                {filteredMedicines.map(med => (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => handleSelectMedicine(med)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 transition"
                  >
                    <div className="font-medium text-sm text-gray-900">{med.name}</div>
                    <div className="text-xs text-gray-600">{med.dose}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GENERIC NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อเสบียง (Generic Name)
            </label>
            <input
              type="text"
              name="generic_name"
              value={formData.generic_name}
              onChange={handleChange}
              placeholder="เช่น Paracetamol"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* TRADE NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อการค้า (Trade Name)
            </label>
            <input
              type="text"
              name="trade_name"
              value={formData.trade_name}
              onChange={handleChange}
              placeholder="เช่น Tylenol"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* DOSAGE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ขนาดยา *
            </label>
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              placeholder="เช่น 500mg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {errors.dosage && <p className="text-xs text-red-600 mt-1">{errors.dosage}</p>}
          </div>

          {/* ROUTE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เส้นทาง (Route)
            </label>
            <select
              name="route"
              value={formData.route}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">เลือก...</option>
              <option value="po">PO - ป้อนทางปาก (Oral)</option>
              <option value="im">IM - ฉีดในกล้าม (Intramuscular)</option>
              <option value="iv">IV - ฉีดเข้าหลอดเลือด (Intravenous)</option>
              <option value="sc">SC - ฉีดใต้ผิวหนัง (Subcutaneous)</option>
              <option value="topical">Topical - ทา (Topical)</option>
              <option value="sublingual">SL - ใต้ลิ้น (Sublingual)</option>
            </select>
          </div>

          {/* DOSAGE INSTRUCTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วิธีใช้ยา *
            </label>
            <textarea
              name="dosage_instruction"
              value={formData.dosage_instruction}
              onChange={handleChange}
              placeholder="เช่น ใช้ลดไข้ ปวด"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
            {errors.dosage_instruction && <p className="text-xs text-red-600 mt-1">{errors.dosage_instruction}</p>}
          </div>

          {/* FREQUENCY */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ความถี่ *
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">เลือก...</option>
              <option value="OD">1x/วัน</option>
              <option value="bid">2x/วัน</option>
              <option value="tid">3x/วัน</option>
              <option value="qid">4x/วัน</option>
              <option value="q6h">ทุก 6 ชั่วโมง</option>
              <option value="q8h">ทุก 8 ชั่วโมง</option>
              <option value="q12h">ทุก 12 ชั่วโมง</option>
              <option value="prn">ตามความจำเป็น</option>
            </select>
            {errors.frequency && <p className="text-xs text-red-600 mt-1">{errors.frequency}</p>}
          </div>

          {/* TIMING */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🗒️ เวลา
            </label>
            <select
              name="timing"
              value={formData.timing}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">เลือก...</option>
              <option value="ac">ac - ก่อนอาหาร (Ante cibum)</option>
              <option value="pc">pc - หลังอาหาร (Post cibum)</option>
              <option value="hs">hs - ก่อนนอน (Hora somni)</option>
              <option value="prn">prn - เมื่อต้องการ (Pro re nata)</option>
              <option value="stat">stat - ทันที (Statim)</option>
              <option value="sos">S.O.S - เมื่อจำเป็น (Si opus sit)</option>
            </select>
          </div>

          {/* QUANTITY */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📦 จำนวน
            </label>
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="จำนวน"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* EXPIRY DATE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 วันหมดอายุ
            </label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* LOT NUMBER */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏷️ เลขชุด (Lot Number)
            </label>
            <input
              type="text"
              name="lot_number"
              value={formData.lot_number}
              onChange={handleChange}
              placeholder="เช่น A12345"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* SPECIAL INSTRUCTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⚠️ คำแนะนำพิเศษ
            </label>
            <textarea
              name="special_instruction"
              value={formData.special_instruction}
              onChange={handleChange}
              placeholder="เช่น ห้ามรับประทานกับนม"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>

          {/* IS EXTERNAL */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="is_external"
              name="is_external"
              checked={formData.is_external}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_external" className="flex-1 cursor-pointer">
              <p className="font-medium text-gray-900">ยารับจากภายนอก</p>
              <p className="text-sm text-gray-600">ติ๊กถ้ายาจากโรงพยาบาลอื่น</p>
            </label>
          </div>

          {/* EXTERNAL HOSPITAL */}
          {formData.is_external && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สถาบันภายนอก
              </label>
              <input
                type="text"
                name="external_hospital"
                value={formData.external_hospital}
                onChange={handleChange}
                placeholder="ชื่อโรงพยาบาล/สถาบัน"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          )}

          {/* STATUS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              สถานะการใช้ยา *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'continue_same' }))}
                className={`p-4 border-2 rounded-lg transition ${formData.status === 'continue_same'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-green-300'
                  }`}
              >
                <div className="text-3xl mb-2">✓</div>
                <p className="font-medium text-gray-900 text-sm">ใช้ต่อขนาดเดิม</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'continue_different' }))}
                className={`p-4 border-2 rounded-lg transition ${formData.status === 'continue_different'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-300 bg-white hover:border-yellow-300'
                  }`}
              >
                <div className="text-3xl mb-2">⚡</div>
                <p className="font-medium text-gray-900 text-sm">ใช้ต่อปรับขนาด</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'temporarily_stop' }))}
                className={`p-4 border-2 rounded-lg transition ${formData.status === 'temporarily_stop'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 bg-white hover:border-orange-300'
                  }`}
              >
                <div className="text-3xl mb-2">⏸</div>
                <p className="font-medium text-gray-900 text-sm">พักใช้ยาไว้</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'discontinued' }))}
                className={`p-4 border-2 rounded-lg transition ${formData.status === 'discontinued'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-white hover:border-red-300'
                  }`}
              >
                <div className="text-3xl mb-2">✕</div>
                <p className="font-medium text-gray-900 text-sm">ไม่ใช้ต่อ</p>
              </button>
            </div>
            {errors.status && <p className="text-xs text-red-600 mt-2">{errors.status}</p>}
          </div>

          {/* HAS CHANGES */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="has_changes"
              name="has_changes"
              checked={formData.has_changes}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="has_changes" className="flex-1 cursor-pointer">
              <p className="font-medium text-gray-900">มีการเปลี่ยนแปลงการใช้ยา</p>
              <p className="text-sm text-gray-600">ติ๊กถ้ามีการเปลี่ยนแปลง</p>
            </label>
          </div>

          {/* ADJUSTED DOSAGE & CHANGE REASON */}
          {formData.has_changes && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ขนาดใหม่
                </label>
                <input
                  type="text"
                  name="adjusted_dosage"
                  value={formData.adjusted_dosage}
                  onChange={handleChange}
                  placeholder="เช่น 250mg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เหตุผลการเปลี่ยน
                </label>
                <textarea
                  name="change_reason"
                  value={formData.change_reason}
                  onChange={handleChange}
                  placeholder="เหตุผลการเปลี่ยนแปลง"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>
            </>
          )}

          {/* ERROR MESSAGE */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : (isEditMode ? '💾 บันทึกการแก้ไข' : '➕ เพิ่มยา')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMedicineModal;